import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  profilePic: { type: String, default: "" },
  description: { type: String, default: "" },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

groupSchema.index({ members: 1 });

const Group = mongoose.model("Group", groupSchema);
export default Group;
