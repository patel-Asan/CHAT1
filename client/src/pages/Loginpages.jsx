import React, { useContext, useState } from 'react';
import assets from '../assest/assets';
import { AuthContext } from '../Context/AuthContext.jsx';

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
 
  const { login } = useContext(AuthContext);

  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
      login(currState === "Sign up" ? "signup" : "login", {
        fullName,
        email,
        password,
        bio });
  }
 
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "2rem",
      backdropFilter: "blur(20px)",
      flexWrap: "wrap",
      padding: "20px"
    },
    logo: {
      width: "min(30vw, 250px)",
      maxWidth: "250px",
    },
    form: {
      backgroundColor: "rgba(255,255,255,0.2)",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      backdropFilter: "blur(10px)",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      width: "300px",
    },
    heading: {
      fontSize: "1.25rem",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    input: {
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "14px"
    },
    button: {
      backgroundColor: "#3B82F6",
      color: "white",
      padding: "10px",
      borderRadius: "6px",
      border: "none",
      fontSize: "14px",
      cursor: "pointer",
      transition: "background-color 0.3s ease"
    },
    buttonHover: {
      backgroundColor: "#2563EB"
    },
    link: {
      fontSize: "12px",
      color: "#1D4ED8",
      cursor: "pointer",
      textAlign: "center"
    },
    success: {
      color: "green",
      fontSize: "12px",
      textAlign: "center"
    }
  };

  return (
    <div style={styles.container}>
      <img
        src={assets.logo_big}
        alt="Logo"
        style={styles.logo}
      />

      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>
          {currState}
          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="Arrow Icon"
              style={{ width: "20px", cursor: "pointer" }}
            />
          )}
        </h2>

        {currState === "Sign up" && !isDataSubmitted && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={styles.input}
            required
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </>
        )}

        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            placeholder="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ ...styles.input, minHeight: "80px" }}
          />
        )}

        <button
          type="submit"
          style={styles.button}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = styles.button.backgroundColor)
          }
        >
          {currState === "Sign up" ? "Create Now" : "Login Now"}
        </button>

        <p
          style={styles.link}
          onClick={() =>
            setCurrState(currState === "Sign up" ? "Login" : "Sign up")
          }
        >
          {currState === "Sign up"
            ? "Already have an account? Login"
            : "Don't have an account? Sign up"}
        </p>

        {isDataSubmitted && <p style={styles.success}>Data submitted successfully!</p>}
      </form>
    </div>
  );
};

export default LoginPage;
