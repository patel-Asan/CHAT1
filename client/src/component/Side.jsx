import React, { useState, useContext, useEffect } from "react";
import assets from "../assest/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";
import { FaPlus, FaUserFriends, FaUsers, FaTimes, FaBan } from "react-icons/fa";

const UserItem = ({ user, isSelected, isOnline, unseenCount, isBlocked, onClick, compact }) => {
  const [hovered, setHovered] = useState(false);
  const s = compact ? 36 : 40;
  const dot = compact ? 10 : 12;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: compact ? "8px" : "10px",
        padding: compact ? "8px 12px" : "10px 16px",
        borderRadius: "10px",
        cursor: isBlocked ? "not-allowed" : "pointer",
        fontSize: compact ? "13px" : "14px",
        backgroundColor: isSelected
          ? "rgba(139, 92, 246, 0.25)"
          : hovered
          ? "rgba(255, 255, 255, 0.08)"
          : "transparent",
        transition: "all 0.2s ease",
        marginBottom: "2px",
        opacity: isBlocked ? 0.5 : 1,
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={user?.profilePic || assets.avatar_icon}
          alt=""
          style={{
            width: s + "px",
            height: s + "px",
            objectFit: "cover",
            borderRadius: "50%",
            border: isOnline ? "2px solid #4ADE80" : "2px solid transparent",
            transition: "border 0.2s ease",
          }}
        />
        {isOnline && (
          <span style={{
            position: "absolute", bottom: "0", right: "0",
            width: dot + "px", height: dot + "px", borderRadius: "50%",
            backgroundColor: "#4ADE80", border: "2px solid #1e293b",
          }} />
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: "18px", flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: isSelected ? "600" : "400", margin: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {user.fullName}
          {isBlocked && <span style={{ color: "#ef4444", fontSize: "10px", marginLeft: "4px" }}>🚫</span>}
        </p>
        <span style={{ color: isOnline ? "#4ADE80" : "#9CA3AF", fontSize: "11px" }}>
          {isBlocked ? "Blocked" : isOnline ? "Online" : "Offline"}
        </span>
      </div>
      {unseenCount > 0 && (
        <p style={{
          fontSize: "10px", height: "20px", minWidth: "20px",
          display: "flex", justifyContent: "center", alignItems: "center",
          borderRadius: "50%", backgroundColor: "rgba(139, 92, 246, 0.7)",
          color: "#fff", fontWeight: "600", padding: "0 4px", flexShrink: 0,
        }}>
          {unseenCount}
        </p>
      )}
    </div>
  );
};

const GroupItem = ({ group, isSelected, onClick, compact }) => {
  const [hovered, setHovered] = useState(false);
  const s = compact ? 36 : 40;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center",
        gap: compact ? "8px" : "10px",
        padding: compact ? "8px 12px" : "10px 16px",
        borderRadius: "10px", cursor: "pointer",
        fontSize: compact ? "13px" : "14px",
        backgroundColor: isSelected ? "rgba(139,92,246,0.25)" : hovered ? "rgba(255,255,255,0.08)" : "transparent",
        transition: "all 0.2s ease", marginBottom: "2px",
      }}
    >
      <div style={{
        width: s + "px", height: s + "px", borderRadius: "50%",
        background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: compact ? "14px" : "16px", fontWeight: "600", flexShrink: 0,
      }}>
        {group.name.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <p style={{ fontWeight: isSelected ? "600" : "400", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {group.name}
        </p>
        <span style={{ color: "#9CA3AF", fontSize: "11px" }}>
          {group.members?.length || 0} members
        </span>
      </div>
    </div>
  );
};

const CreateGroupModal = ({ onClose, users, onCreate, fullScreen }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState([]);

  const toggleUser = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleCreate = async () => {
    if (!name.trim() || selected.length === 0) return;
    await onCreate(name.trim(), selected, description.trim());
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: fullScreen ? "flex-end" : "center",
      justifyContent: "center", zIndex: 100, padding: fullScreen ? "0" : "20px",
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#1e293b", borderRadius: fullScreen ? "20px 20px 0 0" : "16px",
        padding: fullScreen ? "20px" : "24px", width: "100%",
        maxWidth: fullScreen ? "100%" : "400px",
        maxHeight: fullScreen ? "85vh" : "80vh", overflowY: "auto",
        border: fullScreen ? "none" : "1px solid #334155",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ color: "#fff", margin: 0, fontSize: "18px" }}>Create Group</h3>
          <FaTimes size={18} color="#9CA3AF" style={{ cursor: "pointer" }} onClick={onClose} />
        </div>

        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #334155", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: "14px", outline: "none", marginBottom: "8px", boxSizing: "border-box" }} />

        <input value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Group description (optional)"
          style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #334155", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: "14px", outline: "none", marginBottom: "16px", boxSizing: "border-box" }} />

        <p style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "8px" }}>
          Select members ({selected.length})
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "250px", overflowY: "auto", marginBottom: "16px" }}>
          {users.map((user) => (
            <label key={user._id} style={{
              display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px",
              borderRadius: "8px", cursor: "pointer",
              background: selected.includes(user._id) ? "rgba(139,92,246,0.2)" : "transparent",
            }}>
              <input type="checkbox" checked={selected.includes(user._id)}
                onChange={() => toggleUser(user._id)} style={{ accentColor: "#7c3aed" }} />
              <img src={user.profilePic || assets.avatar_icon} alt=""
                style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
              <span style={{ color: "#e5e7eb", fontSize: "14px" }}>{user.fullName}</span>
            </label>
          ))}
        </div>

        <button onClick={handleCreate} style={{
          width: "100%", padding: "12px", borderRadius: "10px", border: "none",
          background: name.trim() && selected.length > 0 ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(255,255,255,0.1)",
          color: "#fff", fontWeight: "600", fontSize: "14px",
          cursor: name.trim() && selected.length > 0 ? "pointer" : "not-allowed",
        }}>
          Create Group
        </button>
      </div>
    </div>
  );
};

const Side = () => {
  const {
    getUsers, users, setSelectedUser, selectedUser,
    setSelectedGroup, selectedGroup, groups, getGroups,
    createGroup, unseenMessages, setUnseenMessages, blockedUsers,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState("chats");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredUsers = search
    ? users.filter((user) => user.fullName.toLowerCase().includes(search.toLowerCase()))
    : users;

  const filteredGroups = search
    ? groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    : groups;

  useEffect(() => {
    getUsers();
    getGroups();
  }, [onlineUsers]);

  const isUserBlocked = (userId) => blockedUsers.some((b) => (b._id || b) === userId);

  return (
    <div style={{
      backgroundColor: "rgba(129,133,178,0.08)", height: isMobile ? "100dvh" : "100%",
      padding: isMobile ? "12px" : "20px", borderRadius: "0", overflow: "hidden",
      color: "#fff", maxWidth: "100%", display: "flex", flexDirection: "column",
      boxSizing: "border-box",
    }}>
      {/* Top Section */}
      <div style={{ paddingBottom: "10px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <img src={assets.logo} alt="logo" style={{ maxWidth: isMobile ? "90px" : "120px", height: "auto" }} />
          <div>
            <img src={assets.menu_icon} alt="Menu"
              style={{ maxHeight: "20px", cursor: "pointer", opacity: 0.7 }}
              onClick={() => setMenuOpen((prev) => !prev)} />
            {menuOpen && (
              <div style={{
                position: "absolute", top: "100%", right: 0, zIndex: 50,
                width: isMobile ? "150px" : "160px", padding: "6px",
                borderRadius: "10px", backgroundColor: "#1e293b",
                border: "1px solid #334155", color: "#E5E7EB",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              }}>
                <p onClick={() => { navigate("/profile"); setMenuOpen(false); }}
                  style={{ cursor: "pointer", fontSize: "14px", padding: "8px 12px", borderRadius: "6px", margin: 0 }}>
                  👤 Edit Profile
                </p>
                <p onClick={() => { navigate("/profile?tab=theme"); setMenuOpen(false); }}
                  style={{ cursor: "pointer", fontSize: "14px", padding: "8px 12px", borderRadius: "6px", margin: 0 }}>
                  🎨 Themes
                </p>
                <p onClick={() => { navigate("/profile?tab=blocked"); setMenuOpen(false); }}
                  style={{ cursor: "pointer", fontSize: "14px", padding: "8px 12px", borderRadius: "6px", margin: 0 }}>
                  🚫 Blocked Users
                </p>
                <hr style={{ margin: "4px 0", borderColor: "#334155" }} />
                <p onClick={() => { logout(); setMenuOpen(false); }}
                  style={{ cursor: "pointer", fontSize: "14px", padding: "8px 12px", borderRadius: "6px", margin: 0, color: "#F87171" }}>
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div style={{
          backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "10px",
          display: "flex", alignItems: "center", gap: "8px",
          padding: isMobile ? "8px 12px" : "10px 14px",
          marginTop: isMobile ? "10px" : "12px", border: "1px solid rgba(255,255,255,0.05)",
        }}>
          <img src={assets.search_icon} alt="" style={{ width: "14px", opacity: 0.5 }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            type="text" placeholder={tab === "groups" ? "Search groups..." : "Search users..."}
            style={{ background: "transparent", border: "none", outline: "none", color: "#fff", flex: 1, fontSize: isMobile ? "16px" : "13px" }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: isMobile ? "8px" : "12px", flexShrink: 0 }}>
        <button onClick={() => { setTab("chats"); setSelectedGroup(null); }}
          style={{
            flex: 1, padding: isMobile ? "7px" : "8px", borderRadius: "8px", border: "none",
            background: tab === "chats" ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.05)",
            color: tab === "chats" ? "#a78bfa" : "#9CA3AF", cursor: "pointer",
            fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}>
          <FaUserFriends size={14} /> Chats
        </button>
        <button onClick={() => { setTab("groups"); setSelectedUser(null); }}
          style={{
            flex: 1, padding: "8px", borderRadius: "8px", border: "none",
            background: tab === "groups" ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.05)",
            color: tab === "groups" ? "#a78bfa" : "#9CA3AF", cursor: "pointer",
            fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}>
          <FaUsers size={14} /> Groups
        </button>
      </div>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto", minHeight: 0, paddingBottom: isMobile ? "20px" : "0" }}>
        {tab === "chats" ? (
          <>
            {filteredUsers.length === 0 ? (
              <p style={{ textAlign: "center", color: "#6B7280", fontSize: "13px", marginTop: "40px" }}>No users found</p>
            ) : (
              filteredUsers.map((user) => (
                <UserItem
                  key={user._id} user={user} compact={isMobile}
                  isSelected={selectedUser?._id === user._id}
                  isOnline={onlineUsers.includes(user._id)}
                  isBlocked={isUserBlocked(user._id)}
                  unseenCount={unseenMessages[user._id]}
                  onClick={() => {
                    if (isUserBlocked(user._id)) return;
                    setSelectedUser(user);
                    setSelectedGroup(null);
                    setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
                  }}
                />
              ))
            )}
          </>
        ) : (
          <>
            <button onClick={() => setShowCreateGroup(true)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "10px", borderRadius: "10px", border: "1px dashed rgba(139,92,246,0.4)",
                background: "rgba(139,92,246,0.08)", color: "#a78bfa", cursor: "pointer",
                fontSize: "13px", fontWeight: "500", marginBottom: "8px",
              }}>
              <FaPlus size={12} /> Create Group
            </button>

            {filteredGroups.length === 0 ? (
              <p style={{ textAlign: "center", color: "#6B7280", fontSize: "13px", marginTop: "20px" }}>No groups yet</p>
            ) : (
              filteredGroups.map((group) => (
                <GroupItem key={group._id} group={group} compact={isMobile}
                  isSelected={selectedGroup?._id === group._id}
                  onClick={() => { setSelectedGroup(group); setSelectedUser(null); }} />
              ))
            )}
          </>
        )}
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          users={users} fullScreen={isMobile}
          onClose={() => setShowCreateGroup(false)}
          onCreate={async (name, members, desc) => {
            await createGroup(name, members, desc);
            getGroups();
          }}
        />
      )}
    </div>
  );
};

export default Side;
