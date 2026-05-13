import React, { useContext, useState } from 'react';
import assets from '../assest/assets';
import { AuthContext } from '../Context/AuthContext.jsx';
import { FaUser, FaEnvelope, FaLock, FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { login } = useContext(AuthContext);

  const clearFieldError = (field) => {
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (currState === "Sign up" && !isDataSubmitted && !fullName.trim()) {
      errors.fullName = "Name is required";
    }
    if (fullName.trim() && fullName.trim().length < 2) {
      errors.fullName = "Name must be at least 2 characters";
    }
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Invalid email format";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      setFieldErrors({});
      return;
    }
    const res = await login(currState === "Sign up" ? "signup" : "login", {
      fullName, email, password, bio,
    });
    if (res && !res.success && res.field) {
      setFieldErrors((prev) => ({ ...prev, [res.field]: res.message }));
    } else if (res && res.success) {
      setFieldErrors({});
    }
  }
 
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      position: "relative",
      overflow: "hidden"
    },
    containerBefore: {
      content: '""',
      position: "absolute",
      width: "200%",
      height: "200%",
      background: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
      backgroundSize: "50px 50px",
      animation: "float 20s infinite linear"
    },
    wrapper: {
      display: "flex",
      gap: "3rem",
      alignItems: "center",
      maxWidth: "900px",
      width: "100%",
      justifyContent: "center",
      flexWrap: "wrap"
    },
    logoSection: {
      textAlign: "center",
      flex: "1",
      minWidth: "280px",
      maxWidth: "400px"
    },
    logo: {
      width: "100%",
      maxWidth: "150px",
      height: "auto",
      filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.3))",
      animation: "float 6s ease-in-out infinite"
    },
    logoText: {
      color: "white",
      fontSize: "2rem",
      fontWeight: "700",
      marginTop: "1rem",
      textShadow: "0 2px 10px rgba(0,0,0,0.2)"
    },
    formContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      padding: "2.5rem",
      borderRadius: "24px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      backdropFilter: "blur(20px)",
      width: "100%",
      maxWidth: "420px",
      minWidth: "320px",
      transition: "transform 0.3s ease, box-shadow 0.3s ease"
    },
    formContainerHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.3)"
    },
    header: {
      marginBottom: "2rem",
      textAlign: "center"
    },
    heading: {
      fontSize: "1.75rem",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "0.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px"
    },
    subheading: {
      fontSize: "0.875rem",
      color: "#6b7280"
    },
    inputGroup: {
      marginBottom: "1.25rem",
      position: "relative"
    },
    inputIcon: {
      position: "absolute",
      left: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#9ca3af",
      fontSize: "1rem"
    },
    input: {
      width: "100%",
      padding: "14px 16px 14px 48px",
      borderRadius: "12px",
      border: "2px solid #e5e7eb",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      backgroundColor: "#f9fafb",
      outline: "none"
    },
    inputFocus: {
      borderColor: "#667eea",
      backgroundColor: "white",
      boxShadow: "0 0 0 4px rgba(102, 126, 234, 0.1)"
    },
    textarea: {
      width: "100%",
      padding: "14px 16px",
      borderRadius: "12px",
      border: "2px solid #e5e7eb",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      backgroundColor: "#f9fafb",
      outline: "none",
      minHeight: "100px",
      resize: "vertical",
      fontFamily: "inherit"
    },
    button: {
      width: "100%",
      padding: "14px",
      borderRadius: "12px",
      border: "none",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
      marginTop: "0.5rem"
    },
    buttonHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.5)"
    },
    link: {
      fontSize: "0.875rem",
      color: "#667eea",
      cursor: "pointer",
      textAlign: "center",
      marginTop: "1rem",
      fontWeight: "500",
      transition: "color 0.3s ease"
    },
    linkHover: {
      color: "#764ba2"
    },
    success: {
      color: "#10b981",
      fontSize: "0.875rem",
      textAlign: "center",
      marginTop: "1rem",
      padding: "10px",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      borderRadius: "8px",
      fontWeight: "500"
    },
    backButton: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "8px",
      transition: "background-color 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    backButtonHover: {
      backgroundColor: "rgba(102, 126, 234, 0.1)"
    },
    eyeButton: {
      position: "absolute",
      right: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#9ca3af",
      fontSize: "1rem",
      padding: "4px",
      transition: "color 0.3s ease"
    },
    eyeButtonHover: {
      color: "#667eea"
    },
    errorText: {
      color: "#ef4444", fontSize: "12px", marginTop: "4px", marginLeft: "4px",
      display: "flex", alignItems: "center", gap: "4px",
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @media (max-width: 768px) {
          .form-container {
            padding: 1.5rem;
            max-width: 100%;
          }
          .logo-section {
            minWidth: "200px";
            maxWidth: "250px";
          }
          .logo {
            maxWidth: "200px";
          }
          .logoText {
            fontSize: "1.5rem";
          }
        }
        @media (max-width: 480px) {
          .form-container {
            padding: 1.25rem;
            border-radius: 16px;
          }
          .heading {
            font-size: 1.5rem;
          }
          .logo-section {
            minWidth: "150px";
            maxWidth: "180px";
          }
          .logo {
            maxWidth: "150px";
          }
          .logoText {
            fontSize: "1.25rem";
          }
        }
      `}</style>
      
      <div style={styles.wrapper}>
        <div className="logo-section" style={styles.logoSection}>
          <img
            src={assets.logo_big}
            alt="Logo"
            style={styles.logo}
          />
          <p style={styles.logoText}>Welcome Back</p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          style={styles.formContainer}
          className="form-container"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = styles.formContainerHover.transform;
            e.currentTarget.style.boxShadow = styles.formContainerHover.boxShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = styles.formContainer.boxShadow;
          }}
        >
          <div style={styles.header}>
            <h2 style={styles.heading}>
              {currState}
              {isDataSubmitted && (
                <button
                  type="button"
                  onClick={() => setIsDataSubmitted(false)}
                  style={styles.backButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.backButtonHover.backgroundColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <FaArrowLeft />
                </button>
              )}
            </h2>
            <p style={styles.subheading}>
              {currState === "Sign up" 
                ? "Create your account to get started" 
                : "Welcome back! Please login to continue"}
            </p>
          </div>

          {currState === "Sign up" && !isDataSubmitted && (
            <div style={styles.inputGroup}>
              <FaUser style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); clearFieldError("fullName"); }}
                style={{ ...styles.input, borderColor: fieldErrors.fullName ? "#ef4444" : styles.input.border }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = styles.inputFocus.borderColor;
                  e.currentTarget.style.backgroundColor = styles.inputFocus.backgroundColor;
                  e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow;
                }}
                onBlur={(e) => {
                  if (!fieldErrors.fullName) e.currentTarget.style.borderColor = styles.input.border;
                  e.currentTarget.style.backgroundColor = styles.input.backgroundColor;
                  e.currentTarget.style.boxShadow = "none";
                }}
                required
              />
              {fieldErrors.fullName && <span style={styles.errorText}><span style={{ fontSize:"14px" }}>⚠</span> {fieldErrors.fullName}</span>}
            </div>
          )}

          {!isDataSubmitted && (
            <>
              <div style={styles.inputGroup}>
                <FaEnvelope style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                  style={{ ...styles.input, borderColor: fieldErrors.email ? "#ef4444" : styles.input.border }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = styles.inputFocus.borderColor;
                    e.currentTarget.style.backgroundColor = styles.inputFocus.backgroundColor;
                    e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    if (!fieldErrors.email) e.currentTarget.style.borderColor = styles.input.border;
                    e.currentTarget.style.backgroundColor = styles.input.backgroundColor;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  required
                />
                {fieldErrors.email && <span style={styles.errorText}><span style={{ fontSize:"14px" }}>⚠</span> {fieldErrors.email}</span>}
              </div>
              
              <div style={styles.inputGroup}>
                <FaLock style={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
                  style={{ ...styles.input, borderColor: fieldErrors.password ? "#ef4444" : styles.input.border }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = styles.inputFocus.borderColor;
                    e.currentTarget.style.backgroundColor = styles.inputFocus.backgroundColor;
                    e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    if (!fieldErrors.password) e.currentTarget.style.borderColor = styles.input.border;
                    e.currentTarget.style.backgroundColor = styles.input.backgroundColor;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  onMouseEnter={(e) => e.currentTarget.style.color = styles.eyeButtonHover.color}
                  onMouseLeave={(e) => e.currentTarget.style.color = styles.eyeButton.color}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {fieldErrors.password && <span style={styles.errorText}><span style={{ fontSize:"14px" }}>⚠</span> {fieldErrors.password}</span>}
              </div>
            </>
          )}

          {currState === "Sign up" && isDataSubmitted && (
            <div style={styles.inputGroup}>
              <textarea
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={styles.textarea}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = styles.inputFocus.borderColor;
                  e.currentTarget.style.backgroundColor = styles.inputFocus.backgroundColor;
                  e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = styles.input.border;
                  e.currentTarget.style.backgroundColor = styles.input.backgroundColor;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          )}

          <button
            type="submit"
            style={styles.button}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = styles.buttonHover.transform;
              e.currentTarget.style.boxShadow = styles.buttonHover.boxShadow;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = styles.button.boxShadow;
            }}
          >
            {currState === "Sign up" ? (
              <>
                Create Account <FaArrowRight style={{ marginLeft: "8px" }} />
              </>
            ) : (
              <>
                Login <FaArrowRight style={{ marginLeft: "8px" }} />
              </>
            )}
          </button>

          <p
            style={styles.link}
            onClick={() =>
              setCurrState(currState === "Sign up" ? "Login" : "Sign up")
            }
            onMouseEnter={(e) => e.currentTarget.style.color = styles.linkHover.color}
            onMouseLeave={(e) => e.currentTarget.style.color = styles.link.color}
          >
            {currState === "Sign up"
              ? "Already have an account? Login here"
              : "Don't have an account? Sign up here"}
          </p>

          {isDataSubmitted && <p style={styles.success}>✓ Data submitted successfully!</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
