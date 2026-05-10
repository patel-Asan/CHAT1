import React, { useContext, useState, useEffect, useRef } from "react";
import Side from "../component/Side";
import ChatContainer from "../component/ChatContainer";
import RightSide from "../component/RightSide";
import { ChatContext } from "../Context/ChatContext";

const HomePage = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const chatContainerRef = useRef(null);
  const scrollEndRef = useRef(null);
  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getGridTemplate = () => {
    if (isDesktop) return "1fr 1.8fr 1fr";
    if (windowWidth >= 768) return "1fr 2fr";
    return "1fr";
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    if (isAtBottom) {
      scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#e5e7eb",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: getGridTemplate(),
          width: "100%",
          height: "100%",
          maxWidth: isMobile ? "100%" : "1440px",
          borderRadius: isMobile ? "0" : "1rem",
          overflow: "hidden",
          backdropFilter: "blur(24px)",
          border: isMobile ? "none" : "2px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.7)",
          background: "rgba(15,23,42,0.7)",
        }}
      >
        {/* Sidebar - full width on mobile when no chat selected */}
        {(!isMobile || !selectedUser) && (
          <div
            style={{
              overflowY: "auto",
              scrollBehavior: "smooth",
              borderRight: isMobile ? "none" : "2px solid rgba(99,102,241,0.3)",
              background: "rgba(31,41,55,0.6)",
            }}
          >
            <Side />
          </div>
        )}

        {/* Chat Container - full width on mobile when chat selected */}
        <div
          ref={chatContainerRef}
          style={{
            overflowY: "auto",
            scrollBehavior: "smooth",
            position: "relative",
            background: "rgba(17,24,39,0.6)",
          }}
        >
          <ChatContainer />
          <div ref={scrollEndRef}></div>
        </div>

        {/* Right Panel - desktop only */}
        {isDesktop && (
          <div
            style={{
              overflowY: "auto",
              scrollBehavior: "smooth",
              borderLeft: "2px solid rgba(99,102,241,0.3)",
              background: "rgba(31,41,55,0.6)",
            }}
          >
            <RightSide />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;


// import { FaInfoCircle } from "react-icons/fa";
//  const [showHelpInfo, setShowHelpInfo] = useState(false);
 