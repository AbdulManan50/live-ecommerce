import mongoose from "mongoose";

const StreamSchema = new mongoose.Schema(
  {
    title: String,
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["live", "ended"],
      default: "live",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Stream ||
  mongoose.model("Stream", StreamSchema);