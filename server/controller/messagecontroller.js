import Message from "../model/message.js";
import User from "../model/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(userId);
    const blockedIds = currentUser.blockedUsers || [];

    let filteredUsers = await User.find({
      _id: { $ne: userId, $nin: blockedIds },
    }).select("-password");

    const blockedBy = await User.find({ blockedUsers: userId }).select("_id");
    const blockedByIds = blockedBy.map((u) => u._id.toString());
    filteredUsers = filteredUsers.filter((u) => !blockedByIds.includes(u._id.toString()));

    const unseenMessages = {};
    await Promise.all(
      filteredUsers.map(async (user) => {
        const count = await Message.countDocuments({ senderId: user._id, receiverId: userId, seen: false });
        if (count > 0) unseenMessages[user._id] = count;
      })
    );

    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    res.json({ success: false, message: "Error fetching users", error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    let messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
      deletedFor: { $ne: myId },
    }).populate("senderId", "fullName profilePic").sort({ createdAt: 1 });

    // Mark messages as seen
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true, $addToSet: { seenBy: myId } }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.json({ success: false, message: "Error fetching messages", error: error.message });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { senderId } = req.params;
    const myId = req.user._id;
    await Message.updateMany(
      { senderId, receiverId: myId, seen: false },
      { seen: true, $addToSet: { seenBy: myId } }
    );
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, file, replyTo, voice } = req.body;
    const senderId = req.user._id;
    const receiverId = req.params.id;

    let imageUrl;
    let fileData = {};

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    if (file) {
      const uploadResponse = await cloudinary.uploader.upload(file.data, { resource_type: "auto" });
      fileData = { url: uploadResponse.secure_url, name: file.name, type: file.type };
    }

    let linkPreview = {};
    const urlMatch = text?.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      linkPreview = { url: urlMatch[0] };
    }

    const newMessage = await Message.create({
      senderId, receiverId, text, image: imageUrl, file: fileData, linkPreview, replyTo, voice,
    });

    const populated = await Message.findById(newMessage._id).populate("senderId", "fullName profilePic");

    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", populated);

    res.json({ success: true, data: populated });
  } catch (error) {
    res.json({ success: false, message: "Error sending message", error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) return res.json({ success: false, message: "Message not found" });
    if (String(message.senderId) !== String(userId)) {
      return res.json({ success: false, message: "Not authorized" });
    }

    message.deleted = true;
    message.text = "";
    message.image = "";
    message.file = {};
    message.voice = "";
    await message.save();

    const eventData = { messageId: id };
    if (message.receiverId) {
      const sid = userSocketMap[message.receiverId.toString()];
      if (sid) io.to(sid).emit("messageDeleted", eventData);
    }
    if (message.groupId) {
      io.emit("messageDeleted", eventData);
    }

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) return res.json({ success: false, message: "Message not found" });
    if (String(message.senderId) !== String(userId)) {
      return res.json({ success: false, message: "Not authorized" });
    }

    message.text = text;
    message.edited = true;
    await message.save();

    const eventData = { messageId: id, newText: text };
    if (message.receiverId) {
      const sid = userSocketMap[message.receiverId.toString()];
      if (sid) io.to(sid).emit("messageEdited", eventData);
    }
    if (message.groupId) {
      io.emit("messageEdited", eventData);
    }

    res.json({ success: true, data: message });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
