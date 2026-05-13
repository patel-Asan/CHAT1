import React, { useContext, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import assets from '../assest/assets';
import { AuthContext } from '../Context/AuthContext.jsx';
import { FaUser, FaEnvelope, FaLock, FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';

const getFieldFromMessage = (msg) => {
  const m = (msg || "").toLowerCase();
  if (m.includes("email") || m.includes("account")) return "email";
  if (m.includes("password") || m.includes("credentials")) return "password";
  if (m.includes("name")) return "fullName";
  return null;
};

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bio, setBio] = useState("");
  const [focused, setFocused] = useState(null);

  const { login } = useContext(AuthContext);

  const getValidationSchema = () => Yup.object({
    fullName: (currState === "Sign up" && !isDataSubmitted)
      ? Yup.string().min(2, "Name must be at least 2 characters").required("Name is required")
      : Yup.string().notRequired(),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });

  const formik = useFormik({
    initialValues: { fullName: "", email: "", password: "" },
    validationSchema: getValidationSchema(),
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setFieldError, setSubmitting }) => {
      if (currState === "Sign up" && !isDataSubmitted) {
        setIsDataSubmitted(true);
        setSubmitting(false);
        return;
      }
      const res = await login(currState === "Sign up" ? "signup" : "login", {
        ...values, bio,
      });
      if (res && !res.success) {
        if (res.field) setFieldError(res.field, res.message);
        else {
          const field = getFieldFromMessage(res.message);
          if (field) setFieldError(field, res.message);
        }
      }
      setSubmitting(false);
    },
  });

  const switchMode = () => {
    setCurrState(currState === "Sign up" ? "Login" : "Sign up");
    setIsDataSubmitted(false);
    formik.resetForm();
  };

  const hasErr = (f) => formik.touched[f] && formik.errors[f];
  const errColor = "#ef4444";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)",
      display: "flex", justifyContent: "center", alignItems: "center",
      padding: "16px", position: "relative", overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", top: "-20%", left: "-10%", animation: "lf 8s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)", bottom: "-15%", right: "-10%", animation: "lf 10s ease-in-out infinite reverse" }} />

      <style>{`
        @keyframes lf { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-20px); } }
        input::placeholder { color: #94a3b8; font-size: 14px; }
        textarea::placeholder { color: #94a3b8; font-size: 14px; }
      `}</style>

      <div style={{
        display: "flex", gap: "0", alignItems: "center",
        maxWidth: "880px", width: "100%", justifyContent: "center",
        flexWrap: "wrap", position: "relative", zIndex: 1,
      }}>
        {/* Branding */}
        <div style={{ flex: "1", minWidth: "260px", maxWidth: "360px", textAlign: "center", padding: "16px" }}>
          <img src={assets.logo_big} alt="Logo" style={{
            width: "130px", height: "auto",
            filter: "drop-shadow(0 8px 24px rgba(124,58,237,0.3))",
            animation: "lf 6s ease-in-out infinite",
          }} />
          <p style={{ color: "#fff", fontSize: "26px", fontWeight: "700", marginTop: "12px", letterSpacing: "-0.5px" }}>
            {currState === "Sign up" ? "Join Us" : "Welcome Back"}
          </p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", margin: "6px 0 0", lineHeight: "1.5" }}>
            {currState === "Sign up" ? "Create an account and start chatting" : "Sign in to continue"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} style={{
          background: "rgba(255,255,255,0.97)", padding: "32px 28px",
          borderRadius: "20px", width: "100%", maxWidth: "400px", minWidth: "300px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}>
          <div style={{ marginBottom: "24px", textAlign: "center" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              {currState}
              {isDataSubmitted && (
                <button type="button" onClick={() => { setIsDataSubmitted(false); formik.resetForm(); }}
                  style={{ background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "all 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}>
                  <FaArrowLeft size={12} />
                </button>
              )}
            </h2>
            <p style={{ color: "#64748b", fontSize: "13px", margin: "6px 0 0" }}>
              {currState === "Sign up" ? "Fill in your details" : "Enter your credentials"}
            </p>
          </div>

          {/* Name field */}
          {currState === "Sign up" && !isDataSubmitted && (
            <div style={{ marginBottom: "16px", position: "relative" }}>
              <FaUser style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: focused === "fullName" ? "#7c3aed" : "#94a3b8", fontSize: "15px", zIndex: 1, transition: "color 0.2s" }} />
              <input type="text" placeholder="Full Name"
                {...formik.getFieldProps("fullName")}
                onFocus={(e) => setFocused("fullName")}
                onBlur={(e) => { setFocused(null); formik.handleBlur(e); }}
                style={{
                  width: "100%", padding: "13px 14px 13px 44px", borderRadius: "12px",
                  border: `2px solid ${hasErr("fullName") ? errColor : focused === "fullName" ? "#7c3aed" : "#e2e8f0"}`,
                  fontSize: "14px", outline: "none", boxSizing: "border-box",
                  background: hasErr("fullName") ? "#fef2f2" : focused === "fullName" ? "#faf5ff" : "#f8fafc",
                  transition: "all 0.2s ease",
                }} />
              {hasErr("fullName") && (
                <span style={{ color: errColor, fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px", paddingLeft: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={errColor} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {formik.errors.fullName}
                </span>
              )}
            </div>
          )}

          {/* Email + Password */}
          {!isDataSubmitted && (
            <>
              <div style={{ marginBottom: "16px", position: "relative" }}>
                <FaEnvelope style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: focused === "email" ? "#7c3aed" : "#94a3b8", fontSize: "14px", zIndex: 1, transition: "color 0.2s" }} />
                <input type="email" placeholder="Email Address"
                  {...formik.getFieldProps("email")}
                  onFocus={(e) => setFocused("email")}
                  onBlur={(e) => { setFocused(null); formik.handleBlur(e); }}
                  style={{
                    width: "100%", padding: "13px 14px 13px 44px", borderRadius: "12px",
                    border: `2px solid ${hasErr("email") ? errColor : focused === "email" ? "#7c3aed" : "#e2e8f0"}`,
                    fontSize: "14px", outline: "none", boxSizing: "border-box",
                    background: hasErr("email") ? "#fef2f2" : focused === "email" ? "#faf5ff" : "#f8fafc",
                    transition: "all 0.2s ease",
                  }} />
                {hasErr("email") && (
                  <span style={{ color: errColor, fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px", paddingLeft: "4px" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={errColor} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {formik.errors.email}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: "16px", position: "relative" }}>
                <FaLock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: focused === "password" ? "#7c3aed" : "#94a3b8", fontSize: "15px", zIndex: 1, transition: "color 0.2s" }} />
                <input type={showPassword ? "text" : "password"} placeholder="Password"
                  {...formik.getFieldProps("password")}
                  onFocus={(e) => setFocused("password")}
                  onBlur={(e) => { setFocused(null); formik.handleBlur(e); }}
                  style={{
                    width: "100%", padding: "13px 44px 13px 44px", borderRadius: "12px",
                    border: `2px solid ${hasErr("password") ? errColor : focused === "password" ? "#7c3aed" : "#e2e8f0"}`,
                    fontSize: "14px", outline: "none", boxSizing: "border-box",
                    background: hasErr("password") ? "#fef2f2" : focused === "password" ? "#faf5ff" : "#f8fafc",
                    transition: "all 0.2s ease",
                  }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#7c3aed"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}>
                  {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
                {hasErr("password") && (
                  <span style={{ color: errColor, fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px", paddingLeft: "4px" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={errColor} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {formik.errors.password}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Bio step */}
          {currState === "Sign up" && isDataSubmitted && (
            <div style={{ marginBottom: "16px" }}>
              <textarea placeholder="Tell us about yourself (optional)..." value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{
                  width: "100%", padding: "14px", borderRadius: "12px",
                  border: "2px solid #e2e8f0", fontSize: "14px", outline: "none",
                  boxSizing: "border-box", background: "#f8fafc", minHeight: "90px",
                  resize: "vertical", fontFamily: "inherit", transition: "border 0.2s",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#7c3aed"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"} />
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={formik.isSubmitting} style={{
            width: "100%", padding: "13px", borderRadius: "12px", border: "none",
            fontSize: "15px", fontWeight: "600", cursor: formik.isSubmitting ? "not-allowed" : "pointer",
            background: formik.isSubmitting ? "linear-gradient(135deg, #a78bfa, #818cf8)" : "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "#fff", opacity: formik.isSubmitting ? 0.7 : 1,
            boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
            transition: "all 0.2s ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            marginTop: "4px",
          }}
            onMouseEnter={(e) => { if (!formik.isSubmitting) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(124,58,237,0.4)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,58,237,0.3)"; }}>
            {formik.isSubmitting ? "Please wait..." : (
              currState === "Sign up" ? (
                <>{isDataSubmitted ? "Create Account" : "Continue"} <FaArrowRight size={13} /></>
              ) : (
                <>Sign In <FaArrowRight size={13} /></>
              )
            )}
          </button>

          {/* Toggle */}
          <p onClick={switchMode} style={{
            fontSize: "13px", color: "#64748b", cursor: "pointer",
            textAlign: "center", marginTop: "16px", fontWeight: "500",
            transition: "color 0.2s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#7c3aed"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}>
            {currState === "Sign up"
              ? "Already have an account? Sign in"
              : "Don't have an account? Create one"}
          </p>

          {isDataSubmitted && (
            <div style={{ marginTop: "12px", padding: "10px", borderRadius: "10px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#059669", fontSize: "13px", textAlign: "center", fontWeight: "500" }}>
              Now add a bio or skip
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
