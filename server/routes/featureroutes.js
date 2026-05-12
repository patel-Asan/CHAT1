import express from "express";
import { protectRoute } from "../middle/auth.js";
import {
  toggleReaction, togglePin, forwardMessage, deleteForMe,
  markAsSeen, markAllAsSeen, sendVoiceMessage, sendGroupVoiceMessage,
  searchMessages, blockUser, unblockUser, getBlockedUsers,
  muteChat, unmuteChat, updateTheme, updateStatus,
  getUserProfile, getLinkPreview, addGroupAdmin, removeGroupAdmin,
  updateGroup, getPinnedMessages, getForwardTargets,
  getCallHistory,
} from "../controller/featurecontroller.js";

const router = express.Router();

// Reactions
router.put("/messages/:id/reaction", protectRoute, toggleReaction);

// Pin
router.put("/messages/:id/pin", protectRoute, togglePin);

// Forward
router.post("/messages/:id/forward", protectRoute, forwardMessage);
router.get("/forward-targets", protectRoute, getForwardTargets);

// Delete for me
router.delete("/messages/:id/delete-for-me", protectRoute, deleteForMe);

// Read receipts
router.put("/messages/:id/seen", protectRoute, markAsSeen);
router.put("/messages/seen-all/:senderId", protectRoute, markAllAsSeen);

// Voice
router.post("/voice/send/:id", protectRoute, sendVoiceMessage);
router.post("/voice/send-group/:groupId", protectRoute, sendGroupVoiceMessage);

// Search
router.get("/search/:userId", protectRoute, searchMessages);
router.get("/search/group/:groupId", protectRoute, searchMessages);

// Block
router.put("/block/:id", protectRoute, blockUser);
router.put("/unblock/:id", protectRoute, unblockUser);
router.get("/blocked", protectRoute, getBlockedUsers);

// Mute
router.put("/mute", protectRoute, muteChat);
router.put("/unmute/:chatId", protectRoute, unmuteChat);

// Theme
router.put("/theme", protectRoute, updateTheme);

// Status
router.put("/status", protectRoute, updateStatus);

// User profile
router.get("/user/:id", protectRoute, getUserProfile);

// Link preview
router.get("/link-preview", protectRoute, getLinkPreview);

// Group admin
router.put("/groups/:groupId/admin/:userId", protectRoute, addGroupAdmin);
router.delete("/groups/:groupId/admin/:userId", protectRoute, removeGroupAdmin);

// Group update
router.put("/groups/:groupId", protectRoute, updateGroup);

// Pinned messages
router.get("/pinned/:chatId", protectRoute, getPinnedMessages);

// Call history
router.get("/calls/:userId", protectRoute, getCallHistory);

export default router;
