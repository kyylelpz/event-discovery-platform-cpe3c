import jwt from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "token";
const AUTH_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const getClientUrl = () =>
  process.env.CLIENT_URL?.trim() || "http://localhost:5173";

export const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: AUTH_DURATION_MS,
});

export const signAuthToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

export const setAuthCookie = (res, userId) => {
  res.cookie(AUTH_COOKIE_NAME, signAuthToken(userId), getAuthCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...getAuthCookieOptions(),
    maxAge: undefined,
  });
};

export const sanitizeUser = (user) => ({
  id: user._id?.toString(),
  name: user.name,
  email: user.email,
  avatar: user.avatar || "",
  location: user.location || "",
  preferences: Array.isArray(user.preferences) ? user.preferences : [],
  hasGoogleAuth: Boolean(user.googleId),
});
