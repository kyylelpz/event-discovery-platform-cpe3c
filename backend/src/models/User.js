import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true }, // ← added
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // ← removed required:true (not needed for Google OAuth)
    phoneNumber: { type: Number },
    bio: { type: String },
    avatar: { type: String }, // ← added
    location: { type: String },
    preferences: [{ type: String }],
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
