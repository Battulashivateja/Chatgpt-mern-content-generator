import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    type: { type: String, default: "blog" },
    tone: { type: String, default: "professional" },
    output: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Content", contentSchema);
