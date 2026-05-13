import React, { Suspense, lazy, useContext } from "react";
import "./index.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../src/Context/AuthContext";

const HomePage = lazy(() => import("./pages/Homepage"));
const ProfilePage = lazy(() => import("./pages/Profilepage"));
const LoginPage = lazy(() => import("./pages/Loginpages"));

const bgImage = "/bgImage.svg";

const Loading = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", color: "#94a3b8", fontSize: "14px" }}>
    Loading...
  </div>
);

function App() {
  const { authUser } = useContext(AuthContext);
  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toaster />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;



// npm install react-hot-toast axios socket.io-client