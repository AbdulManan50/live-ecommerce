import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    logoUrl: { type: String },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    category: {
      type: String,
      enum: [
        "Clothing & Fashion",
        "Electronics",
        "Shoes & Footwear",
        "Beauty & Cosmetics",
        "Home & Kitchen",
        "Sports & Fitness",
        "Bags & Accessories",
        "Mobile & Gadgets",
        "Jewelry & Watches",
        "Kids & Toys",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Store || mongoose.model("Store", StoreSchema);

