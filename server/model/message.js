import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  emoji: { type: String, required: true },
}, { _id: false });

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
  text: { type: String },
  image: { type: String, default: "" },
  file: {
    url: { type: String, default: "" },
    name: { type: String, default: "" },
    type: { type: String, default: "" },
  },
  voice: { type: String, default: "" },
  seen: { type: Boolean, default: false },
  seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  deleted: { type: Boolean, default: false },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  edited: { type: Boolean, default: false },
  reactions: [reactionSchema],
  replyTo: {
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    text: { type: String, default: "" },
    senderName: { type: String, default: "" },
  },
  forwarded: { type: Boolean, default: false },
  forwardedFrom: { type: String, default: "" },
  pinned: { type: Boolean, default: false },
  linkPreview: {
    url: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
  },
}, { timestamps: true });

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ deletedFor: 1 });
messageSchema.index({ senderId: 1, receiverId: 1, seen: 1 });
messageSchema.index({ receiverId: 1, seen: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
