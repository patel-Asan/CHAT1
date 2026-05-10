import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import assets from "../assest/assets";
import { formatMessageTime } from "../lib/util";
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import { FaInfoCircle, FaCheckDouble, FaSmile, FaTrash, FaFile, FaFilePdf, FaFileImage, FaFileArchive, FaFileWord } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import Timepass from "./timepass.jsx";
import "../pages/a.css";

const ChatContainer = () => {
  const {
    messages, selectedUser, setSelectedUser,
    selectedGroup, setSelectedGroup,
    sendMessage, sendGroupMessage, getMessages, getGroupMessages,
    deleteMessage, isTyping,
  } = useContext(ChatContext);
  const { authUser, onlineUsers, socket } = useContext(AuthContext);

  const scrollEnd = useRef();
  const typingTimeoutRef = useRef();
  const [input, setInput] = useState("");
  const [showHelpInfo, setShowHelpInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [openTimepass, setOpenTimepass] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emitTyping = useCallback((isTypingEvent) => {
    if (!socket || !selectedUser) return;
    socket.emit(isTypingEvent ? "typing" : "stopTyping", { receiverId: selectedUser._id });
  }, [socket, selectedUser]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket || !selectedUser) return;
    socket.emit("typing", { receiverId: selectedUser._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }, 1500);
  };

  const handleEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showEmojiPicker) setShowEmojiPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    emitTyping(false);
    if (selectedGroup) {
      await sendGroupMessage({ text: input.trim() });
    } else {
      await sendMessage({ text: input.trim() });
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
        await fn({
          file: { data: reader.result, name: file.name, type: file.type }
        });
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Delete this message?")) {
      await deleteMessage(messageId);
    }
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
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    } else if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
    }
  }, [selectedUser, selectedGroup, getMessages, getGroupMessages]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
    height: "100%",
    overflowY: "scroll",
    position: "relative",
    backdropFilter: "blur(10px)",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    margin: `0 ${m}`,
    borderBottom: "1px solid #a8a29e",
  };

  const profileImageStyle = {
    width: "32px",
    borderRadius: "50%",
    flexShrink: 0,
  };

  const nameStyle = {
    flex: 1,
    fontSize: isMobile ? "15px" : "18px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    overflow: "hidden",
  };

  const statusDotStyle = {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
    flexShrink: 0,
  };

  const iconStyle = {
    width: "20px",
    cursor: "pointer",
  };

  const messageListStyle = {
    display: "flex",
    flexDirection: "column",
    height: "calc(100% - 120px)",
    overflowY: "scroll",
    padding: isMobile ? "8px" : "12px",
    paddingBottom: "24px",
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

  // If mobile & openTimepass is true, show Timepass component instead
  if (openTimepass && isMobile) {
    return <Timepass />;
  }

  return (selectedUser || selectedGroup) ? (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        {selectedUser ? (
          <>
            <img
              src={selectedUser.profilePic || assets.avatar_icon}
              alt=""
              style={profileImageStyle}
            />
            <div style={{ flex: 1 }}>
              <p style={nameStyle}>
                {selectedUser.fullName}
                {onlineUsers?.includes(selectedUser?._id) && (
                  <span style={statusDotStyle}></span>
                )}
              </p>
              {isTyping && (
                <span style={{ color: "#a78bfa", fontSize: "12px", fontStyle: "italic" }}>typing...</span>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "600",
              flexShrink: 0,
            }}>
              {selectedGroup?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={nameStyle}>{selectedGroup?.name}</p>
              <span style={{ color: "#9CA3AF", fontSize: "12px" }}>
                {selectedGroup?.members?.length || 0} members
              </span>
            </div>
          </>
        )}

        {isMobile && (
          <img
            onClick={() => { setSelectedUser(null); setSelectedGroup(null); }}
            src={assets.arrow_icon}
            alt=""
            style={{ ...iconStyle, maxWidth: "28px" }}
          />
        )}

        {/* Help Icon */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <FaInfoCircle
            size={20}
            color="#facc15"
            style={{ cursor: "pointer" }}
            onClick={() => setShowHelpInfo(!showHelpInfo)}
          />

         {showHelpInfo && (
  <div
    style={{
      position: "absolute",
      top: isMobile ? "40px" : "30px",
      right: isMobile ? "auto" : 0,
      left: isMobile ? "50%" : "auto",
      transform: isMobile ? "translateX(-50%)" : "none",
      background: "rgba(30, 41, 59, 0.95)",
      color: "#fff",
      padding: "12px 16px",
      borderRadius: "12px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
      width: isMobile ? "90%" : "220px",
      zIndex: 10,
      cursor: isMobile ? "pointer" : "default",
      textAlign: "center",
      fontWeight: "500",
      fontSize: "13px",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,0.1)",
    }}
    onClick={() => {
      if (isMobile) {
        setOpenTimepass(true);
      }
    }}
  >
    {isMobile ? "Tap to view profile" : "User profile info"}
  </div>
)}




        </div>
      </div>

      {/* MESSAGES */}
      <div style={messageListStyle}>
        {messages?.map((msg, index) => {
          const senderId = msg?.senderId || msg?.sender?._id || null;
          const isOwn = senderId === authUser?._id;

          const senderName = msg.senderId?.fullName || "";

          if (msg?.deleted) {
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: isOwn ? "flex-end" : "flex-start",
                  marginBottom: "4px",
                }}
              >
                <div>
                  {selectedGroup && !isOwn && senderName && (
                    <p style={{ color: "#9CA3AF", fontSize: "11px", margin: "0 0 2px 12px" }}>{senderName}</p>
                  )}
                  <p style={{
                    color: "#6b7280",
                    fontSize: "12px",
                    fontStyle: "italic",
                    padding: "4px 12px",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "12px",
                    marginBottom: "24px",
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
                display: "flex",
                alignItems: "flex-end",
                gap: "6px",
                justifyContent: isOwn ? "flex-end" : "flex-start",
                flexDirection: isOwn ? "row" : "row-reverse",
                marginBottom: "4px",
                position: "relative",
              }}
              onMouseOver={(e) => {
                if (isOwn) {
                  const btn = e.currentTarget.querySelector(".delete-btn");
                  if (btn) btn.style.display = "flex";
                }
              }}
              onMouseOut={(e) => {
                const btn = e.currentTarget.querySelector(".delete-btn");
                if (btn) btn.style.display = "none";
              }}
            >

              {msg?.image ? (
                <div style={{ maxWidth: isMobile ? "80vw" : "250px", marginBottom: "16px" }}>
                  {selectedGroup && !isOwn && senderName && (
                    <p style={{ color: "#a78bfa", fontSize: "11px", fontWeight: "600", margin: "0 0 2px 4px" }}>{senderName}</p>
                  )}
                  <img
                    src={msg.image}
                    alt=""
                    style={{
                      width: "100%",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                    }}
                  />
                  {msg.text && (
                    <p style={{
                      color: "#d1d5db",
                      fontSize: "13px",
                      margin: "6px 0 0 4px",
                      wordBreak: "break-word",
                    }}>
                      {msg.text}
                    </p>
                  )}
                </div>
              ) : msg?.file?.url ? (
                <div style={{ width: "100%", maxWidth: mw, marginBottom: "16px" }}>
                  {selectedGroup && !isOwn && senderName && (
                    <p style={{ color: "#a78bfa", fontSize: "11px", fontWeight: "600", margin: "0 0 2px 4px" }}>{senderName}</p>
                  )}
                  <a
                    href={msg.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.08)",
                      color: "#e5e7eb",
                      textDecoration: "none",
                      border: "1px solid rgba(255,255,255,0.1)",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                  >
                    {getFileIcon(msg.file.type)}
                    <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: "500", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {msg.file.name || "File"}
                      </p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0 0" }}>
                        Click to download
                      </p>
                    </div>
                  </a>
                  </div>
              ) : (
                <div style={{ maxWidth: mw, marginBottom: "16px" }}>
                  {selectedGroup && !isOwn && senderName && (
                    <p style={{ color: "#a78bfa", fontSize: "11px", fontWeight: "600", margin: "0 0 2px 14px" }}>{senderName}</p>
                  )}
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      backgroundColor: isOwn
                        ? "rgba(139, 92, 246, 0.7)"
                        : "rgba(255, 255, 255, 0.12)",
                      color: "#fff",
                      fontSize: isMobile ? "14px" : "15px",
                      lineHeight: "1.4",
                      wordBreak: "break-word",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                    }}
                  >
                    {msg?.text || ""}
                  </div>
                </div>
              )}

              <div style={{ textAlign: "center", fontSize: "11px", marginBottom: "24px", position: "relative" }}>
                <img
                  src={
                    isOwn
                      ? authUser?.profilePic || assets.avatar_icon
                      : selectedUser?.profilePic || assets.avatar_icon
                  }
                  alt=""
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                <p style={{ color: "#6b7280", margin: "2px 0 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  {msg?.createdAt ? formatMessageTime(msg.createdAt) : ""}
                  {isOwn && msg?.seen && (
                    <FaCheckDouble size={12} color="#60a5fa" />
                  )}
                </p>
                {isOwn && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteMessage(msg._id)}
                    style={{
                      display: isMobile ? "flex" : "none",
                      position: "absolute",
                      top: "-20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(239, 68, 68, 0.9)",
                      border: "none",
                      borderRadius: "6px",
                      padding: isMobile ? "6px 10px" : "4px 8px",
                      cursor: "pointer",
                      alignItems: "center",
                      gap: "4px",
                      color: "#fff",
                      fontSize: "10px",
                      whiteSpace: "nowrap",
                      zIndex: 5,
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "rgba(220, 38, 38, 1)")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.9)")}
                  >
                    <FaTrash size={10} /> Delete
                  </button>
                )}
              </div>
            </div>
          );
          
        })}

        <div style={{ paddingBottom: "35px" }} ref={scrollEnd}></div>
      </div>

      {/* MESSAGE INPUT */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "0.4rem" : "0.5rem",
          padding: isMobile ? "0.5rem" : "0.75rem",
          paddingBottom: isMobile ? "calc(0.5rem + env(safe-area-inset-bottom, 0px))" : "0.75rem",
          background: "rgba(15, 23, 42, 0.9)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Input + Buttons */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.08)",
            padding: "0 0.25rem 0 0.75rem",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            transition: "border 0.2s ease, background 0.2s ease",
            position: "relative",
          }}
        >
          <input
            onChange={handleInputChange}
            value={input}
            onKeyDown={(e) =>
              e.key === "Enter" ? handleSendMessage(e) : null
            }
            type="text"
            placeholder="Type a message..."
            style={{
              flex: 1,
              fontSize: isMobile ? "16px" : "0.9rem",
              padding: isMobile ? "0.5rem 0" : "0.65rem 0",
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              color: "white",
            }}
          />

          {/* Emoji Picker */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <FaSmile size={18} color="#a78bfa" />
          </button>

          {showEmojiPicker && (
            <div style={{
              position: "fixed",
              bottom: isMobile ? "0" : "50px",
              right: isMobile ? "0" : "0",
              left: isMobile ? "0" : "auto",
              zIndex: 100,
              display: "flex",
              justifyContent: "center",
              alignItems: isMobile ? "flex-end" : "flex-start",
            }}>
              <div style={{
                transform: isMobile ? "scale(0.85)" : "none",
                transformOrigin: "bottom",
                maxWidth: "100vw",
                overflow: "hidden",
              }}>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            </div>
          )}

          {/* File Upload */}
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            hidden
          />
          <label
            htmlFor="image"
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: "6px",
              borderRadius: "50%",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <img
              src={assets.gallery_icon}
              alt="Upload"
              style={{
                width: "20px",
                opacity: 0.7,
                display: "block",
              }}
            />
          </label>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          style={{
            padding: isMobile ? "10px" : "10px 18px",
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.4)",
            flexShrink: 0,
            aspectRatio: isMobile ? "1" : "auto",
            minWidth: isMobile ? "40px" : "auto",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(124, 58, 237, 0.6)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.4)";
          }}
        >
          {!isMobile && <span style={{ color: "white", fontWeight: "600", fontSize: "14px" }}>Send</span>}
          <img
            src={assets.send_button}
            alt="Send"
            style={{
              width: "16px",
              height: "16px",
              filter: "brightness(0) invert(1)",
            }}
          />
        </button>
      </div>
    </div>
  ) : (
    <div style={placeholderStyle}>
      <img src={assets.logo_icon} style={placeholderImageStyle} alt="" />
      <p style={{ fontSize: "18px", color: "#fff", fontWeight: "500" }}>
        Chat anytime, anywhere
      </p>
    </div>
  );
};

export default ChatContainer;
