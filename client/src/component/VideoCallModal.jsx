import React, { useContext, useEffect, useRef } from "react";
import { CallContext } from "../Context/CallContext";
import {
  FaPhone, FaPhoneSlash, FaVideo, FaVideoSlash,
  FaMicrophone, FaMicrophoneSlash, FaTimes,
} from "react-icons/fa";
import assets from "../assest/assets";

const VideoCallModal = () => {
  const {
    callState, CALL_STATES, remoteUser, isVideo,
    localStream, remoteStream, callDirection,
    acceptCall, rejectCall, endCall,
    toggleVideo, toggleAudio, resetCall,
  } = useContext(CallContext);

  const localRef = useRef(null);
  const remoteRef = useRef(null);

  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callState === CALL_STATES.IDLE) return null;

  const backdropStyle = {
    position: "fixed", inset: 0, zIndex: 500,
    background: "rgba(0,0,0,0.85)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  };

  const name = remoteUser?.fullName || "User";

  // ============== INCOMING CALL ==============
  if (callState === CALL_STATES.RINGING) {
    return (
      <div style={backdropStyle}>
        <div style={{ textAlign: "center" }}>
          <img src={remoteUser?.profilePic || assets.avatar_icon} alt=""
            style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", marginBottom: "16px", border: "3px solid #7c3aed" }} />
          <h2 style={{ color: "#fff", margin: "0 0 4px", fontSize: "20px" }}>{name}</h2>
          <p style={{ color: "#a78bfa", fontSize: "14px", marginBottom: "32px" }}>
            {isVideo ? "📹 Video call..." : "🎧 Audio call..."}
          </p>
          <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
            <button onClick={rejectCall} style={{
              width: "56px", height: "56px", borderRadius: "50%", border: "none",
              background: "#ef4444", color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
              boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
            }}>
              <FaPhoneSlash size={20} />
            </button>
            <button onClick={acceptCall} style={{
              width: "56px", height: "56px", borderRadius: "50%", border: "none",
              background: "#22c55e", color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
              boxShadow: "0 4px 20px rgba(34,197,94,0.4)",
              animation: "pulse 1.5s infinite",
            }}>
              <FaPhone size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============== OUTGOING CALL ==============
  if (callState === CALL_STATES.CALLING) {
    return (
      <div style={backdropStyle}>
        <div style={{ textAlign: "center" }}>
          <img src={remoteUser?.profilePic || assets.avatar_icon} alt=""
            style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", marginBottom: "16px", border: "3px solid #7c3aed" }} />
          <h2 style={{ color: "#fff", margin: "0 0 4px", fontSize: "20px" }}>{name}</h2>
          <p style={{ color: "#9CA3AF", fontSize: "14px", marginBottom: "32px" }}>
            {isVideo ? "📹 Calling..." : "🎧 Calling..."}
          </p>
          <button onClick={endCall} style={{
            width: "56px", height: "56px", borderRadius: "50%", border: "none",
            background: "#ef4444", color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
          }}>
            <FaPhoneSlash size={20} />
          </button>
        </div>
      </div>
    );
  }

  // ============== CONNECTED ==============
  if (callState === CALL_STATES.CONNECTED) {
    return (
      <div style={backdropStyle}>
        <div style={{
          position: "relative", width: "100%", maxWidth: "700px",
          height: isVideo ? "70vh" : "auto",
          borderRadius: "16px", overflow: "hidden",
          background: "#0f172a",
        }}>
          {/* Remote video/audio — always rendered so audio plays even in audio-only calls */}
          <video ref={remoteRef} autoPlay playsInline
            style={{
              width: isVideo ? "100%" : "0",
              height: isVideo ? "100%" : "0",
              objectFit: "cover",
              position: isVideo ? "static" : "absolute",
              opacity: isVideo ? 1 : 0,
              pointerEvents: isVideo ? "auto" : "none",
            }} />

          {/* Audio-only avatar */}
          {!isVideo && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "300px",
            }}>
              <img src={remoteUser?.profilePic || assets.avatar_icon} alt=""
                style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "16px" }} />
              <h3 style={{ color: "#fff", margin: 0 }}>{name}</h3>
              <p style={{ color: "#22c55e", fontSize: "13px", marginTop: "4px" }}>● Connected</p>
            </div>
          )}

          {/* Local video (PIP) — always rendered for audio too */}
          <video ref={localRef} autoPlay playsInline muted
            style={{
              position: "absolute", bottom: "80px", right: "16px",
              width: isVideo ? "120px" : "0",
              height: isVideo ? "160px" : "0",
              borderRadius: "12px",
              objectFit: "cover", border: isVideo ? "2px solid rgba(255,255,255,0.2)" : "none",
              background: "#1e293b", transform: "scaleX(-1)",
              opacity: isVideo ? 1 : 0,
              pointerEvents: isVideo ? "auto" : "none",
            }} />

          {/* Controls */}
          <div style={{
            position: "absolute", bottom: "16px", left: "50%",
            transform: "translateX(-50%)",
            display: "flex", gap: "16px", alignItems: "center",
            background: "rgba(15,23,42,0.9)", padding: "12px 20px",
            borderRadius: "50px", backdropFilter: "blur(10px)",
          }}>
            {/* Toggle audio */}
            <CallControlButton onClick={toggleAudio} icon={<FaMicrophone size={16} />}
              activeColor="#22c55e" />

            {/* End call */}
            <button onClick={endCall} style={{
              width: "48px", height: "48px", borderRadius: "50%", border: "none",
              background: "#ef4444", color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(239,68,68,0.5)",
            }}>
              <FaPhoneSlash size={18} />
            </button>

            {/* Toggle video */}
            {isVideo && (
              <CallControlButton onClick={toggleVideo} icon={<FaVideo size={16} />}
                activeColor="#3b82f6" />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============== ENDED ==============
  if (callState === CALL_STATES.ENDED) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#9CA3AF", fontSize: "16px" }}>Call ended</p>
          <button onClick={resetCall} style={{
            marginTop: "16px", padding: "8px 24px", borderRadius: "8px",
            border: "none", background: "#7c3aed", color: "#fff",
            cursor: "pointer", fontWeight: "600",
          }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return null;
};

const CallControlButton = ({ onClick, icon, activeColor }) => {
  const [active, setActive] = React.useState(true);
  return (
    <button onClick={() => { setActive(!active); onClick(); }}
      style={{
        width: "40px", height: "40px", borderRadius: "50%", border: "none",
        background: active ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.3)",
        color: active ? "#fff" : "#ef4444", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
      {active ? icon : (icon.type === FaMicrophone ? <FaMicrophoneSlash size={16} /> : <FaVideoSlash size={16} />)}
    </button>
  );
};

export default VideoCallModal;
