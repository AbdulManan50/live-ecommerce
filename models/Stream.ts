import mongoose from "mongoose";

const StreamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["live", "ended"],
      default: "live",
      index: true,
    },
    // Optional featured product for this stream
    pinnedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    // Optional category slug coming from Sanity CMS
    categorySlug: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Stream ||
  mongoose.model("Stream", StreamSchema);