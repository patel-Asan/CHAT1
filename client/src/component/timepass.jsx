import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assest/assets";
import { ChatContext } from "../Context/ChatContext";
import { AuthContext } from "../Context/AuthContext";

const Timepass = () => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const { selectedUser, messages } = useContext(ChatContext);
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
    backgroundColor: "rgba(129,133,178,0.1)",
    color: "white",
    width: "100%",
    position: "relative",
    overflowY: "auto",
    padding: isMobile ? "1rem" : "2rem",
    fontSize: isMobile ? "0.9rem" : "1rem",
  };

  const backBtnStyle = {
    position: "absolute",
    top: "15px",
    left: "15px",
    background: "linear-gradient(135deg, #00c6ff, #0072ff)",
    color: "white",
    padding: isMobile ? "8px 14px" : "10px 18px",
    borderRadius: "30px",
    border: "none",
    cursor: "pointer",
    fontSize: isMobile ? "0.85rem" : "0.95rem",
    fontWeight: "600",
    backdropFilter: "blur(6px)",
    boxShadow: "0 4px 15px rgba(0, 114, 255, 0.4)",
    transition: "all 0.3s ease",
    letterSpacing: "0.5px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const profileSection = {
    paddingTop: isMobile ? "3rem" : "4rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    fontWeight: "300",
  };

  const avatarStyle = {
    width: isMobile ? "60px" : "80px",
    aspectRatio: "1/1",
    borderRadius: "50%",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    transition: "transform 0.3s ease",
    cursor: "pointer",
  };

  const nameStyle = {
    fontSize: isMobile ? "1rem" : "1.25rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const statusDot = {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: onlineUsers.includes(selectedUser._id) ? "green" : "gray",
  };

  const bioStyle = {
    textAlign: "center",
    fontSize: isMobile ? "0.85rem" : "1rem",
  };

  const hrStyle = {
    border: "1px solid rgba(255,255,255,0.3)",
    margin: "1rem 0",
  };

  const mediaContainer = {
    fontSize: isMobile ? "0.85rem" : "0.75rem",
  };

  const mediaGrid = {
    marginTop: "0.5rem",
    maxHeight: isMobile ? "150px" : "200px",
    overflowY: "auto",
    display: "grid",
    gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
    gap: "0.5rem",
  };

  const imgThumb = {
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
    height: "auto",
    transition: "transform 0.3s ease",
  };

  const logoutBtn = {
    background: "linear-gradient(135deg, #ff4d4d, #ff0000)",
    color: "white",
    border: "none",
    padding: isMobile ? "8px 16px" : "10px 20px",
    borderRadius: "6px",
    margin: "20px auto",
    display: "block",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: isMobile ? "0.9rem" : "1rem",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(255,0,0,0.4)",
  };

  // ---------------------- JSX ----------------------
  return (
    <div style={containerStyle}>
      {/* Back Button */}
      <button
        style={backBtnStyle}
        onClick={() => navigate(-1)}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 114, 255, 0.6)";
          e.currentTarget.style.background =
            "linear-gradient(135deg, #33d1ff, #0099ff)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow =
            "0 4px 15px rgba(0, 114, 255, 0.4)";
          e.currentTarget.style.background =
            "linear-gradient(135deg, #00c6ff, #0072ff)";
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.95)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
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

      {/* Logout Button */}
      <button
        onClick={() => logout()}
        style={logoutBtn}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,0,0,0.6)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(255,0,0,0.4)";
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Timepass;
