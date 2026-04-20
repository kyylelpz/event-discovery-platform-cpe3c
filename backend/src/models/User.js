import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
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
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
