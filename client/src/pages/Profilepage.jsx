import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from '../assest/assets';
import '../pages/a.css';
import { AuthContext } from '../Context/AuthContext.jsx';


const ProfilePage = () => {
const { authUser, updateProfile } = useContext(AuthContext);
const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 640);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);


  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onloadend = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate("/");
    };
  }

  return (
    <>
     

      <div
        style={{
          minHeight: "100vh",
          backgroundImage: `url(${assets.bgImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div
          className="profile-container"
          style={{
            width: isMobile ? "100%" : "83%",
            maxWidth: "800px",
            backdropFilter: "blur(20px)",
            color: "#e5e7eb",
            border: isMobile ? "none" : "2px solid #4b5563",
            display: "flex",
            justifyContent: "space-between",
            borderRadius: isMobile ? "0" : "10px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            overflow: "hidden",
            minHeight: isMobile ? "100dvh" : "auto",
          }}
        >
          {/* Form Section */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? "1rem" : "1.25rem",
              padding: isMobile ? "1.25rem" : "1.5rem",
              flex: 1,
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "white" }}>
              Profile Details
            </h3>

            {/* Avatar Upload */}
            <label
              htmlFor="avatar"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                cursor: "pointer",
              }}
            >
              <input
                onChange={(e) => setSelectedImg(e.target.files[0])}
                type="file"
                id="avatar"
                accept=".png, .jpg, .jpeg"
                hidden
              />
              <img
                src={
                  selectedImg
                    ? URL.createObjectURL(selectedImg)
                    : assets.avatar_icon
                }
                alt="Avatar"
                style={{
                  width: "48px",
                  height: "48px",
                  objectFit: "cover",
                  border: "1px solid #6b7280",
                  borderRadius: selectedImg ? "50%" : "0",
                }}
              />
              <span>Upload profile image</span>
            </label>

            {/* Name Input */}
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              required
              placeholder="Your name"
              style={{
                padding: "0.5rem",
                border: "1px solid #6b7280",
                borderRadius: "6px",
                background: "transparent",
                color: "white",
                outline: "none",
              }}
            />

            {/* Bio Input */}
            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              placeholder="Write profile bio"
              required
              rows={4}
              style={{
                padding: "0.5rem",
                border: "1px solid #6b7280",
                borderRadius: "6px",
                background: "transparent",
                color: "white",
                outline: "none",
                resize: "none",
              }}
            ></textarea>

            <button
              type="submit"
              style={{
                padding: "0.75rem",
                backgroundColor: "#7c3aed",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "0.3s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#6d28d9")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#7c3aed")}
            >
              Save
            </button>
          </form>

          {/* Preview Image Section */}
          <div
            className="profile-preview"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: isMobile ? "1rem" : "1.5rem",
            }}
          >
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : authUser?.profilePic || assets.logo_icon
              }
              alt="Profile Preview"
              style={{
                width: isMobile ? "100px" : "160px",
                height: isMobile ? "100px" : "160px",
                objectFit: "cover",
                borderRadius: "50%",
                border: "4px solid #7c3aed",
                boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
                transition: "transform 0.5s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
