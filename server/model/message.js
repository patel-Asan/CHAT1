

import mongoose from "mongoose";

const messageSchema = new mongoose. Schema({
 senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
 receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
 groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
 text: { type: String, },
 image: { type: String, default: "" },
 file: {
   url: { type: String, default: "" },
   name: { type: String, default: "" },
   type: { type: String, default: "" },
 },
 seen: { type: Boolean, default: false },
 deleted: { type: Boolean, default: false }
}, {timestamps: true});

const Message = mongoose.model("Message", messageSchema);

export default Message;