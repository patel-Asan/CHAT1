import React, { useContext, useState } from 'react';
import assets from '../assest/assets';
import { AuthContext } from '../Context/AuthContext.jsx';
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash, FaGoogle, FaGithub, FaComment, FaCheck, FaArrowLeft } from 'react-icons/fa';

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
    login(currState === "Sign up" ? "signup" : "login", {
      fullName, email, password, bio,
    });
  };

  const inputStyle = (focused) => ({
    width: "100%",
    padding: "16px 16px 16px 46px",
    borderRadius: "12px",
    border: `2px solid ${focused ? "#7c3aed" : "rgba(255,255,255,0.12)"}`,
    fontSize: "15px",
    background: focused ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
    color: "#fff",
    outline: "none",
    transition: "all 0.25s ease",
    boxSizing: "border-box",
  });

  const inputIconStyle = {
    position: "absolute", left: "16px", top: "50%",
    transform: "translateY(-50%)", color: "#a78bfa",
    fontSize: "15px", pointerEvents: "none",
    transition: "color 0.25s ease",
  };

  const [focusedField, setFocusedField] = useState(null);

  const InputField = ({ icon: Icon, type, placeholder, value, onChange, field }) => (
    <div style={{ marginBottom: "14px", position: "relative" }}>
      <Icon style={{
        ...inputIconStyle,
        color: focusedField === field ? "#c4b5fd" : "#6b7280",
      }} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={inputStyle(focusedField === field)}
        onFocus={() => setFocusedField(field)}
        onBlur={() => setFocusedField(null)}
        required
      />
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    }}>
      {/* Animated gradient orbs */}
      <div style={{
        position: "absolute", width: "400px", height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
        top: "-10%", left: "-5%",
        animation: "loginFloat 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: "350px", height: "350px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
        bottom: "-10%", right: "-5%",
        animation: "loginFloat 10s ease-in-out infinite reverse",
      }} />
      <div style={{
        position: "absolute", width: "200px", height: "200px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
        top: "40%", right: "15%",
        animation: "loginFloat 12s ease-in-out infinite 2s",
      }} />

      <style>{`
        @keyframes loginFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loginSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes loginPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(124,58,237,0); }
        }
        @keyframes loginShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div style={{
        display: "flex", gap: "0",
        alignItems: "center",
        maxWidth: "880px",
        width: "100%",
        justifyContent: "center",
        flexWrap: "wrap",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Left branding */}
        <div style={{
          flex: "1", minWidth: "280px", maxWidth: "380px",
          textAlign: "center", padding: "20px",
          animation: "loginFadeIn 0.8s ease-out",
        }}>
          <div style={{
            width: "120px", height: "120px",
            margin: "0 auto 20px",
            borderRadius: "30px",
            background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(124,58,237,0.2)",
            backdropFilter: "blur(10px)",
          }}>
            <img src={assets.logo_big} alt="Logo" style={{
              width: "70px", height: "auto",
              filter: "drop-shadow(0 4px 12px rgba(124,58,237,0.3))",
            }} />
          </div>
          <h1 style={{
            color: "#fff", fontSize: "28px", fontWeight: "700",
            margin: "0 0 6px", letterSpacing: "-0.5px",
          }}>
            {currState === "Sign up" ? "Join Us Today" : "Welcome Back"}
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.5)", fontSize: "14px",
            margin: "0", lineHeight: "1.5",
          }}>
            {currState === "Sign up"
              ? "Create an account and start connecting with friends"
              : "Sign in to continue your conversations"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          padding: "36px",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          width: "100%",
          maxWidth: "400px",
          minWidth: "320px",
          boxShadow: "0 25px 60px -12px rgba(0,0,0,0.5)",
          animation: "loginFadeIn 0.6s ease-out 0.2s both",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Gradient border top */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "3px",
            background: "linear-gradient(90deg, transparent, #7c3aed, #3b82f6, transparent)",
            backgroundSize: "200% auto",
            animation: "loginShimmer 3s linear infinite",
          }} />

          {/* Header */}
          <div style={{ marginBottom: "24px", textAlign: "center" }}>
            <h2 style={{
              fontSize: "22px", fontWeight: "700",
              color: "#fff", margin: "0 0 4px",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "10px",
            }}>
              {currState}
              {isDataSubmitted && (
                <button type="button" onClick={() => setIsDataSubmitted(false)}
                  style={{
                    background: "rgba(255,255,255,0.08)", border: "none",
                    cursor: "pointer", padding: "6px", borderRadius: "8px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#a78bfa", transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}>
                  <FaArrowLeft size={13} />
                </button>
              )}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: "6px 0 0" }}>
              {currState === "Sign up"
                ? "Fill in your details below"
                : "Enter your credentials"}
            </p>
          </div>

          {/* Step indicator for signup */}
          {currState === "Sign up" && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", marginBottom: "20px",
            }}>
              {[1, 2].map((step) => (
                <React.Fragment key={step}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: "700",
                    background: (isDataSubmitted ? step === 2 : step === 1)
                      ? "linear-gradient(135deg, #7c3aed, #3b82f6)" : "rgba(255,255,255,0.08)",
                    color: (isDataSubmitted ? step === 2 : step === 1) ? "#fff" : "rgba(255,255,255,0.4)",
                    border: (isDataSubmitted ? step === 2 : step === 1)
                      ? "none" : "1px solid rgba(255,255,255,0.1)",
                    transition: "all 0.3s ease",
                    animation: (isDataSubmitted ? step === 2 : step === 1)
                      ? "loginPulse 2s infinite" : "none",
                  }}>
                    {(isDataSubmitted && step === 1) ? <FaCheck size={12} /> : step}
                  </div>
                  {step === 1 && (
                    <div style={{
                      width: "40px", height: "2px", borderRadius: "1px",
                      background: isDataSubmitted
                        ? "linear-gradient(90deg, #7c3aed, #3b82f6)"
                        : "rgba(255,255,255,0.1)",
                      transition: "all 0.3s ease",
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Step 1: Name (signup only) */}
          {currState === "Sign up" && !isDataSubmitted && (
            <div style={{ animation: "loginSlideIn 0.3s ease-out", marginBottom: "4px" }}>
              <InputField icon={FaUser} type="text" placeholder="Full Name"
                value={fullName} onChange={(e) => setFullName(e.target.value)} field="name" />
            </div>
          )}

          {/* Step 1: Email + Password */}
          {!isDataSubmitted && (
            <div style={{ animation: "loginSlideIn 0.3s ease-out" }}>
              <InputField icon={FaEnvelope} type="email" placeholder="Email Address"
                value={email} onChange={(e) => setEmail(e.target.value)} field="email" />

              <div style={{ marginBottom: "14px", position: "relative" }}>
                <FaLock style={{
                  ...inputIconStyle,
                  color: focusedField === "password" ? "#c4b5fd" : "#6b7280",
                }} />
                <input type={showPassword ? "text" : "password"} placeholder="Password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle(focusedField === "password")}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "14px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    cursor: "pointer", color: "#6b7280",
                    padding: "4px", transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}>
                  {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Bio (signup only) */}
          {currState === "Sign up" && isDataSubmitted && (
            <div style={{ marginBottom: "12px", animation: "loginSlideIn 0.3s ease-out" }}>
              <textarea placeholder="Tell us about yourself..." value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{
                  ...inputStyle(focusedField === "bio"),
                  minHeight: "90px", resize: "vertical",
                  fontFamily: "inherit", paddingTop: "14px",
                }}
                onFocus={() => setFocusedField("bio")}
                onBlur={() => setFocusedField(null)} />
            </div>
          )}

          {/* Submit button */}
          <button type="submit"
            style={{
              width: "100%", padding: "15px", borderRadius: "12px",
              border: "none", fontSize: "15px", fontWeight: "600",
              cursor: "pointer", marginTop: "4px",
              background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
              transition: "all 0.25s ease",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px",
              letterSpacing: "0.3px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(124,58,237,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,58,237,0.3)";
            }}>
            {currState === "Sign up"
              ? (isDataSubmitted ? <>Create Account <FaCheck size={14} /></> : <>Continue <FaArrowRight size={14} /></>)
              : <>Sign In <FaArrowRight size={14} /></>}
          </button>

          {/* Toggle login/signup */}
          <p
            onClick={() => {
              setCurrState(currState === "Sign up" ? "Login" : "Sign up");
              setIsDataSubmitted(false);
            }}
            style={{
              fontSize: "13px", color: "rgba(255,255,255,0.4)",
              cursor: "pointer", textAlign: "center",
              marginTop: "18px", fontWeight: "500",
              transition: "color 0.2s",
              letterSpacing: "0.2px",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
            {currState === "Sign up"
              ? "Already have an account? Sign in"
              : "Don't have an account? Create one"}
          </p>

          {/* Success message */}
          {isDataSubmitted && (
            <div style={{
              marginTop: "14px", padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#34d399", fontSize: "13px",
              textAlign: "center", fontWeight: "500",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              animation: "loginFadeIn 0.3s ease-out",
            }}>
              <FaCheck size={12} /> Now add a bio or skip
            </div>
          )}

          {/* Social login divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            marginTop: "20px",
          }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", letterSpacing: "0.5px" }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Social buttons */}
          <div style={{
            display: "flex", gap: "10px", marginTop: "14px",
            justifyContent: "center",
          }}>
            {[
              { icon: FaGoogle, color: "#ea4335" },
              { icon: FaGithub, color: "#fff" },
              { icon: FaComment, color: "#1da1f2" },
            ].map(({ icon: Icon, color }, i) => (
              <button key={i} type="button"
                style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  color, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.transform = "none";
                }}>
                <Icon />
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
