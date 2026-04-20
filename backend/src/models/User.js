import mongoose from "mongoose";
import { userDB } from "../routes/db.js"; 

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true, index: true },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      minlength: 8,
      maxlength: 255,
      select: false,
    },
    avatar: { type: String, trim: true },
    location: { type: String, trim: true },
    preferences: [{ type: String }],
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true
    },

    // only for local accounts
    password: {
      type: String 
    },

    // auth source
    provider: {
      type: String,
      enum: ["local", "google"],
      enum: ["local", "google"],
      required: true
    },

    // only for Google accounts
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },

    avatar: String,
    isEmailVerified: {
      type: Boolean,
      default: false 
    }
  },
  { timestamps: true }
);


export default userDB.model("User", userSchema);