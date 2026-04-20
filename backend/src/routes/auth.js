import bcrypt from "bcrypt";
import dotenv from "dotenv";
import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import protect from "../middleware/protect.js";
import {
  clearAuthCookie,
  getClientUrl,
  sanitizeUser,
  setAuthCookie,
} from "../utils/auth.js";
import {
  buildDefaultName,
  normalizeEmail,
  validateLoginPayload,
  validateSignupPayload,
} from "../utils/validation.js";

dotenv.config();

const router = express.Router();

const googleAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL,
);

if (googleAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleEmail = normalizeEmail(profile.emails?.[0]?.value || "");
          const googleAvatar = profile.photos?.[0]?.value || "";
          const displayName = profile.displayName?.trim() || buildDefaultName(googleEmail);

          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email: googleEmail }],
          }).select("+password");

          if (!user) {
            user = await User.create({
              googleId: profile.id,
              name: displayName,
              email: googleEmail,
              avatar: googleAvatar,
            });
          } else {
            if (!user.googleId) {
              user.googleId = profile.id;
            }

            if (!user.avatar && googleAvatar) {
              user.avatar = googleAvatar;
            }

            if (!user.name && displayName) {
              user.name = displayName;
            }

            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
}

const ensureGoogleAuthConfigured = (req, res, next) => {
  if (!googleAuthConfigured) {
    return res.status(503).json({
      message: "Google authentication is not configured on the server.",
    });
  }

  return next();
};

const sendAuthSuccess = (res, user, statusCode, message) => {
  setAuthCookie(res, user._id);
  res.status(statusCode).json({
    message,
    user: sanitizeUser(user),
  });
};

router.get(
  "/google",
  ensureGoogleAuthConfigured,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    session: false,
  }),
);

router.get(
  "/google/callback",
  ensureGoogleAuthConfigured,
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${getClientUrl()}/signin?authError=google`,
  }),
  (req, res) => {
    setAuthCookie(res, req.user._id);
    res.redirect(`${getClientUrl()}/events`);
  },
);

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body ?? {};
    const validationMessage = validateSignupPayload({ email, password, name });

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (existingUser) {
      if (existingUser.googleId && !existingUser.password) {
        return res.status(409).json({
          message:
            "An account with this email already uses Google. Continue with Google to sign in.",
        });
      }

      return res.status(409).json({
        message: "That email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: name?.trim() || buildDefaultName(normalizedEmail),
    });

    return sendAuthSuccess(
      res,
      user,
      201,
      "Account created successfully.",
    );
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Server error while creating the account.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    const validationMessage = validateLoginPayload({ email, password });

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!user) {
      return res.status(404).json({
        message: "Account not found. Please sign up first.",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message:
          "This account uses Google sign-in. Continue with Google to access it.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Incorrect email or password.",
      });
    }

    return sendAuthSuccess(
      res,
      user,
      200,
      "Login successful. Welcome back.",
    );
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error during login.",
    });
  }
});

router.get("/me", protect, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out successfully." });
});

export default router;
