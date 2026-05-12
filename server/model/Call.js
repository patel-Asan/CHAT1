import mongoose from "mongoose";

const callSchema = new mongoose.Schema({
  caller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  callee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["audio", "video"], required: true },
  status: {
    type: String, enum: ["answered", "missed", "rejected", "cancelled"], required: true,
  },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  duration: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Call", callSchema);
