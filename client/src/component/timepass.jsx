import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assest/assets";
import { ChatContext } from "../Context/ChatContext";
import { AuthContext } from "../Context/AuthContext";

const Timepass = () => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const { selectedUser, messages, setSelectedUser, setSelectedGroup } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!selectedUser) return null;

  // ---------------------- STYLES ----------------------
  const containerStyle = {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    color: "white",
    width: "100%",
    height: "100dvh",
    position: "relative",
    overflowY: "auto",
    padding: isMobile ? "1rem" : "2rem",
    fontSize: isMobile ? "0.9rem" : "1rem",
    backdropFilter: "blur(10px)",
  };

  const backBtnStyle = {
    position: "absolute",
    top: isMobile ? "12px" : "15px",
    left: isMobile ? "12px" : "15px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: isMobile ? "8px 14px" : "10px 18px",
    borderRadius: "25px",
    border: "none",
    cursor: "pointer",
    fontSize: isMobile ? "0.85rem" : "0.95rem",
    fontWeight: "600",
    backdropFilter: "blur(6px)",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
    letterSpacing: "0.5px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    zIndex: 10,
  };

  const profileSection = {
    paddingTop: isMobile ? "4rem" : "5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: isMobile ? "0.75rem" : "1rem",
    fontWeight: "300",
  };

  const avatarStyle = {
    width: isMobile ? "80px" : "100px",
    aspectRatio: "1/1",
    borderRadius: "50%",
    boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
    transition: "transform 0.3s ease",
    cursor: "pointer",
    border: "3px solid rgba(139, 92, 246, 0.3)",
  };

  const nameStyle = {
    fontSize: isMobile ? "1.25rem" : "1.5rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#fff",
  };

  const statusDot = {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: onlineUsers.includes(selectedUser._id) ? "#22c55e" : "#9ca3af",
    boxShadow: onlineUsers.includes(selectedUser._id) ? "0 0 8px rgba(34, 197, 94, 0.5)" : "none",
  };

  const bioStyle = {
    textAlign: "center",
    fontSize: isMobile ? "0.9rem" : "1rem",
    color: "#9ca3af",
    maxWidth: isMobile ? "280px" : "400px",
    lineHeight: "1.5",
  };

  const hrStyle = {
    border: "none",
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent)",
    margin: "1.5rem 0",
  };

  const mediaContainer = {
    fontSize: isMobile ? "0.9rem" : "1rem",
    fontWeight: "600",
    color: "#a78bfa",
  };

  const mediaGrid = {
    marginTop: "1rem",
    maxHeight: isMobile ? "200px" : "300px",
    overflowY: "auto",
    display: "grid",
    gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(3, 1fr)",
    gap: isMobile ? "0.5rem" : "0.75rem",
    paddingBottom: "2rem",
  };

  const imgThumb = {
    borderRadius: "12px",
    cursor: "pointer",
    width: "100%",
    height: "auto",
    aspectRatio: "1/1",
    objectFit: "cover",
    transition: "transform 0.3s ease",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  };

  // ---------------------- JSX ----------------------
  return (
    <div style={containerStyle}>
      {/* Back Button */}
      <button
        style={backBtnStyle}
        onClick={() => { setSelectedUser(null); setSelectedGroup(null); navigate(-1); }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
        }}
      >
        ← Back
      </button>

      {/* Profile */}
      <div style={profileSection}>
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt="Profile"
          style={avatarStyle}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        <h1 style={nameStyle}>
          <span style={statusDot}></span>
          {selectedUser.fullName}
        </h1>
        <p style={bioStyle}>{selectedUser.bio}</p>
      </div>

      <hr style={hrStyle} />

      {/* Media */}
      <div style={mediaContainer}>
        <p>Media</p>
        <div style={mediaGrid}>
          {msgImages.map((url, index) => (
            <div key={index} onClick={() => window.open(url)}>
              <img
                src={url}
                alt=""
                style={imgThumb}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timepass;
