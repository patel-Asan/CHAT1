import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [mutedChats, setMutedChats] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [forwardTargets, setForwardTargets] = useState({ users: [], groups: [] });
  const [theme, setTheme] = useState("default");
  const [callHistory, setCallHistory] = useState([]);

  const { socket, axios } = useContext(AuthContext);

  // ==================== USERS ====================
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== MESSAGES ====================
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) setMessages(data.messages);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async (messageData) => {
    try {
      const payload = { ...messageData };
      if (replyingTo) {
        payload.replyTo = {
          messageId: replyingTo._id,
          text: replyingTo.text || "",
          senderName: replyingTo.senderId?.fullName || "",
        };
      }
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, payload);
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        setReplyingTo(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== GROUPS ====================
  const getGroups = async () => {
    try {
      const { data } = await axios.get("/api/groups");
      if (data.success) setGroups(data.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const createGroup = async (name, memberIds, description) => {
    try {
      const { data } = await axios.post("/api/groups/create", { name, members: memberIds, description });
      return data;
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  };

  const getGroupMessages = async (groupId) => {
    try {
      const { data } = await axios.get(`/api/groups/${groupId}/messages`);
      if (data.success) setMessages(data.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendGroupMessage = async (messageData) => {
    try {
      const payload = { ...messageData };
      if (replyingTo) {
        payload.replyTo = {
          messageId: replyingTo._id,
          text: replyingTo.text || "",
          senderName: replyingTo.senderId?.fullName || "",
        };
      }
      const { data } = await axios.post(`/api/groups/${selectedGroup._id}/send`, payload);
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        setReplyingTo(null);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== DELETE ====================
  const deleteMessage = async (messageId) => {
    try {
      const { data } = await axios.delete(`/api/messages/${messageId}`);
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, deleted: true, text: "", image: "", file: {}, voice: "" } : msg
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== DELETE FOR ME ====================
  const deleteForMe = async (messageId) => {
    try {
      const { data } = await axios.delete(`/api/features/messages/${messageId}/delete-for-me`);
      if (data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== EDIT ====================
  const editMessage = async (messageId, newText) => {
    try {
      const { data } = await axios.put(`/api/messages/${messageId}`, { text: newText });
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, text: newText, edited: true } : msg
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== REACTIONS ====================
  const toggleReaction = async (messageId, emoji) => {
    try {
      const { data } = await axios.put(`/api/features/messages/${messageId}/reaction`, { emoji });
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, reactions: data.data } : msg
          )
        );
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== PIN ====================
  const togglePin = async (messageId) => {
    try {
      const { data } = await axios.put(`/api/features/messages/${messageId}/pin`);
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, pinned: data.pinned } : msg
          )
        );
        loadPinnedMessages();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadPinnedMessages = async () => {
    const chatId = selectedUser?._id || selectedGroup?._id;
    if (!chatId) return;
    try {
      const { data } = await axios.get(`/api/features/pinned/${chatId}`);
      if (data.success) setPinnedMessages(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ==================== CALL HISTORY ====================
  const getCallHistory = async (userId) => {
    try {
      const { data } = await axios.get(`/api/features/calls/${userId}`);
      if (data.success) setCallHistory(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ==================== FORWARD ====================
  const forwardMessage = async (messageId, targetUserId, targetGroupId) => {
    try {
      const { data } = await axios.post(`/api/features/messages/${messageId}/forward`, {
        targetUserId, targetGroupId,
      });
      return data.success;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const getForwardTargets = async () => {
    try {
      const { data } = await axios.get("/api/features/forward-targets");
      if (data.success) setForwardTargets(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ==================== SEARCH ====================
  const searchMessages = async (query) => {
    try {
      const userId = selectedUser?._id;
      const groupId = selectedGroup?._id;
      if (!query.trim()) { setSearchResults([]); return; }
      let url;
      if (groupId) url = `/api/features/search/group/${groupId}?q=${query}`;
      else url = `/api/features/search/${userId}?q=${query}`;
      const { data } = await axios.get(url);
      if (data.success) setSearchResults(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ==================== VOICE ====================
  const sendVoiceMessage = async (voiceBlob) => {
    try {
      if (selectedGroup) {
        const { data } = await axios.post(`/api/features/voice/send-group/${selectedGroup._id}`, { voice: voiceBlob });
        if (data.success) setMessages((prev) => [...prev, data.data]);
      } else {
        const { data } = await axios.post(`/api/features/voice/send/${selectedUser._id}`, { voice: voiceBlob });
        if (data.success) setMessages((prev) => [...prev, data.data]);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== BLOCK ====================
  const blockUser = async (userId) => {
    try {
      const { data } = await axios.put(`/api/features/block/${userId}`);
      if (data.success) setBlockedUsers(data.blockedUsers);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const unblockUser = async (userId) => {
    try {
      const { data } = await axios.put(`/api/features/unblock/${userId}`);
      if (data.success) setBlockedUsers(data.blockedUsers);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getBlockedUsers = async () => {
    try {
      const { data } = await axios.get("/api/features/blocked");
      if (data.success) setBlockedUsers(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // ==================== MUTE ====================
  const muteChat = async (chatId, type) => {
    try {
      const { data } = await axios.put("/api/features/mute", { chatId, type });
      if (data.success) setMutedChats(data.mutedChats);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const unmuteChat = async (chatId) => {
    try {
      const { data } = await axios.put(`/api/features/unmute/${chatId}`);
      if (data.success) setMutedChats(data.mutedChats);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ==================== THEME ====================
  const updateTheme = async (newTheme) => {
    try {
      const { data } = await axios.put("/api/features/theme", { theme: newTheme });
      if (data.success) setTheme(data.theme);
    } catch (error) {
      console.error(error);
    }
  };

  // ==================== LINK PREVIEW ====================
  const fetchLinkPreview = async (url) => {
    try {
      const { data } = await axios.get(`/api/features/link-preview?url=${encodeURIComponent(url)}`);
      return data.data;
    } catch {
      return null;
    }
  };

  // ==================== SOCKET EVENTS ====================
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && String(newMessage.senderId) === String(selectedUser._id)) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/seen/${newMessage.senderId}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId] ? prev[newMessage.senderId] + 1 : 1,
        }));
      }
    });

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, deleted: true, text: "", image: "", file: {}, voice: "" } : msg
        )
      );
    });

    socket.on("messageEdited", ({ messageId, newText }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, text: newText, edited: true } : msg
        )
      );
    });

    socket.on("reactionUpdated", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, reactions } : msg))
      );
    });

    socket.on("messagePinned", ({ messageId, pinned }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, pinned } : msg))
      );
      loadPinnedMessages();
    });

    socket.on("messageSeen", ({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, seen: true, seenBy: [...(msg.seenBy || []), userId] }
            : msg
        )
      );
    });

    socket.on("messagesSeen", ({ userId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.senderId) === String(userId) ? { ...msg, seen: true } : msg
        )
      );
    });

    socket.on("typing", ({ senderId }) => {
      if (selectedUser && String(senderId) === String(selectedUser._id)) setIsTyping(true);
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (selectedUser && String(senderId) === String(selectedUser._id)) setIsTyping(false);
    });

    socket.on("newGroupMessage", ({ groupId, message }) => {
      if (selectedGroup && String(groupId) === String(selectedGroup._id)) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on("groupTyping", ({ groupId }) => {
      if (selectedGroup && String(groupId) === String(selectedGroup._id)) setIsTyping(true);
    });

    socket.on("groupStopTyping", ({ groupId }) => {
      if (selectedGroup && String(groupId) === String(selectedGroup._id)) setIsTyping(false);
    });

    socket.on("groupCreated", (group) => {
      setGroups((prev) => {
        const exists = prev.find((g) => g._id === group._id);
        return exists ? prev : [...prev, group];
      });
    });

    socket.on("removedFromGroup", ({ groupId }) => {
      setGroups((prev) => prev.filter((g) => g._id !== groupId));
      if (selectedGroup?._id === groupId) setSelectedGroup(null);
    });
  };

  const unsubscribeFromMessages = () => {
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("messageEdited");
    socket.off("reactionUpdated");
    socket.off("messagePinned");
    socket.off("messageSeen");
    socket.off("messagesSeen");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("newGroupMessage");
    socket.off("groupTyping");
    socket.off("groupStopTyping");
    socket.off("groupCreated");
    socket.off("removedFromGroup");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser, selectedGroup]);

  useEffect(() => {
    if (selectedUser || selectedGroup) {
      loadPinnedMessages();
    }
  }, [selectedUser, selectedGroup]);

  const value = {
    messages, users, selectedUser, setSelectedUser,
    unseenMessages, setUnseenMessages, groups, selectedGroup, setSelectedGroup,
    blockedUsers, mutedChats, pinnedMessages, replyingTo, setReplyingTo,
    searchResults, setSearchResults, showSearch, setShowSearch, forwardTargets, theme,
    callHistory, getCallHistory,
    getUsers, getGroups, getMessages, getGroupMessages,
    sendMessage, sendGroupMessage, createGroup,
    deleteMessage, deleteForMe, editMessage,
    toggleReaction, togglePin, forwardMessage, getForwardTargets,
    searchMessages, sendVoiceMessage,
    blockUser, unblockUser, getBlockedUsers,
    muteChat, unmuteChat, updateTheme,
    fetchLinkPreview, loadPinnedMessages, isTyping,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
