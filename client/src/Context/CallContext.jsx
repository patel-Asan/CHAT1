import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import { ChatContext } from "./ChatContext";

export const CallContext = createContext();

const CALL_STATES = {
  IDLE: "idle",
  CALLING: "calling",
  RINGING: "ringing",
  CONNECTED: "connected",
  ENDED: "ended",
};

export const CallProvider = ({ children }) => {
  const { socket, authUser } = useContext(AuthContext);
  const { selectedUser } = useContext(ChatContext);

  const [callState, setCallState] = useState(CALL_STATES.IDLE);
  const [remoteUser, setRemoteUser] = useState(null);
  const [isVideo, setIsVideo] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callDirection, setCallDirection] = useState(null);

  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callIdRef = useRef(null);
  const callStartRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const callStateRef = useRef(CALL_STATES.IDLE);
  const [connectionFailed, setConnectionFailed] = useState(false);

  const config = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
    iceCandidatePoolSize: 10,
  };

  const cleanupStreams = () => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((t) => t.stop());
      setRemoteStream(null);
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    localVideoRef.current = null;
    remoteVideoRef.current = null;
  };

  const resetCall = () => {
    cleanupStreams();
    setCallState(CALL_STATES.IDLE);
    callStateRef.current = CALL_STATES.IDLE;
    setRemoteUser(null);
    setCallDirection(null);
    setConnectionFailed(false);
    callIdRef.current = null;
    callStartRef.current = null;
    pendingOfferRef.current = null;
  };

  // Start a call
  const startCall = async (user, video = true) => {
    if (!user || !socket) return;
    const callId = `${authUser._id}_${Date.now()}`;
    callIdRef.current = callId;
    callStartRef.current = Date.now();

    setIsVideo(video);
    setRemoteUser(user);
    setCallDirection("outgoing");
    setCallState(CALL_STATES.CALLING);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio: true,
      });
      setLocalStream(stream);

      const pc = new RTCPeerConnection(config);
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("webrtc:ice", { to: user._id, candidate: e.candidate });
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "failed") {
          setConnectionFailed(true);
        } else if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
          setConnectionFailed(false);
        }
      };

      pc.ontrack = (e) => {
        setRemoteStream(e.streams[0]);
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc:offer", { to: user._id, offer });

      socket.emit("call:start", { to: user._id, room: authUser._id, callId, type: video ? "video" : "audio" });
    } catch (err) {
      if (err.name === "NotAllowedError") {
        alert("Camera/Microphone access denied. Please allow permissions in browser settings.");
      } else if (err.name === "NotFoundError") {
        alert("Camera or microphone not found. Check your devices.");
      } else if (err.name === "NotReadableError") {
        alert("Camera or microphone is busy (used by another app). Close other apps and try again.");
      } else {
        alert("Could not start call: " + err.message);
      }
      resetCall();
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!socket || !remoteUser) return;
    setCallState(CALL_STATES.CONNECTED);
    callStateRef.current = CALL_STATES.CONNECTED;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });
      setLocalStream(stream);

      const pc = new RTCPeerConnection(config);
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("webrtc:ice", { to: remoteUser._id, candidate: e.candidate });
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "failed") {
          setConnectionFailed(true);
        } else if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
          setConnectionFailed(false);
        }
      };

      pc.ontrack = (e) => {
        setRemoteStream(e.streams[0]);
      };

      // Process pending offer if it arrived before we accepted
      if (pendingOfferRef.current) {
        await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc:answer", { to: remoteUser._id, answer });
        pendingOfferRef.current = null;
      }

      socket.emit("call:accept", { to: remoteUser._id, room: authUser._id });
    } catch (err) {
      if (err.name === "NotAllowedError") {
        alert("Camera/Microphone access denied. Please allow permissions in browser settings.");
      } else if (err.name === "NotFoundError") {
        alert("Camera or microphone not found. Check your devices.");
      } else if (err.name === "NotReadableError") {
        alert("Camera or microphone is busy (used by another app). Close other apps and try again.");
      } else {
        alert("Could not access camera/microphone: " + err.message);
      }
      resetCall();
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    if (socket && remoteUser) {
      socket.emit("call:reject", { to: remoteUser._id, callId: callIdRef.current });
    }
    resetCall();
  };

  // End call
  const endCall = () => {
    if (socket && remoteUser) {
      const duration = callStartRef.current ? Math.floor((Date.now() - callStartRef.current) / 1000) : 0;
      socket.emit("call:end", { to: remoteUser._id, callId: callIdRef.current, duration });
    }
    setCallState(CALL_STATES.ENDED);
    setTimeout(resetCall, 1000);
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideo(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleCallIncoming = ({ from, callId, type }) => {
      callIdRef.current = callId;
      callStartRef.current = Date.now();
      setIsVideo(type === "video");
      setRemoteUser({ _id: from });
      setCallDirection("incoming");
      setCallState(CALL_STATES.RINGING);
      callStateRef.current = CALL_STATES.RINGING;
    };

    const handleCallAccepted = ({ from }) => {
      callStartRef.current = Date.now();
      setCallState(CALL_STATES.CONNECTED);
      callStateRef.current = CALL_STATES.CONNECTED;
    };

    const handleCallRejected = () => {
      alert("Call was rejected");
      resetCall();
    };

    const handleCallEnded = () => {
      setCallState(CALL_STATES.ENDED);
      callStateRef.current = CALL_STATES.ENDED;
      setTimeout(resetCall, 1000);
    };

    const handleCallCancelled = () => {
      resetCall();
    };

    const handleCallBusy = () => {
      alert("User is on another call");
      resetCall();
    };

    const handleOffer = async ({ from, offer }) => {
      if (pcRef.current && callStateRef.current === CALL_STATES.CONNECTED) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit("webrtc:answer", { to: from, answer });
      } else {
        pendingOfferRef.current = offer;
      }
    };

    const handleAnswer = async ({ answer }) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIce = async ({ candidate }) => {
      if (pcRef.current && candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          // ignore
        }
      }
    };

    const handlePeerGone = () => {
      if (callStateRef.current === CALL_STATES.CONNECTED) {
        setCallState(CALL_STATES.ENDED);
        callStateRef.current = CALL_STATES.ENDED;
        setTimeout(resetCall, 1000);
      }
    };

    socket.on("call:incoming", handleCallIncoming);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("call:rejected", handleCallRejected);
    socket.on("call:ended", handleCallEnded);
    socket.on("call:cancelled", handleCallCancelled);
    socket.on("call:busy", handleCallBusy);
    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:answer", handleAnswer);
    socket.on("webrtc:ice", handleIce);
    socket.on("peer:gone", handlePeerGone);

    return () => {
      socket.off("call:incoming", handleCallIncoming);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("call:rejected", handleCallRejected);
      socket.off("call:ended", handleCallEnded);
      socket.off("call:cancelled", handleCallCancelled);
      socket.off("call:busy", handleCallBusy);
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:answer", handleAnswer);
      socket.off("webrtc:ice", handleIce);
      socket.off("peer:gone", handlePeerGone);
    };
  }, [socket]);

  // Map remoteUser _id to actual user data
  useEffect(() => {
    if (remoteUser && remoteUser._id && !remoteUser.fullName) {
      const user = selectedUser;
      if (user && user._id === remoteUser._id) {
        setRemoteUser((prev) => ({ ...prev, ...user }));
      }
    }
  }, [remoteUser?._id, selectedUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStreams();
    };
  }, []);

  const value = {
    callState,
    CALL_STATES,
    remoteUser,
    isVideo,
    localStream,
    remoteStream,
    callDirection,
    connectionFailed,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleVideo,
    toggleAudio,
    resetCall,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};
