import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
    },
    avatarUrl: {
      type: String,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
      index: true,
    },
    password: String,
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);