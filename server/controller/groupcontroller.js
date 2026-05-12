import Group from "../model/Group.js";
import Message from "../model/message.js";
import { io, userSocketMap } from "../server.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const adminId = req.user._id;

    if (!name || !members || members.length === 0) {
      return res.json({ success: false, message: "Name and members required" });
    }

    if (!members.includes(adminId.toString())) {
      members.push(adminId);
    }

    const group = await Group.create({ name, description, admin: adminId, admins: [adminId], members });

    const populated = await Group.findById(group._id)
      .populate("members", "-password")
      .populate("admin", "-password")
      .populate("admins", "-password");

    const memberSocketIds = members.map((m) => userSocketMap[m.toString()]).filter(Boolean);
    memberSocketIds.forEach((socketId) => {
      io.to(socketId).emit("groupCreated", populated);
    });

    res.json({ success: true, data: populated });
  } catch (error) {
    res.json({ success: false, message: "Error creating group", error: error.message });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId })
      .populate("members", "-password")
      .populate("admin", "-password")
      .populate("admins", "-password");
    res.json({ success: true, data: groups });
  } catch (error) {
    res.json({ success: false, message: "Error fetching groups", error: error.message });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    const messages = await Message.find({ groupId, deletedFor: { $ne: userId } })
      .populate("senderId", "-password")
      .sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.json({ success: false, message: "Error fetching messages", error: error.message });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image, file } = req.body;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.json({ success: false, message: "Group not found" });
    if (!group.members.includes(senderId)) {
      return res.json({ success: false, message: "Not a member" });
    }

    let imageUrl;
    let fileData = {};
    const { default: cloudinary } = await import("../lib/cloudinary.js");

    if (image) {
      const upload = await cloudinary.uploader.upload(image);
      imageUrl = upload.secure_url;
    }

    if (file) {
      const upload = await cloudinary.uploader.upload(file.data, { resource_type: "auto" });
      fileData = { url: upload.secure_url, name: file.name, type: file.type };
    }

    let linkPreview = {};
    const urlMatch = text?.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) linkPreview = { url: urlMatch[0] };

    const newMessage = await Message.create({
      senderId, groupId, text, image: imageUrl, file: fileData, linkPreview,
    });

    const populatedMsg = await Message.findById(newMessage._id).populate("senderId", "-password");

    group.members.forEach((m) => {
      const sid = userSocketMap[m.toString()];
      if (sid && m.toString() !== senderId.toString()) {
        io.to(sid).emit("newGroupMessage", { groupId, message: populatedMsg });
      }
    });

    res.json({ success: true, data: populatedMsg });
  } catch (error) {
    res.json({ success: false, message: "Error sending message", error: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.json({ success: false, message: "Group not found" });
    if (String(group.admin) !== String(req.user._id) && !group.admins.includes(req.user._id)) {
      return res.json({ success: false, message: "Only admin can add members" });
    }
    if (group.members.includes(userId)) {
      return res.json({ success: false, message: "Already a member" });
    }

    group.members.push(userId);
    await group.save();

    const populated = await Group.findById(group._id)
      .populate("members", "-password")
      .populate("admin", "-password")
      .populate("admins", "-password");

    const newMemberSocket = userSocketMap[userId];
    if (newMemberSocket) io.to(newMemberSocket).emit("groupCreated", populated);

    res.json({ success: true, data: populated });
  } catch (error) {
    res.json({ success: false, message: "Error adding member", error: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.json({ success: false, message: "Group not found" });
    if (String(group.admin) !== String(req.user._id) && !group.admins.includes(req.user._id)) {
      return res.json({ success: false, message: "Only admin can remove members" });
    }

    group.members = group.members.filter((m) => m.toString() !== userId);
    group.admins = group.admins.filter((a) => a.toString() !== userId);
    await group.save();

    const removedSocket = userSocketMap[userId];
    if (removedSocket) io.to(removedSocket).emit("removedFromGroup", { groupId });

    res.json({ success: true, data: group });
  } catch (error) {
    res.json({ success: false, message: "Error removing member", error: error.message });
  }
};
