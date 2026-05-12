import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import assets from "../assest/assets";
import { FaArrowLeft, FaCamera, FaSave, FaCheck, FaTimes } from "react-icons/fa";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const { blockedUsers, getBlockedUsers, unblockUser, theme, updateTheme, mutedChats, unmuteChat } = useContext(ChatContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";

  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => { getBlockedUsers(); }, []);
  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setProfilePic(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      fullName,
      bio,
      profilePic: profilePic ? preview : null,
    });
    setSaving(false);
  };

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    padding: isMobile ? "0" : "20px",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: isMobile ? "100%" : "600px",
    background: "rgba(31,41,55,0.8)",
    borderRadius: isMobile ? "0" : "16px",
    overflow: "hidden",
    backdropFilter: "blur(10px)",
    border: isMobile ? "none" : "1px solid rgba(255,255,255,0.08)",
  };

  const tabStyle = (tab) => ({
    flex: 1, padding: isMobile ? "10px" : "12px",
    background: activeTab === tab ? "rgba(139,92,246,0.25)" : "transparent",
    color: activeTab === tab ? "#a78bfa" : "#9CA3AF",
    border: "none", borderBottom: activeTab === tab ? "2px solid #7c3aed" : "2px solid transparent",
    cursor: "pointer", fontWeight: "600", fontSize: isMobile ? "12px" : "14px",
    transition: "all 0.2s",
  });

  const themes = ["default", "ocean", "forest", "sunset", "midnight", "cyberpunk"];

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderBottom: "1px solid #334155" }}>
          <FaArrowLeft size={18} color="#9CA3AF" style={{ cursor: "pointer" }} onClick={() => navigate("/")} />
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Settings</h2>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #334155" }}>
          <button style={tabStyle("profile")} onClick={() => setActiveTab("profile")}>Profile</button>
          <button style={tabStyle("theme")} onClick={() => setActiveTab("theme")}>Theme</button>
          <button style={tabStyle("blocked")} onClick={() => setActiveTab("blocked")}>Blocked</button>
          <button style={tabStyle("muted")} onClick={() => setActiveTab("muted")}>Muted</button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px", overflowY: "auto", maxHeight: "calc(100vh - 180px)" }}>
          {activeTab === "profile" && (
            <>
              {/* Avatar */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px" }}>
                <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fileRef.current?.click()}>
                  <img src={preview || authUser?.profilePic || assets.avatar_icon} alt=""
                    style={{
                      width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover",
                      border: "3px solid rgba(139,92,246,0.5)",
                    }} />
                  <div style={{
                    position: "absolute", bottom: "0", right: "0",
                    background: "#7c3aed", borderRadius: "50%", width: "32px", height: "32px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FaCamera size={14} color="#fff" />
                  </div>
                </div>
                <input ref={fileRef} type="file" onChange={handleFile} accept="image/*" hidden />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "4px", display: "block" }}>Full Name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #334155",
                    background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: "14px",
                    outline: "none", boxSizing: "border-box",
                  }} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "4px", display: "block" }}>Email</label>
                <input value={authUser?.email || ""} disabled
                  style={{
                    width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #334155",
                    background: "rgba(255,255,255,0.03)", color: "#6B7280", fontSize: "14px",
                    outline: "none", boxSizing: "border-box", cursor: "not-allowed",
                  }} />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "4px", display: "block" }}>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                  style={{
                    width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #334155",
                    background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: "14px",
                    outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit",
                  }} />
              </div>

              <button onClick={handleSave} disabled={saving}
                style={{
                  width: "100%", padding: "12px", borderRadius: "10px", border: "none",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff",
                  fontWeight: "600", fontSize: "14px", cursor: saving ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}>
                <FaSave size={14} /> {saving ? "Saving..." : "Save Profile"}
              </button>
            </>
          )}

          {activeTab === "theme" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {themes.map((key) => {
                const colors = {
                  default: "#7c3aed", ocean: "#0ea5e9", forest: "#22c55e",
                  sunset: "#f97316", midnight: "#6366f1", cyberpunk: "#ec4899",
                };
                return (
                  <div key={key} onClick={() => updateTheme(key)}
                    style={{
                      padding: "16px", borderRadius: "12px", cursor: "pointer",
                      border: theme === key ? "2px solid #7c3aed" : "2px solid transparent",
                      background: "rgba(255,255,255,0.04)", textAlign: "center",
                      transition: "all 0.2s",
                    }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: colors[key], margin: "0 auto 8px",
                    }} />
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: theme === key ? "#a78bfa" : "#e5e7eb" }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      {theme === key && <FaCheck size={12} style={{ marginLeft: "6px", color: "#22c55e" }} />}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "blocked" && (
            <>
              {blockedUsers.length === 0 ? (
                <p style={{ color: "#6B7280", textAlign: "center", fontSize: "13px", marginTop: "40px" }}>
                  No blocked users
                </p>
              ) : (
                blockedUsers.map((user) => {
                  const uid = user._id || user;
                  const name = user.fullName || "Unknown";
                  return (
                    <div key={uid} style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 12px", borderRadius: "8px",
                      background: "rgba(255,255,255,0.04)", marginBottom: "6px",
                    }}>
                      <img src={user.profilePic || assets.avatar_icon} alt=""
                        style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                      <span style={{ flex: 1, fontSize: "14px", color: "#e5e7eb" }}>{name}</span>
                      <button onClick={() => unblockUser(uid)}
                        style={{
                          padding: "6px 12px", borderRadius: "8px", border: "none",
                          background: "rgba(34,197,94,0.2)", color: "#22c55e",
                          cursor: "pointer", fontSize: "12px", fontWeight: "600",
                        }}>
                        Unblock
                      </button>
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === "muted" && (
            <>
              {mutedChats.length === 0 ? (
                <p style={{ color: "#6B7280", textAlign: "center", fontSize: "13px", marginTop: "40px" }}>
                  No muted chats
                </p>
              ) : (
                mutedChats.map((m) => (
                  <div key={m.chatId} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "8px",
                    background: "rgba(255,255,255,0.04)", marginBottom: "6px",
                  }}>
                    <span style={{ flex: 1, fontSize: "14px", color: "#e5e7eb" }}>
                      🔇 {m.type === "group" ? "Group" : "Chat"} ({m.chatId?.slice(-6)})
                    </span>
                    <button onClick={() => unmuteChat(m.chatId)}
                      style={{
                        padding: "6px 12px", borderRadius: "8px", border: "none",
                        background: "rgba(59,130,246,0.2)", color: "#60a5fa",
                        cursor: "pointer", fontSize: "12px", fontWeight: "600",
                      }}>
                      Unmute
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
