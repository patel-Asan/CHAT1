import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assest/assets";
import { formatMessageTime } from "../lib/util";
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import { FaInfoCircle } from "react-icons/fa";
import Timepass from "./timepass.jsx"; // import your existing Timepass component
import "../pages/a.css"; // import the CSS file for styles

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input, setInput] = useState("");
  const [showHelpInfo, setShowHelpInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [openTimepass, setOpenTimepass] = useState(false); // new state

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const containerStyle = {
    height: "100%",
    overflowY: "scroll",
    position: "relative",
    backdropFilter: "blur(10px)",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    margin: "0 16px",
    borderBottom: "1px solid #a8a29e",
  };

  const profileImageStyle = {
    width: "32px",
    borderRadius: "50%",
  };

  const nameStyle = {
    flex: 1,
    fontSize: "18px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const statusDotStyle = {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
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
    padding: "12px",
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

  return selectedUser ? (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          style={profileImageStyle}
        />
        <p style={nameStyle}>
          {selectedUser.fullName}
          {onlineUsers?.includes(selectedUser?._id) && (
  <span style={statusDotStyle}></span>
)}

        </p>

        {isMobile && (
          <img
            onClick={() => setSelectedUser(null)}
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
      background: "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))",
      color: "#fff",
      padding: "10px 15px",
      borderRadius: "12px",
      boxShadow: "0 0 10px rgba(255,255,255,0.3)",
      width: isMobile ? "90%" : "220px",
      zIndex: 10,
      cursor: isMobile ? "pointer" : "default",
      textAlign: "center",
      fontWeight: "600",
      letterSpacing: "1px",
      transition: "all 0.4s ease",
      animation: "pulseGlow 2s infinite, bounceSlow 3s infinite",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,0.2)",
    }}
    onClick={() => {
      if (isMobile) {
        setOpenTimepass(true);
      }
    }}
    onMouseOver={(e) => {
      if (!isMobile) return;
      e.currentTarget.style.transform =
        (isMobile ? "translateX(-50%)" : "none") + " scale(1.1)";
      e.currentTarget.style.background = "rgba(255,255,255,0.3)";
      e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.6)";
    }}
    onMouseOut={(e) => {
      if (!isMobile) return;
      e.currentTarget.style.transform = isMobile
        ? "translateX(-50%)"
        : "none";
      e.currentTarget.style.background =
        "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))";
      e.currentTarget.style.boxShadow = "0 0 10px rgba(255,255,255,0.3)";
    }}
  >
    <span style={{
      background: "linear-gradient(90deg, #ff8a00, #e52e71, #9b00ff)",
      WebkitBackgroundClip: "text",
      color: "transparent",
      fontSize: isMobile ? "1.1rem" : "1rem",
      display: "inline-block",
      animation: "textWave 2s ease-in-out infinite",
       
    }}>
      Click !
    </span>
  </div>
)}




        </div>
      </div>

      {/* MESSAGES */}
      <div style={messageListStyle}>
        {messages?.map((msg, index) => {
          const senderId = msg?.senderId || msg?.sender?._id || null;
          const isOwn = senderId === authUser?._id;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "8px",
                justifyContent: isOwn ? "flex-end" : "flex-start",
                flexDirection: isOwn ? "row" : "row-reverse",
              }}
            >
              {msg?.image ? (
                <img
                  src={msg.image}
                  alt=""
                  style={{
                    maxWidth: "230px",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    overflow: "hidden",
                    marginBottom: "32px",
                  }}
                />
              ) : (
                <p
                  style={{
                    padding: "8px",
                    maxWidth: "200px",
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: 300,
                    borderRadius: "8px",
                    marginBottom: "32px",
                    wordBreak: "break-word",
                    backgroundColor: "rgba(139,92,246,0.3)",
                    color: "#fff",
                  }}
                >
                  {msg?.text || ""}
                </p>
              )}
              <div style={{ textAlign: "center", fontSize: "12px" }}>
                <img
                  src={
                    isOwn
                      ? authUser?.profilePic || assets.avatar_icon
                      : selectedUser?.profilePic || assets.avatar_icon
                  }
                  alt=""
                  style={{ width: "28px", borderRadius: "50%" }}
                />
                <p style={{ color: "#6b7280" }}>
                  {msg?.createdAt ? formatMessageTime(msg.createdAt) : ""}
                </p>
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
          gap: "0.75rem",
          padding: "0.75rem",
          background: "rgba(255, 255, 255, 0.08)",
          borderTop: "2px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Input + File Upload */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.12)",
            padding: "0 0.75rem",
            borderRadius: "9999px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            transition: "background 0.3s ease",
          }}
        >
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) =>
              e.key === "Enter" ? handleSendMessage(e) : null
            }
            type="text"
            placeholder="Type your message..."
            style={{
              flex: 1,
              fontSize: "0.9rem",
              padding: "0.75rem",
              border: "none",
              borderRadius: "0.5rem",
              outline: "none",
              backgroundColor: "transparent",
              color: "white",
            }}
          />

          {/* File Upload */}
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />
          <label
            htmlFor="image"
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={assets.gallery_icon}
              alt="Upload"
              style={{
                width: "22px",
                marginRight: "0.5rem",
                opacity: 0.8,
                transition: "opacity 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.opacity = "1")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.opacity = "0.8")
              }
            />
          </label>
        </div>

        {/* Send Button */}
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="Send"
          style={{
            width: "32px",
            cursor: "pointer",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
            transition: "transform 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.transform = "scale(1.1)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.transform = "scale(1)")
          }
        />
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
