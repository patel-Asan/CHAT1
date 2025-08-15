import React, { useContext } from "react";
import "./index.css";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/Homepage";
import ProfilePage from "./pages/Profilepage";
import LoginPage from "./pages/Loginpages";
import { Toaster } from "react-hot-toast";

import { AuthContext } from "../src/Context/AuthContext";
// background image
import bgImage from "../public/bgImage.svg";

function App() {
  const { authUser} = useContext(AuthContext);
  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover", // ensures it fills the screen
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh", // full height for all devices
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    > < Toaster/>
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" /> } />
        <Route path="/login" element={!authUser ?  <LoginPage /> : <Navigate to="/" /> } />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;



// npm install react-hot-toast axios socket.io-client