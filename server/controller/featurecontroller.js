import Message from "../model/message.js";
import User from "../model/User.js";
import Group from "../model/Group.js";
import Call from "../model/Call.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
// ==================== REACTIONS ====================
export const toggleReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) return res.json({ success: false, message: "Message not found" });

    const existing = message.reactions.find(
      (r) => String(r.userId) === String(userId) && r.emoji === emoji
    );

    if (existing) {
      message.reactions = message.reactions.filter(
        (r) => !(String(r.userId) === String(userId) && r.emoji === emoji)
      );
    } else {
      message.reactions = message.reactions.filter((r) => String(r.userId) !== String(userId));
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    if (message.groupId) {
      const group = await Group.findById(message.groupId);
      if (group) {
        group.members.forEach((m) => {
          const sid = userSocketMap[m.toString()];
          if (sid) io.to(sid).emit("reactionUpdated", { messageId: id, reactions: message.reactions });
        });
      }
    } else {
      [message.senderId, message.receiverId].forEach((uid) => {
        const sid = userSocketMap[uid?.toString?.() || uid];
        if (sid) io.to(sid).emit("reactionUpdated", { messageId: id, reactions: message.reactions });
      });
    }

    res.json({ success: true, data: message.reactions });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== PIN MESSAGE ====================
export const togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);
    if (!message) return res.json({ success: false, message: "Message not found" });

    message.pinned = !message.pinned;
    await message.save();

    const eventData = { messageId: id, pinned: message.pinned };
    if (message.receiverId) {
      const sid = userSocketMap[message.receiverId.toString()];
      if (sid) io.to(sid).emit("messagePinned", eventData);
    }
    if (message.groupId) {
      const group = await Group.findById(message.groupId);
      if (group) {
        group.members.forEach((m) => {
          const sid = userSocketMap[m.toString()];
          if (sid) io.to(sid).emit("messagePinned", eventData);
        });
      }
    }

    res.json({ success: true, pinned: message.pinned });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== FORWARD MESSAGE ====================
export const forwardMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetUserId, targetGroupId } = req.body;
    const userId = req.user._id;

    const original = await Message.findById(id);
    if (!original) return res.json({ success: false, message: "Message not found" });

    const newMessage = await Message.create({
      senderId: userId,
      receiverId: targetUserId || null,
      groupId: targetGroupId || null,
      text: original.text,
      image: original.image,
      file: original.file,
      voice: original.voice,
      forwarded: true,
      forwardedFrom: req.user.fullName || "Unknown",
    });

    const populated = await Message.findById(newMessage._id).populate("senderId", "-password");

    if (targetUserId) {
      const sid = userSocketMap[targetUserId];
      if (sid) io.to(sid).emit("newMessage", populated);
    }
    if (targetGroupId) {
      const group = await Group.findById(targetGroupId);
      if (group) {
        group.members.forEach((m) => {
          const sid = userSocketMap[m.toString()];
          if (sid && m.toString() !== userId.toString()) io.to(sid).emit("newGroupMessage", { groupId: targetGroupId, message: populated });
        });
      }
    }

    res.json({ success: true, data: populated });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== DELETE FOR ME ====================
export const deleteForMe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) return res.json({ success: false, message: "Message not found" });

    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
    }
    await message.save();

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== SEEN BY (read receipts) ====================
export const markAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) return res.json({ success: false, message: "Message not found" });

    if (!message.seenBy.includes(userId)) {
      message.seenBy.push(userId);
      message.seen = true;
      await message.save();
    }

    const senderSocket = userSocketMap[message.senderId.toString()];
    if (senderSocket) {
      io.to(senderSocket).emit("messageSeen", { messageId: id, userId });
    }

    res.json({ success: true, seenBy: message.seenBy });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const markAllAsSeen = async (req, res) => {
  try {
    const { senderId } = req.params;
    const userId = req.user._id;

    const result = await Message.updateMany(
      { senderId, receiverId: userId, seen: false },
      { seen: true, $addToSet: { seenBy: userId } }
    );

    const senderSocket = userSocketMap[senderId];
    if (senderSocket) io.to(senderSocket).emit("messagesSeen", { userId });

    res.json({ success: true, modified: result.modifiedCount });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== VOICE MESSAGE ====================
export const sendVoiceMessage = async (req, res) => {
  try {
    const { voice } = req.body;
    const senderId = req.user._id;
    const receiverId = req.params.id;

    let voiceUrl = "";
    if (voice) {
      const upload = await cloudinary.uploader.upload(voice, { resource_type: "auto" });
      voiceUrl = upload.secure_url;
    }

    const newMessage = await Message.create({ senderId, receiverId, voice: voiceUrl });

    const sid = userSocketMap[receiverId];
    if (sid) io.to(sid).emit("newMessage", newMessage);

    res.json({ success: true, data: newMessage });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const sendGroupVoiceMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { voice } = req.body;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.json({ success: false, message: "Group not found" });

    let voiceUrl = "";
    if (voice) {
      const upload = await cloudinary.uploader.upload(voice, { resource_type: "auto" });
      voiceUrl = upload.secure_url;
    }

    const newMessage = await Message.create({ senderId, groupId, voice: voiceUrl });
    const populated = await Message.findById(newMessage._id).populate("senderId", "-password");

    group.members.forEach((m) => {
      const sid = userSocketMap[m.toString()];
      if (sid && m.toString() !== senderId.toString()) io.to(sid).emit("newGroupMessage", { groupId, message: populated });
    });

    res.json({ success: true, data: populated });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== SEARCH MESSAGES ====================
export const searchMessages = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user._id;
    const { userId: otherUserId, groupId } = req.params;

    if (!q) return res.json({ success: true, data: [] });

    let filter = {
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      text: { $regex: q, $options: "i" },
      deleted: false,
    };

    if (groupId) {
      filter = { groupId, text: { $regex: q, $options: "i" }, deleted: false };
    }

    const messages = await Message.find(filter)
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: messages });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== BLOCK / UNBLOCK ====================
export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { blockedUsers: id } },
      { new: true }
    );
    res.json({ success: true, blockedUsers: user.blockedUsers });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { blockedUsers: id } },
      { new: true }
    );
    res.json({ success: true, blockedUsers: user.blockedUsers });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("blockedUsers", "fullName profilePic");
    res.json({ success: true, data: user.blockedUsers });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== MUTE / UNMUTE ====================
export const muteChat = async (req, res) => {
  try {
    const { chatId, type } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { mutedChats: { chatId, type } } },
      { new: true }
    );
    res.json({ success: true, mutedChats: user.mutedChats });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const unmuteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { mutedChats: { chatId } } },
      { new: true }
    );
    res.json({ success: true, mutedChats: user.mutedChats });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== THEME ====================
export const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { theme },
      { new: true }
    );
    res.json({ success: true, theme: user.theme });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== STATUS ====================
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { status },
      { new: true }
    );
    res.json({ success: true, status: user.status });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== USER PROFILE ====================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== LINK PREVIEW ====================
export const getLinkPreview = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.json({ success: false, message: "URL required" });

    const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(5000) });
    const json = await response.json();
    const d = json?.data;
    res.json({
      success: true,
      data: {
        url,
        title: d?.title || "",
        description: d?.description || "",
        image: d?.image?.url || "",
      },
    });
  } catch {
    res.json({ success: true, data: { url, title: "", description: "", image: "" } });
  }
};

// ==================== GROUP ADMIN MANAGEMENT ====================
export const addGroupAdmin = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.json({ success: false, message: "Group not found" });
    if (String(group.admin) !== String(req.user._id)) {
      return res.json({ success: false, message: "Only main admin can add admins" });
    }
    if (group.admins.includes(userId)) {
      return res.json({ success: false, message: "Already an admin" });
    }
    group.admins.push(userId);
    await group.save();
    const populated = await Group.findById(groupId)
      .populate("members", "-password")
      .populate("admin", "-password")
      .populate("admins", "-password");
    res.json({ success: true, data: populated });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const removeGroupAdmin = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.json({ success: false, message: "Group not found" });
    if (String(group.admin) !== String(req.user._id)) {
      return res.json({ success: false, message: "Only main admin can remove admins" });
    }
    group.admins = group.admins.filter((a) => a.toString() !== userId);
    await group.save();
    res.json({ success: true, data: group });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== GROUP DETAILS ====================
export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, profilePic } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.json({ success: false, message: "Group not found" });
    if (String(group.admin) !== String(req.user._id) && !group.admins.includes(req.user._id)) {
      return res.json({ success: false, message: "Not authorized" });
    }

    let picUrl = group.profilePic;
    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic);
      picUrl = upload.secure_url;
    }

    group.name = name || group.name;
    group.description = description ?? group.description;
    group.profilePic = picUrl;
    await group.save();

    const populated = await Group.findById(groupId)
      .populate("members", "-password")
      .populate("admin", "-password")
      .populate("admins", "-password");

    res.json({ success: true, data: populated });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== PINNED MESSAGES ====================
export const getPinnedMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({
      $or: [{ receiverId: chatId }, { groupId: chatId }],
      pinned: true, deleted: false,
    }).populate("senderId", "fullName").sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== FORWARD USERS / GROUPS ====================
export const getForwardTargets = async (req, res) => {
  try {
    const userId = req.user._id;
    const users = await User.find({ _id: { $ne: userId }, blockedUsers: { $ne: userId } }).select("fullName profilePic");
    const groups = await Group.find({ members: userId }).select("name profilePic");
    res.json({ success: true, data: { users, groups } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==================== CALL HISTORY ====================
export const getCallHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const calls = await Call.find({
      $or: [
        { caller: myId, callee: userId },
        { caller: userId, callee: myId },
      ],
    }).populate("caller", "fullName profilePic")
      .populate("callee", "fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, data: calls });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
