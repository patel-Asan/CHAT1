import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  profilePic: { type: String, default: "" },
  bio: { type: String },
  status: { type: String, default: "Hey there! I am using this chat app" },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  mutedChats: [{
    chatId: { type: mongoose.Schema.Types.ObjectId },
    type: { type: String, enum: ["user", "group"] },
  }],
  theme: { type: String, default: "default" },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
