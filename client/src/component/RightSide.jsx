import React, { useContext, useState, useEffect } from "react";
import assets from "../assest/assets";
import { ChatContext } from "../Context/ChatContext";
import { AuthContext } from "../Context/AuthContext";
import { FaTimes } from "react-icons/fa";

const RightSide = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { selectedUser, messages, selectedGroup, groups } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);
  const [msgFiles, setMsgFiles] = useState([]);
  const [viewImage, setViewImage] = useState(null);

  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image && !msg.deleted).map((msg) => msg.image));
    setMsgFiles(messages.filter((msg) => msg.file?.url && !msg.deleted).map((msg) => msg.file));
  }, [messages]);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth <= 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isMobile) return null;

  const isInGroup = selectedGroup
    ? selectedGroup.members?.some((m) => String(m._id || m) === String(authUser?._id))
    : false;

  const containerStyle = {
    backgroundColor: "rgba(129,133,178,0.1)",
    color: "white",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  };

  const scrollAreaStyle = {
    flex: 1,
    overflowY: "auto",
    paddingBottom: "10px",
  };

  if (!selectedUser && !selectedGroup) return null;

  const chatPartner = selectedUser;

  return (
    <div style={containerStyle}>
      {/* Full image viewer */}
      {viewImage && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 300,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }} onClick={() => setViewImage(null)}>
          <img src={viewImage} alt="" style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "8px" }} />
          <FaTimes size={24} color="#fff" style={{ position: "absolute", top: "20px", right: "20px", cursor: "pointer" }}
            onClick={() => setViewImage(null)} />
        </div>
      )}

      <div style={scrollAreaStyle}>
        {/* Profile section */}
        <div style={{ paddingTop: "4rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", margin: "0 auto" }}>
          <img
            src={chatPartner?.profilePic || selectedGroup?.profilePic || assets.avatar_icon}
            alt="" style={{
              width: "80px", aspectRatio: "1/1", borderRadius: "50%",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)", objectFit: "cover",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "500", margin: 0 }}>
              {chatPartner?.fullName || selectedGroup?.name}
            </h1>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              backgroundColor: onlineUsers.includes(chatPartner?._id) ? "#22c55e" : "gray",
            }} />
          </div>
          <p style={{ fontSize: "0.75rem", color: "#9CA3AF", textAlign: "center", padding: "0 2.5rem" }}>
            {chatPartner?.bio || selectedGroup?.description || "No bio"}
          </p>
        </div>

        <hr style={{ border: "1px solid rgba(255,255,255,0.1)", margin: "1rem 0" }} />

        {/* Group members */}
        {selectedGroup && (
          <div style={{ padding: "0 1.25rem", marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#9CA3AF", marginBottom: "0.5rem" }}>
              Members ({selectedGroup.members?.length || 0})
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "150px", overflowY: "auto" }}>
              {selectedGroup.members?.map((member) => {
                const mid = member._id || member;
                return (
                  <div key={mid} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "12px", fontWeight: "600", flexShrink: 0,
                    }}>
                      {(member.fullName || "U").charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: "12px", color: "#e5e7eb", flex: 1 }}>
                      {member.fullName || "Unknown"}
                      {String(member._id || member) === String(selectedGroup.admin?._id || selectedGroup.admin) && (
                        <span style={{ color: "#fbbf24", fontSize: "10px", marginLeft: "4px" }}>👑 Admin</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <hr style={{ border: "1px solid rgba(255,255,255,0.1)", margin: "1rem 0" }} />

        {/* Media Gallery */}
        <div style={{ padding: "0 1.25rem" }}>
          <p style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}>
            Media ({msgImages.length})
          </p>
          {msgImages.length === 0 ? (
            <p style={{ fontSize: "11px", color: "#6B7280" }}>No media shared yet</p>
          ) : (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem",
              maxHeight: "200px", overflowY: "auto",
            }}>
              {msgImages.map((url, i) => (
                <img key={i} src={url} alt=""
                  onClick={() => setViewImage(url)}
                  style={{ borderRadius: "6px", cursor: "pointer", width: "100%", height: "auto", transition: "transform 0.2s" }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")} />
              ))}
            </div>
          )}
        </div>

        {/* Files */}
        {msgFiles.length > 0 && (
          <>
            <hr style={{ border: "1px solid rgba(255,255,255,0.1)", margin: "1rem 0" }} />
            <div style={{ padding: "0 1.25rem" }}>
              <p style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                Files ({msgFiles.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {msgFiles.map((f, i) => (
                  <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "12px", color: "#a78bfa", textDecoration: "none" }}>
                    📎 {f.name || "File"}
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RightSide;
