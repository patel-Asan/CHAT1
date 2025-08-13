

import React, { useState, useContext, useEffect } from "react";
import assets from "../assest/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { ChatContext } from "../Context/ChatContext";

const Side = () => {
  const {
    getUsers,
    users,
    setSelectedUser,
    selectedUser,
    unseenMessages,
     setUnseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const filteredUsers = search
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  return (
    <div
      style={{
        backgroundColor: "rgba(129, 133, 178, 0.1)",
        height: "100%",
        padding: "20px",
        borderRadius: "0 12px 12px 0",
        overflowY: "auto",
        color: "#fff",
        maxWidth: "100%",
      }}
    >
      {/* Top Section */}
      <div style={{ paddingBottom: "20px" }}>
        {/* Logo & Menu */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <img
            src={assets.logo}
            alt="logo"
            style={{ maxWidth: "160px", height: "auto" }}
          />
          <div>
            <img
              src={assets.menu_icon}
              alt="Menu"
              style={{ maxHeight: "20px", cursor: "pointer" }}
              onClick={() => setMenuOpen((prev) => !prev)}
            />
            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  zIndex: 50,
                  width: "128px",
                  padding: "20px",
                  borderRadius: "8px",
                  backgroundColor: "#282142",
                  border: "1px solid #4B5563",
                  color: "#E5E7EB",
                }}
              >
                <p
                  onClick={() => navigate("/profile")}
                  style={{
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Edit Profile
                </p>
                <hr style={{ margin: "8px 0", borderColor: "#6B7280" }} />
                <p
                  onClick={logout}
                  style={{ cursor: "pointer", fontSize: "14px" }}
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div
          style={{
            backgroundColor: "#282142",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            marginTop: "20px",
          }}
        >
          <img
            src={assets.search_icon}
            alt="search"
            style={{ width: "12px" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search User..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              flex: 1,
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/* User List */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {filteredUsers.map((user, index) => (
          <div
            onClick={() => {setSelectedUser(user);  setUnseenMessages(prev => ({ ...prev, [user._id]: 0 })  )}}
            key={index}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              backgroundColor:
                selectedUser?._id === user._id
                  ? "rgba(40, 33, 66, 0.5)"
                  : "transparent",
            }}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt=""
              style={{
                width: "35px",
                height: "35px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: "20px",
              }}
            >
              <p>{user.fullName}</p>
              {
              onlineUsers.includes(user._id) 
              ? (
                <span style={{ color: "#4ADE80", fontSize: "12px" }}>
                  Online
                </span>
              ) : (
                <span style={{ color: "#F87171", fontSize: "12px" }}>
                  Offline
                </span>
              )}
            </div>
            {unseenMessages[user._id] > 0 && (
              <p
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "16px",
                  fontSize: "12px",
                  height: "20px",
                  width: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "50%",
                  backgroundColor: "rgba(139, 92, 246, 0.5)",
                }}
              >
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Side;
