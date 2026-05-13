import React, { useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import assets from "../assest/assets";
import { formatMessageTime, getReactionCount, isMuted, extractUrls } from "../lib/util";
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import { getTheme, themes } from "../lib/themes";
import {
  FaInfoCircle, FaCheckDouble, FaSmile, FaTrash, FaFile,
  FaFilePdf, FaFileImage, FaFileArchive, FaFileWord,
  FaReply, FaForward, FaThumbtack, FaBan, FaBell, FaBellSlash,
  FaTimes, FaSearch, FaMicrophone, FaStop, FaCheck, FaPlus, FaPhone, FaVideo,
} from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import Timepass from "./timepass.jsx";
import VideoCallModal from "./VideoCallModal.jsx";
import { CallContext } from "../Context/CallContext";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

// ==================== LINK PREVIEW CARD ====================
const LinkPreviewCard = ({ preview }) => {
  if (!preview || !preview.url) return null;
  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        marginTop: "6px",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        textDecoration: "none",
        color: "#fff",
      }}
    >
      {preview.image && (
        <img src={preview.image} alt="" style={{ width: "100%", height: "120px", objectFit: "cover" }} />
      )}
      <div style={{ padding: "6px 10px", background: "rgba(0,0,0,0.3)" }}>
        <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {preview.title || preview.url}
        </p>
        {preview.description && (
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
};

// ==================== REACTION BADGE ====================
const ReactionBadge = ({ reactions, onReact, currentUserId }) => {
  const counts = getReactionCount(reactions);
  const emojis = Object.keys(counts);
  if (emojis.length === 0) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        background: "rgba(15,23,42,0.85)",
        backdropFilter: "blur(8px)",
        borderRadius: "14px",
        padding: "2px 8px 2px 6px",
        marginTop: "4px",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      {emojis.map((emoji) => (
        <span
          key={emoji}
          onClick={(e) => { e.stopPropagation(); onReact(emoji); }}
          style={{
            fontSize: "14px",
            cursor: "pointer",
            padding: "2px 3px",
            borderRadius: "8px",
            transition: "all 0.15s ease",
            background: reactions.some((r) => r.emoji === emoji && String(r.userId) === String(currentUserId))
              ? "rgba(99,102,241,0.2)" : "transparent",
            opacity: reactions.some((r) => r.emoji === emoji && String(r.userId) === String(currentUserId)) ? 1 : 0.65,
            lineHeight: 1,
            filter: reactions.some((r) => r.emoji === emoji && String(r.userId) === String(currentUserId))
              ? "none" : "grayscale(0.3)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.2)"; e.currentTarget.style.background = "rgba(99,102,241,0.25)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = reactions.some((r) => r.emoji === emoji && String(r.userId) === String(currentUserId)) ? "rgba(99,102,241,0.2)" : "transparent"; }}
        >
          {emoji}{counts[emoji] > 1 ? <span style={{ fontSize: "11px", fontWeight: "600", marginLeft: "1px", color: "#c7d2fe" }}>{counts[emoji]}</span> : ""}
        </span>
      ))}
      <span
        onClick={(e) => { e.stopPropagation(); }}
        style={{
          fontSize: "10px", cursor: "pointer", padding: "2px 4px", lineHeight: 1,
          borderRadius: "6px", color: "#94a3b8", transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#e2e8f0"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
      >
        <FaPlus size={9} />
      </span>
    </div>
  );
};

// ==================== REACTION PICKER POPUP ====================
const ReactionPicker = ({ onReact, onClose }) => {
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        bottom: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "4px",
        background: "#1e293b",
        padding: "4px 8px",
        borderRadius: "20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        zIndex: 20,
        border: "1px solid #334155",
      }}
    >
      {REACTION_EMOJIS.map((emoji) => (
        <span
          key={emoji}
          onClick={(e) => { e.stopPropagation(); onReact(emoji); }}
          style={{ fontSize: "20px", cursor: "pointer", padding: "2px", transition: "transform 0.15s" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.3)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
};

// ==================== FORWARD MODAL ====================
const ForwardModal = ({ message, onClose }) => {
  const { forwardTargets, getForwardTargets, forwardMessage } = useContext(ChatContext);
  const [selected, setSelected] = useState(null);
  const [type, setType] = useState("user");

  useEffect(() => { getForwardTargets(); }, []);

  const handleForward = async () => {
    if (!selected) return;
    const ok = await forwardMessage(message._id, type === "user" ? selected : null, type === "group" ? selected : null);
    if (ok) onClose();
  };

  const targets = type === "user" ? forwardTargets.users || [] : forwardTargets.groups || [];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#1e293b", borderRadius: "16px", padding: "20px",
        width: "90%", maxWidth: "380px", maxHeight: "70vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ color: "#fff", margin: 0, fontSize: "16px" }}>Forward Message</h3>
          <FaTimes size={16} color="#9CA3AF" style={{ cursor: "pointer" }} onClick={onClose} />
        </div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <button onClick={() => setType("user")} style={{
            flex: 1, padding: "6px", borderRadius: "8px", border: "none",
            background: type === "user" ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.05)",
            color: type === "user" ? "#a78bfa" : "#9CA3AF", cursor: "pointer", fontWeight: "600", fontSize: "12px",
          }}>Users</button>
          <button onClick={() => setType("group")} style={{
            flex: 1, padding: "6px", borderRadius: "8px", border: "none",
            background: type === "group" ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.05)",
            color: type === "group" ? "#a78bfa" : "#9CA3AF", cursor: "pointer", fontWeight: "600", fontSize: "12px",
          }}>Groups</button>
        </div>
        {targets.map((t) => (
          <div
            key={t._id}
            onClick={() => setSelected(t._id)}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
              background: selected === t._id ? "rgba(139,92,246,0.2)" : "transparent",
              marginBottom: "4px",
            }}
          >
            <img src={t.profilePic || assets.avatar_icon} alt=""
              style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
            <span style={{ color: "#e5e7eb", fontSize: "14px" }}>{t.fullName || t.name}</span>
          </div>
        ))}
        <button
          onClick={handleForward}
          style={{
            width: "100%", padding: "10px", marginTop: "12px", borderRadius: "10px",
            border: "none", background: selected ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(255,255,255,0.1)",
            color: "#fff", fontWeight: "600", cursor: selected ? "pointer" : "not-allowed", fontSize: "14px",
          }}
        >Forward</button>
      </div>
    </div>
  );
};

// ==================== SEARCH OVERLAY ====================
const SearchOverlay = ({ onClose }) => {
  const { searchMessages, searchResults, setSearchResults } = useContext(ChatContext);
  const [query, setQuery] = useState("");
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    searchMessages(val);
  };

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 50, background: "rgba(15,23,42,0.98)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px", padding: "12px",
        borderBottom: "1px solid #334155",
      }}>
        <FaSearch size={14} color="#9CA3AF" />
        <input
          ref={inputRef}
          value={query}
          onChange={handleSearch}
          placeholder="Search messages..."
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "#fff", fontSize: "14px",
          }}
        />
        <FaTimes size={16} color="#9CA3AF" style={{ cursor: "pointer" }} onClick={() => { setSearchResults([]); onClose(); }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {searchResults.length === 0 && query.trim() && (
          <p style={{ color: "#6B7280", textAlign: "center", marginTop: "40px", fontSize: "13px" }}>No results found</p>
        )}
        {searchResults.map((msg) => (
          <div key={msg._id} style={{
            padding: "10px 12px", borderRadius: "8px", marginBottom: "6px",
            background: "rgba(255,255,255,0.04)", cursor: "pointer",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <img src={msg.senderId?.profilePic || assets.avatar_icon} alt=""
                style={{ width: "20px", height: "20px", borderRadius: "50%" }} />
              <span style={{ color: "#a78bfa", fontSize: "12px", fontWeight: "600" }}>{msg.senderId?.fullName}</span>
              <span style={{ color: "#6B7280", fontSize: "11px" }}>{formatMessageTime(msg.createdAt)}</span>
            </div>
            <p style={{ color: "#d1d5db", fontSize: "13px", margin: 0, wordBreak: "break-word" }}>{msg.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== THEME PICKER ====================
const ThemePicker = ({ currentTheme, onSelect, onClose }) => {
  return (
    <div style={{
      position: "absolute", top: "40px", right: 0, zIndex: 50,
      background: "#1e293b", borderRadius: "12px", padding: "12px",
      border: "1px solid #334155", boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      width: "200px",
    }}>
      <p style={{ color: "#9CA3AF", fontSize: "12px", margin: "0 0 8px", fontWeight: "600" }}>Chat Theme</p>
      {Object.entries(themes).map(([key, t]) => (
        <div
          key={key}
          onClick={() => { onSelect(key); onClose(); }}
          style={{
            display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px",
            borderRadius: "6px", cursor: "pointer", fontSize: "13px",
            background: currentTheme === key ? "rgba(139,92,246,0.2)" : "transparent",
            color: currentTheme === key ? "#a78bfa" : "#e5e7eb",
            marginBottom: "2px",
          }}
        >
          <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: t.ownBubble }} />
          {t.name}
        </div>
      ))}
    </div>
  );
};

// ==================== VOICE RECORDER ====================
const VoiceRecorder = ({ onSend, onCancel }) => {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const timer = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => onSend(reader.result);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.current.start();
      setRecording(true);
      timer.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch { alert("Microphone access denied"); }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
    clearInterval(timer.current);
    setDuration(0);
  };

  useEffect(() => { return () => clearInterval(timer.current); }, []);

  const formatDur = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0" }}>
      {recording ? (
        <>
          <span style={{ color: "#ef4444", fontSize: "12px", fontWeight: "600" }}>● {formatDur(duration)}</span>
          <button onClick={stopRecording} style={{
            background: "#ef4444", border: "none", borderRadius: "50%", width: "32px",
            height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff",
          }}><FaStop size={12} /></button>
          <button onClick={onCancel} style={{
            background: "transparent", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "12px",
          }}>Cancel</button>
        </>
      ) : (
        <button onClick={startRecording} style={{
          background: "rgba(139,92,246,0.2)", border: "none", borderRadius: "50%", width: "32px",
          height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#a78bfa",
        }}><FaMicrophone size={14} /></button>
      )}
    </div>
  );
};

// ==================== MAIN CHAT CONTAINER ====================
const ChatContainer = () => {
  const {
    messages, selectedUser, setSelectedUser,
    selectedGroup, setSelectedGroup,
    sendMessage, sendGroupMessage, getMessages, getGroupMessages,
    deleteMessage, deleteForMe, editMessage,
    toggleReaction, togglePin, replyingTo, setReplyingTo,
    blockUser, unblockUser, blockedUsers, mutedChats,
    muteChat, unmuteChat, showSearch, setShowSearch, theme,
    updateTheme, isTyping, sendVoiceMessage,
    callHistory, getCallHistory,
  } = useContext(ChatContext);
  const { authUser, onlineUsers, socket } = useContext(AuthContext);
  const { startCall } = useContext(CallContext);

  const scrollEnd = useRef();
  const typingTimeoutRef = useRef();
  const [input, setInput] = useState("");
  const [showHelpInfo, setShowHelpInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [openTimepass, setOpenTimepass] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [forwardMsg, setForwardMsg] = useState(null);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showMuteOption, setShowMuteOption] = useState(false);

  const currentTheme = getTheme(theme);
  const isChatMuted = isMuted(selectedUser?._id || selectedGroup?._id, mutedChats);

  const chatEntries = useMemo(() => {
    const calls = (callHistory || []).map((c) => ({ ...c, _isCall: true }));
    const msgs = (messages || []).map((m) => ({ ...m, _isCall: false }));
    return [...calls, ...msgs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [callHistory, messages]);

  const formatDuration = (sec) => {
    if (!sec) return "";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const emitTyping = useCallback((isTypingEvent) => {
    if (!socket) return;
    if (selectedUser) {
      socket.emit(isTypingEvent ? "typing" : "stopTyping", { receiverId: selectedUser._id });
    }
    if (selectedGroup) {
      socket.emit(isTypingEvent ? "groupTyping" : "groupStopTyping", { groupId: selectedGroup._id });
    }
  }, [socket, selectedUser, selectedGroup]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket) return;
    emitTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1500);
  };

  const handleEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showEmojiPicker) setShowEmojiPicker(false);
      if (selectedMessageId && !e.target.closest(".msg-actions") && !e.target.closest(".reaction-picker")) {
        setSelectedMessageId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker, selectedMessageId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    emitTyping(false);
    const payload = { text: input.trim() };
    if (selectedGroup) {
      await sendGroupMessage(payload);
    } else {
      await sendMessage(payload);
    }
    setInput("");
  };

  const activeUser = selectedUser;
  const activeGroup = selectedGroup;

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fn = selectedGroup ? sendGroupMessage : sendMessage;
        await fn({ image: reader.result });
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fn = selectedGroup ? sendGroupMessage : sendMessage;
        await fn({ file: { data: reader.result, name: file.name, type: file.type } });
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    await deleteMessage(messageId);
    setSelectedMessageId(null);
  };

  const handleDeleteForMe = async (messageId) => {
    await deleteForMe(messageId);
    setSelectedMessageId(null);
  };

  const isWithinOneHour = (createdAt) => {
    if (!createdAt) return false;
    const diff = (new Date() - new Date(createdAt)) / (1000 * 60 * 60);
    return diff <= 1;
  };

  const handleEditMessage = (msg) => {
    setEditingMessageId(msg._id);
    setEditText(msg.text || "");
    setSelectedMessageId(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    await editMessage(editingMessageId, editText.trim());
    setEditingMessageId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const handleReact = async (msgId, emoji) => {
    await toggleReaction(msgId, emoji);
    setShowReactionPicker(null);
  };

  const handlePin = async (msgId) => {
    await togglePin(msgId);
    setSelectedMessageId(null);
  };

  const handleBlock = async () => {
    if (selectedUser) {
      if (blockedUsers.some((b) => (b._id || b) === selectedUser._id)) {
        await unblockUser(selectedUser._id);
      } else {
        await blockUser(selectedUser._id);
      }
      setSelectedMessageId(null);
    }
  };

  const handleMute = async () => {
    const chatId = selectedUser?._id || selectedGroup?._id;
    if (!chatId) return;
    if (isChatMuted) {
      await unmuteChat(chatId);
    } else {
      await muteChat(chatId, selectedUser ? "user" : "group");
    }
    setShowMuteOption(false);
  };

  const handleVoiceSend = (voiceBlob) => {
    sendVoiceMessage(voiceBlob);
    setShowVoiceRecorder(false);
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile size={20} />;
    if (fileType.includes("pdf")) return <FaFilePdf size={20} />;
    if (fileType.includes("image")) return <FaFileImage size={20} />;
    if (fileType.includes("zip") || fileType.includes("rar")) return <FaFileArchive size={20} />;
    if (fileType.includes("word") || fileType.includes("document")) return <FaFileWord size={20} />;
    return <FaFile size={20} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      getCallHistory(selectedUser._id);
      socket?.emit("joinGroup", { groupId: selectedUser._id });
    } else if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
      socket?.emit("joinGroup", { groupId: selectedGroup._id });
    }
  }, [selectedUser, selectedGroup]);

  useEffect(() => {
    if (scrollEnd.current && messages && !isUserScrolling) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isUserScrolling]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setIsUserScrolling(scrollHeight - scrollTop - clientHeight > 50);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const m = isMobile ? "10px" : "16px";

  const containerStyle = {
    height: isMobile ? "100dvh" : "100%",
    overflow: "hidden",
    position: "relative",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    background: currentTheme.bg,
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: isMobile ? "10px 12px" : "8px 0",
    margin: isMobile ? "0" : `0 ${m}`,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    flexShrink: 0,
    background: "rgba(15,23,42,0.8)",
    backdropFilter: "blur(12px)",
  };

  const profileImageStyle = {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
    border: "2px solid rgba(139,92,246,0.3)",
  };

  const nameStyle = {
    fontSize: isMobile ? "15px" : "16px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    overflow: "hidden",
    fontWeight: "600",
    margin: 0,
  };

  const statusDotStyle = {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
    flexShrink: 0,
    boxShadow: "0 0 6px rgba(34,197,94,0.6)",
  };

  const iconBtnStyle = (bg) => ({
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    border: "none",
    background: bg,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
    flexShrink: 0,
  });

  const messageListStyle = {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: isMobile ? "8px 10px" : "12px",
    paddingBottom: isMobile ? "20px" : "24px",
    minHeight: 0,
  };

  const placeholderStyle = {
    display: isMobile ? "none" : "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    color: "#6b7280",
    backgroundColor: "rgba(255,255,255,0.1)",
    height: "100%",
  };

  const placeholderImageStyle = {
    width: "64px",
  };

  const scrollbarStyle = `
    .chat-messages::-webkit-scrollbar { width: ${isMobile ? "4px" : "6px"}; }
    .chat-messages::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
    .chat-messages::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.6); border-radius: 3px; }
    .chat-messages::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.8); }
    .chat-messages { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
  `;

  if (openTimepass && isMobile) {
    return <Timepass />;
  }

  return (selectedUser || selectedGroup) ? (
    <div style={containerStyle}>
      <style>{scrollbarStyle}</style>
      {/* Search overlay */}
      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}

      {/* Forward modal */}
      {forwardMsg && <ForwardModal message={forwardMsg} onClose={() => setForwardMsg(null)} />}
      <VideoCallModal />

      {/* HEADER */}
      <div style={headerStyle}>
        {/* Back arrow (mobile) */}
        {isMobile && (
          <button onClick={() => { setSelectedUser(null); setSelectedGroup(null); }}
            style={iconBtnStyle("rgba(255,255,255,0.06)")}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            title="Back">
            <img src={assets.arrow_icon} alt="" style={{ width: "16px", filter: "brightness(0) invert(0.6)" }} />
          </button>
        )}

        {/* User/Group avatar + info */}
        {selectedUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
            <div style={{ position: "relative" }}>
              <img src={selectedUser.profilePic || assets.avatar_icon} alt="" style={profileImageStyle} />
              {onlineUsers?.includes(selectedUser._id) && (
                <span style={{ ...statusDotStyle, position: "absolute", bottom: "-1px", right: "-1px" }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <p style={nameStyle}>{selectedUser.fullName}</p>
                {blockedUsers.some((b) => (b._id || b) === selectedUser._id) && (
                  <span style={{ color: "#ef4444", fontSize: "10px" }}>(Blocked)</span>
                )}
              </div>
              <p style={{ margin: "1px 0 0", fontSize: "11px", color: isTyping ? "#a78bfa" : (onlineUsers?.includes(selectedUser._id) ? "#22c55e" : "#9CA3AF") }}>
                {isTyping ? "typing..." : (onlineUsers?.includes(selectedUser._id) ? "Online" : "Offline")}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: "15px", fontWeight: "600", flexShrink: 0,
            }}>
              {selectedGroup?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={nameStyle}>{selectedGroup?.name}</p>
              <p style={{ margin: "1px 0 0", fontSize: "11px", color: "#9CA3AF" }}>
                {selectedGroup?.members?.length || 0} members
              </p>
            </div>
          </div>
        )}

        {/* Right side action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
          {/* Call buttons */}
          {selectedUser && (
            <>
              <button onClick={() => startCall(selectedUser, false)}
                style={iconBtnStyle("rgba(34,197,94,0.15)")}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.25)"; e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.15)"; e.currentTarget.style.transform = "scale(1)"; }}
                title="Voice call">
                <FaPhone size={14} color="#22c55e" style={{ transform: "rotate(90deg)" }} />
              </button>
              <button onClick={() => startCall(selectedUser, true)}
                style={iconBtnStyle("rgba(139,92,246,0.15)")}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.25)"; e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.15)"; e.currentTarget.style.transform = "scale(1)"; }}
                title="Video call">
                <FaVideo size={15} color="#a78bfa" />
              </button>
            </>
          )}

          {/* Search */}
          <button onClick={() => setShowSearch(true)}
            style={iconBtnStyle("rgba(255,255,255,0.06)")}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "scale(1)"; }}
            title="Search">
            <FaSearch size={14} color="#9CA3AF" />
          </button>

          {/* Theme/Info */}
          <div style={{ position: "relative", display: "inline-block" }}>
            <button onClick={() => { if (isMobile) setOpenTimepass(true); else setShowHelpInfo(!showHelpInfo); }}
              style={iconBtnStyle("rgba(250,204,21,0.1)")}
              onMouseOver={(e) => { e.currentTarget.style.background = "rgba(250,204,21,0.2)"; e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "rgba(250,204,21,0.1)"; e.currentTarget.style.transform = "scale(1)"; }}
              title="More">
              <FaInfoCircle size={15} color="#facc15" />
            </button>
          {showHelpInfo && !isMobile && (
            <div style={{
              position: "absolute", top: "30px", right: 0,
              background: "rgba(30,41,59,0.95)", color: "#fff", padding: "12px 16px",
              borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
              width: "220px", zIndex: 10, cursor: "default", textAlign: "center",
              fontWeight: "500", fontSize: "13px", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ color: "#a78bfa", cursor: "pointer" }}
                  onClick={() => setShowThemePicker(!showThemePicker)}>🎨 Change Theme</span>
                {showThemePicker && (
                  <div style={{
                    position: "absolute", top: "100%", right: 0, zIndex: 60,
                    background: "#1e293b", borderRadius: "12px", padding: "10px",
                    border: "1px solid #334155", width: "170px", marginTop: "4px",
                  }}>
                    {["default", "ocean", "forest", "sunset", "midnight", "cyberpunk"].map((key) => (
                      <div key={key} onClick={() => { updateTheme(key); setShowThemePicker(false); setShowHelpInfo(false); }}
                        style={{
                          padding: "6px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
                          background: theme === key ? "rgba(139,92,246,0.2)" : "transparent",
                          color: theme === key ? "#a78bfa" : "#e5e7eb",
                        }}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <hr style={{ borderColor: "#334155", margin: "6px 0" }} />
              <div onClick={() => { handleMute(); setShowHelpInfo(false); }}
                style={{ cursor: "pointer", color: isChatMuted ? "#22c55e" : "#9CA3AF", padding: "4px 0" }}>
                {isChatMuted ? "🔊 Unmute" : "🔇 Mute"}
              </div>
              {selectedUser && (
                <div onClick={() => { handleBlock(); setShowHelpInfo(false); }}
                  style={{ cursor: "pointer", color: "#ef4444", padding: "4px 0" }}>
                  {blockedUsers.some((b) => (b._id || b) === selectedUser._id) ? "✓ Unblock" : "🚫 Block"}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Reply preview */}
      {replyingTo && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px",
          background: "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(99,102,241,0.1) 100%)",
          borderLeft: "3px solid #7c3aed",
          borderTop: "1px solid rgba(124,58,237,0.12)",
          borderBottom: "1px solid rgba(124,58,237,0.08)",
          flexShrink: 0, position: "relative",
        }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FaReply size={11} color="#a78bfa" />
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#a78bfa", fontWeight: "600", letterSpacing: "0.02em" }}>
              Reply to {replyingTo.senderId?.fullName || "unknown"}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {replyingTo.text || (replyingTo.image ? "📷 Image" : replyingTo.voice ? "🎤 Voice" : "📎 File")}
            </p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            style={{
              width: "24px", height: "24px", borderRadius: "50%", border: "none",
              background: "rgba(255,255,255,0.08)", color: "#94a3b8", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", flexShrink: 0, transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#e2e8f0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#94a3b8"; }}
          >
            <FaTimes size={10} />
          </button>
        </div>
      )}

      {/* MESSAGES */}
      <div style={messageListStyle} className="chat-messages" onScroll={handleScroll}>
        {chatEntries?.map((entry, index) => {
          if (entry._isCall) {
            const isCaller = String(entry.caller?._id || entry.caller) === String(authUser?._id);
            const callStatus = entry.status;
            let label, color;
            if (callStatus === "answered") {
              label = isCaller ? "Outgoing" : "Incoming";
              color = "#22c55e";
            } else if (callStatus === "missed") {
              label = isCaller ? "Call didn't connect" : "Missed call";
              color = "#ef4444";
            } else if (callStatus === "rejected") {
              label = isCaller ? "Call rejected" : "Call rejected";
              color = "#ef4444";
            } else {
              label = isCaller ? "Call cancelled" : "Missed call";
              color = "#ef4444";
            }
            return (
              <div key={index} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "4px", padding: "8px 0",
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "20px", padding: "6px 16px",
                  fontSize: "12px", color,
                }}>
                  {entry.type === "video" ? "📹" : "📞"}
                  <span>{label} {entry.type === "video" ? "Video" : "Audio"} call</span>
                  {entry.duration > 0 && <span>· {formatDuration(entry.duration)}</span>}
                  <span style={{ color: "#6b7280", fontSize: "10px" }}>
                    {formatMessageTime(entry.createdAt)}
                  </span>
                </div>
              </div>
            );
          }

          const msg = entry;
          const senderId = msg?.senderId?._id || msg?.senderId || null;
          const isOwn = senderId === authUser?._id;

          const senderName = msg.senderId?.fullName || "";
          const isDelForMe = msg.deletedFor?.includes(authUser?._id);

          if (isDelForMe) return null;

          if (msg?.deleted) {
            return (
              <div key={index} style={{
                display: "flex", justifyContent: isOwn ? "flex-end" : "flex-start",
                marginBottom: "4px",
              }}>
                <div>
                  {selectedGroup && !isOwn && senderName && (
                    <p style={{ color: "#9CA3AF", fontSize: "11px", margin: "0 0 2px 12px" }}>{senderName}</p>
                  )}
                  <p style={{
                    color: "#6b7280", fontSize: "12px", fontStyle: "italic",
                    padding: "4px 12px", background: "rgba(255,255,255,0.04)",
                    borderRadius: "12px", marginBottom: "24px",
                  }}>
                    {isOwn ? "You deleted this message" : "Message deleted"}
                  </p>
                </div>
              </div>
            );
          }

          const mw = isMobile ? "85vw" : "240px";

          return (
            <div
              key={index}
              style={{
                display: "flex", alignItems: "flex-end", gap: "6px",
                justifyContent: isOwn ? "flex-end" : "flex-start",
                flexDirection: isOwn ? "row" : "row-reverse",
                marginBottom: "4px", position: "relative", cursor: "pointer",
              }}
              onClick={() => setSelectedMessageId(msg._id)}
            >
              {/* Message content */}
              <div style={{ maxWidth: mw, marginBottom: "16px" }}>
                {selectedGroup && !isOwn && senderName && (
                  <p style={{ color: "#a78bfa", fontSize: "11px", fontWeight: "600", margin: "0 0 2px 14px" }}>{senderName}</p>
                )}

                {/* Image */}
                {msg?.image ? (
                  <div>
                    {msg.replyTo?.messageId && (
                      <div style={{
                        padding: "6px 10px", marginBottom: "6px", borderRadius: "10px",
                        background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(99,102,241,0.08) 100%)",
                        borderLeft: "3px solid #7c3aed",
                        borderTop: "1px solid rgba(124,58,237,0.15)",
                        borderRight: "1px solid rgba(124,58,237,0.08)",
                        borderBottom: "1px solid rgba(124,58,237,0.08)",
                        position: "relative", overflow: "hidden",
                      }}>
                        <div style={{ position: "absolute", top: 0, right: 0, width: "40px", height: "100%", background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.06))", pointerEvents: "none" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaReply size={9} color="#a78bfa" style={{ flexShrink: 0 }} />
                          <p style={{ margin: 0, fontSize: "11px", color: "#a78bfa", fontWeight: "600", letterSpacing: "0.02em" }}>{msg.replyTo.senderName}</p>
                        </div>
                        <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingLeft: "15px" }}>
                          {msg.replyTo.text || (msg.replyTo.image ? "📷 Image" : "📎 Media")}
                        </p>
                      </div>
                    )}
                    {msg.forwarded && (
                      <p style={{ margin: "0 0 4px 2px", fontSize: "11px", color: "#a78bfa", fontStyle: "italic" }}>⤴ Forwarded from {msg.forwardedFrom || "unknown"}</p>
                    )}
                    <img src={msg.image} alt="" style={{
                      width: "100%", border: "1px solid #374151", borderRadius: "12px",
                    }} />
                    {msg.text && <p style={{ color: "#d1d5db", fontSize: "13px", margin: "6px 0 0 4px", wordBreak: "break-word" }}>{msg.text}</p>}
                    {msg.reactions?.length > 0 && (
                      <ReactionBadge
                        reactions={msg.reactions}
                        currentUserId={authUser?._id}
                        onReact={(emoji) => handleReact(msg._id, emoji)}
                      />
                    )}
                  </div>
                ) : msg?.voice ? (
                  <div>
                    {msg.replyTo?.messageId && (
                      <div style={{
                        padding: "6px 10px", marginBottom: "6px", borderRadius: "10px",
                        background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(99,102,241,0.08) 100%)",
                        borderLeft: "3px solid #7c3aed",
                        borderTop: "1px solid rgba(124,58,237,0.15)",
                        borderRight: "1px solid rgba(124,58,237,0.08)",
                        borderBottom: "1px solid rgba(124,58,237,0.08)",
                        position: "relative", overflow: "hidden",
                      }}>
                        <div style={{ position: "absolute", top: 0, right: 0, width: "40px", height: "100%", background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.06))", pointerEvents: "none" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaReply size={9} color="#a78bfa" style={{ flexShrink: 0 }} />
                          <p style={{ margin: 0, fontSize: "11px", color: "#a78bfa", fontWeight: "600", letterSpacing: "0.02em" }}>{msg.replyTo.senderName}</p>
                        </div>
                        <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingLeft: "15px" }}>
                          {msg.replyTo.text || (msg.replyTo.voice ? "🎤 Voice" : "📎 Media")}
                        </p>
                      </div>
                    )}
                    <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.08)", borderRadius: "12px", minWidth: "200px" }}>
                      <audio controls src={msg.voice} style={{ width: "100%", height: "36px" }} />
                    </div>
                    {msg.reactions?.length > 0 && (
                      <ReactionBadge
                        reactions={msg.reactions}
                        currentUserId={authUser?._id}
                        onReact={(emoji) => handleReact(msg._id, emoji)}
                      />
                    )}
                  </div>
                ) : msg?.file?.url ? (
                  <div>
                    {msg.replyTo?.messageId && (
                      <div style={{
                        padding: "6px 10px", marginBottom: "6px", borderRadius: "10px",
                        background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(99,102,241,0.08) 100%)",
                        borderLeft: "3px solid #7c3aed",
                        borderTop: "1px solid rgba(124,58,237,0.15)",
                        borderRight: "1px solid rgba(124,58,237,0.08)",
                        borderBottom: "1px solid rgba(124,58,237,0.08)",
                        position: "relative", overflow: "hidden",
                      }}>
                        <div style={{ position: "absolute", top: 0, right: 0, width: "40px", height: "100%", background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.06))", pointerEvents: "none" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaReply size={9} color="#a78bfa" style={{ flexShrink: 0 }} />
                          <p style={{ margin: 0, fontSize: "11px", color: "#a78bfa", fontWeight: "600", letterSpacing: "0.02em" }}>{msg.replyTo.senderName}</p>
                        </div>
                        <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingLeft: "15px" }}>
                          {msg.replyTo.text || "📎 File"}
                        </p>
                      </div>
                    )}
                    {selectedGroup && !isOwn && senderName && (
                      <p style={{ color: "#a78bfa", fontSize: "11px", fontWeight: "600", margin: "0 0 2px 4px" }}>{senderName}</p>
                    )}
                    <a href={msg.file.url} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px",
                        borderRadius: "12px", background: "rgba(255,255,255,0.08)",
                        color: "#e5e7eb", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)",
                      }}>
                      {getFileIcon(msg.file.type)}
                      <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: "500", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {msg.file.name || "File"}
                        </p>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0 0" }}>Click to download</p>
                      </div>
                    </a>
                    {msg.reactions?.length > 0 && (
                      <ReactionBadge
                        reactions={msg.reactions}
                        currentUserId={authUser?._id}
                        onReact={(emoji) => handleReact(msg._id, emoji)}
                      />
                    )}
                  </div>
                ) : editingMessageId === msg._id ? (
                  <div style={{ width: "100%" }}>
                    <input value={editText} onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSaveEdit(e); } else if (e.key === "Escape") handleCancelEdit(); }}
                      autoFocus
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: "16px",
                        backgroundColor: "rgba(255,255,255,0.15)", color: "#fff",
                        fontSize: isMobile ? "14px" : "15px", lineHeight: "1.4",
                        border: "2px solid rgba(139,92,246,0.5)", outline: "none",
                      }} />
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <button onClick={handleSaveEdit}
                        style={{ padding: "6px 12px", borderRadius: "8px", border: "none", background: "rgba(59,130,246,0.9)", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Save</button>
                      <button onClick={handleCancelEdit}
                        style={{ padding: "6px 12px", borderRadius: "8px", border: "none", background: "rgba(107,114,128,0.9)", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  /* Text message */
                  <div>
                    {/* Reply indicator */}
                    {msg.replyTo?.messageId && (
                      <div style={{
                        padding: "6px 10px", marginBottom: "6px", borderRadius: "10px",
                        background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(99,102,241,0.08) 100%)",
                        borderLeft: "3px solid #7c3aed",
                        borderTop: "1px solid rgba(124,58,237,0.15)",
                        borderRight: "1px solid rgba(124,58,237,0.08)",
                        borderBottom: "1px solid rgba(124,58,237,0.08)",
                        position: "relative",
                        overflow: "hidden",
                      }}>
                        <div style={{ position: "absolute", top: 0, right: 0, width: "40px", height: "100%", background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.06))", pointerEvents: "none" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaReply size={9} color="#a78bfa" style={{ flexShrink: 0 }} />
                          <p style={{ margin: 0, fontSize: "11px", color: "#a78bfa", fontWeight: "600", letterSpacing: "0.02em" }}>
                            {msg.replyTo.senderName}
                          </p>
                        </div>
                        <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingLeft: "15px" }}>
                          {msg.replyTo.text || (msg.replyTo.image ? "📷 Image" : msg.replyTo.voice ? "🎤 Voice" : "📎 File")}
                        </p>
                      </div>
                    )}

                    {/* Forwarded label */}
                    {msg.forwarded && (
                      <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#a78bfa", fontStyle: "italic" }}>
                        ⤴ Forwarded from {msg.forwardedFrom || "unknown"}
                      </p>
                    )}

                    {/* Pinned label */}
                    {msg.pinned && (
                      <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#fbbf24" }}>
                        📌 Pinned
                      </p>
                    )}

                    <div style={{
                      padding: "10px 14px",
                      borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      backgroundColor: isOwn ? currentTheme.ownBubble : currentTheme.otherBubble,
                      color: currentTheme.text, fontSize: isMobile ? "14px" : "15px",
                      lineHeight: "1.4", wordBreak: "break-word",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                    }}>
                      {msg?.text || ""}
                      {msg.edited && <span style={{ fontSize: "10px", color: "#9CA3AF", marginLeft: "6px" }}>(edited)</span>}

                      {/* Link preview */}
                      {msg.linkPreview?.url && <LinkPreviewCard preview={msg.linkPreview} />}
                    </div>

                    {/* Reactions */}
                    {msg.reactions?.length > 0 && (
                      <ReactionBadge
                        reactions={msg.reactions}
                        currentUserId={authUser?._id}
                        onReact={(emoji) => handleReact(msg._id, emoji)}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Avatar + Timestamp + Actions */}
              <div style={{ textAlign: "center", fontSize: "11px", marginBottom: "24px", position: "relative" }}>
                <img src={
                  isOwn ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                } alt="" style={{
                  width: "26px", height: "26px", borderRadius: "50%",
                  objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)",
                }} />
                <p style={{ color: "#6b7280", margin: "2px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", flexDirection: "column" }}>
                  <span>{formatMessageTime(msg.createdAt)}</span>
                  {isOwn && msg?.seen && (
                    <FaCheckDouble size={12} color="#60a5fa" />
                  )}
                  {/* Seen by (groups) */}
                  {msg.seenBy?.length > 0 && selectedGroup && (
                    <span style={{ fontSize: "9px", color: "#60a5fa" }}>
                      Seen by {msg.seenBy.length}
                    </span>
                  )}
                  {msg.pinned && <FaThumbtack size={10} color="#fbbf24" />}
                </p>

                {/* Action buttons */}
                {isOwn && selectedMessageId === msg._id && (
                  <div className="msg-actions" style={{
                    position: "absolute", top: "-20px", left: "50%",
                    transform: "translateX(-120%)", display: "flex", gap: "4px", zIndex: 10,
                    flexWrap: "nowrap",
                    background: "rgba(15,23,42,0.95)", padding: "4px 6px",
                    borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    backdropFilter: "blur(12px)",
                  }}>
                    {isWithinOneHour(msg.createdAt) && (
                      <button onClick={(e) => { e.stopPropagation(); handleEditMessage(msg); }}
                        style={{ width: "28px", height: "28px", borderRadius: "7px", border: "none", background: "rgba(59,130,246,0.2)", color: "#60a5fa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", transition: "all 0.15s" }}
                        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.4)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.2)"; e.currentTarget.style.transform = "scale(1)"; }}
                        title="Edit">
                        ✏️
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg._id); }}
                      style={{ width: "28px", height: "28px", borderRadius: "7px", border: "none", background: "rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", transition: "all 0.15s" }}
                      onMouseOver={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.4)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.transform = "scale(1)"; }}
                      title="Delete for everyone">
                      <FaTrash size={10} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteForMe(msg._id); }}
                      style={{ width: "28px", height: "28px", borderRadius: "7px", border: "none", background: "rgba(107,114,128,0.2)", color: "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", transition: "all 0.15s" }}
                      onMouseOver={(e) => { e.currentTarget.style.background = "rgba(107,114,128,0.4)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = "rgba(107,114,128,0.2)"; e.currentTarget.style.transform = "scale(1)"; }}
                      title="Delete for me">
                      🗑️
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setReplyingTo(msg); setSelectedMessageId(null); }}
                      style={{ width: "28px", height: "28px", borderRadius: "7px", border: "none", background: "rgba(34,197,94,0.2)", color: "#22c55e", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", transition: "all 0.15s" }}
                      onMouseOver={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.4)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.2)"; e.currentTarget.style.transform = "scale(1)"; }}
                      title="Reply">
                      ↩️
                    </button>
                    {!msg.pinned && (
                      <button onClick={(e) => { e.stopPropagation(); handlePin(msg._id); }}
                        style={{ width: "28px", height: "28px", borderRadius: "7px", border: "none", background: "rgba(251,191,36,0.2)", color: "#fbbf24", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", transition: "all 0.15s" }}
                        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(251,191,36,0.4)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "rgba(251,191,36,0.2)"; e.currentTarget.style.transform = "scale(1)"; }}
                        title="Pin">
                        📌
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setForwardMsg(msg); }}
                      style={{ width: "28px", height: "28px", borderRadius: "7px", border: "none", background: "rgba(139,92,246,0.2)", color: "#a78bfa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", transition: "all 0.15s" }}
                      onMouseOver={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.4)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.2)"; e.currentTarget.style.transform = "scale(1)"; }}
                      title="Forward">
                      <FaForward size={10} />
                    </button>
                  </div>
                )}

                {/* Reaction trigger (for other messages) */}
                {!isOwn && selectedMessageId === msg._id && (
                  <div className="msg-actions" style={{
                    position: "absolute", top: "-20px", left: "50%",
                    transform: "translateX(-120%)", zIndex: 10,
                    background: "rgba(15,23,42,0.95)", padding: "4px 6px",
                    borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    backdropFilter: "blur(12px)",
                    display: "flex", gap: "4px",
                  }}>
                    <button onClick={(e) => { e.stopPropagation(); setReplyingTo(msg); setSelectedMessageId(null); }}
                      style={{ width: "28px", height: "28px", borderRadius: "7px", border: "none", background: "rgba(34,197,94,0.2)", color: "#22c55e", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", transition: "all 0.15s" }}
                      onMouseOver={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.4)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.2)"; e.currentTarget.style.transform = "scale(1)"; }}
                      title="Reply">
                      ↩️
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowReactionPicker(showReactionPicker === msg._id ? null : msg._id); }}
                      style={{ width: "28px", height: "28px", borderRadius: "7px", border: "none", background: "rgba(249,115,22,0.2)", color: "#f97316", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", transition: "all 0.15s", position: "relative" }}
                      onMouseOver={(e) => { e.currentTarget.style.background = "rgba(249,115,22,0.4)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = "rgba(249,115,22,0.2)"; e.currentTarget.style.transform = "scale(1)"; }}
                      title="React">
                      😊
                    </button>
                    {showReactionPicker === msg._id && (
                      <ReactionPicker onReact={(emoji) => handleReact(msg._id, emoji)} onClose={() => setShowReactionPicker(null)} />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div style={{ paddingBottom: "35px" }} ref={scrollEnd}></div>
      </div>

      {/* MESSAGE INPUT */}
      <form onSubmit={handleSendMessage} style={{
        flexShrink: 0, display: "flex", alignItems: "center", gap: isMobile ? "0.4rem" : "0.5rem",
        padding: isMobile ? "0.5rem 10px" : "0.75rem",
        paddingBottom: isMobile ? "calc(0.5rem + env(safe-area-inset-bottom, 0px))" : "0.75rem",
        background: "rgba(15,23,42,0.9)", borderTop: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          background: "rgba(255,255,255,0.08)", padding: "0 0.25rem 0 0.75rem",
          borderRadius: "24px", border: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
        }}>
          {/* Voice recorder */}
          {showVoiceRecorder ? (
            <VoiceRecorder
              onSend={(blob) => {
                sendVoiceMessage(blob);
                setShowVoiceRecorder(false);
              }}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          ) : (
            <>
              <input
                onChange={handleInputChange} value={input}
                type="text" placeholder="Type a message..."
                style={{
                  flex: 1, fontSize: isMobile ? "16px" : "0.9rem",
                  padding: isMobile ? "0.5rem 0" : "0.65rem 0",
                  border: "none", outline: "none",
                  backgroundColor: "transparent", color: "white",
                }}
              />

              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "50%", display: "flex", alignItems: "center" }}>
                <FaSmile size={18} color="#a78bfa" />
              </button>

              {/* File Upload */}
              <input onChange={handleSendImage} type="file" id="image" hidden />
              <label htmlFor="image" style={{ cursor: "pointer", display: "flex", alignItems: "center", padding: "6px", borderRadius: "50%" }}>
                <img src={assets.gallery_icon} alt="" style={{ width: "20px", opacity: 0.7, display: "block" }} />
              </label>

              {/* Voice button */}
              <button type="button" onClick={() => setShowVoiceRecorder(true)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "50%", display: "flex", alignItems: "center" }}>
                <FaMicrophone size={16} color="#a78bfa" />
              </button>
            </>
          )}
        </div>

        {/* Send Button */}
        <button type="submit" style={{
          padding: isMobile ? "10px" : "10px 18px", borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg, #7c3aed, #6d28d9)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(124,58,237,0.4)", flexShrink: 0,
          minWidth: isMobile ? "40px" : "auto",
        }}>
          {!isMobile && <span style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>Send</span>}
          <img src={assets.send_button} alt="" style={{ width: "16px", height: "16px", filter: "brightness(0) invert(1)" }} />
        </button>
      </form>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div style={{
          position: "fixed", bottom: isMobile ? "0" : "50px", right: isMobile ? "0" : "0",
          left: isMobile ? "0" : "auto", zIndex: 100,
          display: "flex", justifyContent: "center",
          alignItems: isMobile ? "flex-end" : "flex-start",
        }}>
          <div style={{ transform: isMobile ? "scale(0.85)" : "none", transformOrigin: "bottom", maxWidth: "100vw", overflow: "hidden" }}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        </div>
      )}
    </div>
  ) : (
    <div style={placeholderStyle}>
      <img src={assets.logo_icon} style={placeholderImageStyle} alt="" />
      <p style={{ fontSize: "18px", color: "#fff", fontWeight: "500" }}>
        Select a chat to start messaging
      </p>
    </div>
  );
};

export default ChatContainer;
