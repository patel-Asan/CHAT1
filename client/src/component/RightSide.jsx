import React, { useContext, useState, useEffect } from "react";
import assets, { imagesDummyData } from "../assest/assets";
import { ChatContext } from "../Context/ChatContext";
import { AuthContext } from "../Context/AuthContext";

const RightSide = () => {
    const [isMobile, setIsMobile] = useState(false);

    const { selectedUser, messages } = useContext(ChatContext);
    const { logout, onlineUsers } = useContext(AuthContext);
   const [msgImages, setMsgImages] = useState([]);


useEffect(() => {
    setMsgImages(
        messages.filter(msg=> msg.image).map(msg=> msg.image)
    )
}, [messages]);

    // Responsive check
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    if (!selectedUser || isMobile) return null;

    const containerStyle = {
        backgroundColor: "rgba(129,133,178,0.1)",
        color: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "all 0.5s ease-in-out",
    };

    const scrollAreaStyle = {
        flex: 1,
        overflowY: "auto",
        paddingBottom: "10px",
    };

    const profileSection = {
        paddingTop: "4rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.75rem",
        fontWeight: "300",
        margin: "0 auto",
    };

    const avatarStyle = {
        width: "80px",
        aspectRatio: "1/1",
        borderRadius: "50%",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        transition: "transform 0.3s ease",
        cursor: "pointer",
    };

    const nameStyle = {
        padding: "0 2.5rem",
        fontSize: "1.25rem",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    };

    const statusDot = {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: "#22c55e",
        animation: "pulse 1.5s infinite",
    };

    const bioStyle = {
        padding: "0 2.5rem",
        textAlign: "center",
    };

    const hrStyle = {
        border: "1px solid rgba(255,255,255,0.3)",
        margin: "1rem 0",
    };

    const mediaContainer = {
        padding: "0 1.25rem",
        fontSize: "0.75rem",
    };

    const mediaGrid = {
        marginTop: "0.5rem",
        maxHeight: "200px",
        overflowY: "scroll",
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1rem",
        opacity: "0.8",
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
        padding: "12px 20px",
        borderRadius: "8px",
        margin: "16px",
        display: "block",
        width: "calc(100% - 32px)",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "14px",
        letterSpacing: "0.5px",
        transition: "transform 0.3s ease, background 0.3s ease",
        boxShadow: "0 4px 15px rgba(255,0,0,0.3)",
    };

    return (
        <div style={containerStyle}>
            <div style={scrollAreaStyle}>
                <div style={profileSection}>
                    <img
                        src={selectedUser?.profilePic || assets.avatar_icon}
                        alt="Profile"
                        style={avatarStyle}
                        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                   <h1 style={nameStyle}>
      <span
        style={{
          ...statusDot,
          backgroundColor: onlineUsers.includes(selectedUser._id) ? "green" : "gray",
        }}
      ></span>
      {selectedUser.fullName}
    </h1>

                    <p style={bioStyle}>{selectedUser.bio}</p>
                </div>

                <hr style={hrStyle} />

                <div style={mediaContainer}>
                    <p>Media</p>
                    <div style={mediaGrid}>
                        {msgImages.map((url, index) => (
                            <div key={index} onClick={() => window.open(url)}>
                                <img
                                    src={url}
                                    alt=""
                                    style={imgThumb}
                                    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                                    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

          
        </div>
    );
};

export default RightSide;
