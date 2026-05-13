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
        if (res.field) {
          setFieldError(res.field, res.message);
        } else {
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

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex", justifyContent: "center", alignItems: "center",
      padding: "20px", position: "relative", overflow: "hidden",
    },
    wrapper: {
      display: "flex", gap: "3rem", alignItems: "center",
      maxWidth: "900px", width: "100%", justifyContent: "center", flexWrap: "wrap",
    },
    logoSection: { textAlign: "center", flex: "1", minWidth: "280px", maxWidth: "400px" },
    logo: {
      width: "100%", maxWidth: "150px", height: "auto",
      filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.3))",
      animation: "float 6s ease-in-out infinite",
    },
    logoText: { color: "white", fontSize: "2rem", fontWeight: "700", marginTop: "1rem", textShadow: "0 2px 10px rgba(0,0,0,0.2)" },
    formContainer: {
      backgroundColor: "rgba(255,255,255,0.95)", padding: "2.5rem",
      borderRadius: "24px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
      backdropFilter: "blur(20px)", width: "100%", maxWidth: "420px", minWidth: "320px",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    },
    formContainerHover: { transform: "translateY(-5px)", boxShadow: "0 30px 60px -12px rgba(0,0,0,0.3)" },
    header: { marginBottom: "2rem", textAlign: "center" },
    heading: { fontSize: "1.75rem", fontWeight: "700", color: "#1f2937", marginBottom: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
    subheading: { fontSize: "0.875rem", color: "#6b7280" },
    inputGroup: { marginBottom: "1.25rem", position: "relative" },
    inputIcon: { position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "1rem", zIndex: 1 },
    input: {
      width: "100%", padding: "14px 16px 14px 48px", borderRadius: "12px",
      border: "2px solid #e5e7eb", fontSize: "1rem", transition: "all 0.3s ease",
      backgroundColor: "#f9fafb", outline: "none", boxSizing: "border-box",
    },
    inputFocus: { borderColor: "#667eea", backgroundColor: "white", boxShadow: "0 0 0 4px rgba(102,126,234,0.1)" },
    textarea: {
      width: "100%", padding: "14px 16px", borderRadius: "12px",
      border: "2px solid #e5e7eb", fontSize: "1rem", transition: "all 0.3s ease",
      backgroundColor: "#f9fafb", outline: "none", minHeight: "100px",
      resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
    },
    button: {
      width: "100%", padding: "14px", borderRadius: "12px", border: "none",
      fontSize: "1rem", fontWeight: "600", cursor: "pointer",
      transition: "all 0.3s ease",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white",
      boxShadow: "0 4px 15px rgba(102,126,234,0.4)", marginTop: "0.5rem",
    },
    buttonHover: { transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(102,126,234,0.5)" },
    link: { fontSize: "0.875rem", color: "#667eea", cursor: "pointer", textAlign: "center", marginTop: "1rem", fontWeight: "500", transition: "color 0.3s ease" },
    linkHover: { color: "#764ba2" },
    success: { color: "#10b981", fontSize: "0.875rem", textAlign: "center", marginTop: "1rem", padding: "10px", backgroundColor: "rgba(16,185,129,0.1)", borderRadius: "8px", fontWeight: "500" },
    backButton: { background: "none", border: "none", cursor: "pointer", padding: "8px", borderRadius: "8px", transition: "background-color 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center" },
    backButtonHover: { backgroundColor: "rgba(102,126,234,0.1)" },
    eyeButton: { position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "1rem", padding: "4px", transition: "color 0.3s ease", zIndex: 1 },
    eyeButtonHover: { color: "#667eea" },
    errorText: { color: "#ef4444", fontSize: "12px", marginTop: "4px", marginLeft: "4px", display: "flex", alignItems: "center", gap: "4px" },
  };

  const getInputStyle = (field) => ({
    ...styles.input,
    borderColor: formik.touched[field] && formik.errors[field] ? "#ef4444" : styles.input.border,
  });

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div style={styles.wrapper}>
        <div className="logo-section" style={styles.logoSection}>
          <img src={assets.logo_big} alt="Logo" style={styles.logo} />
          <p style={styles.logoText}>Welcome Back</p>
        </div>

        <form onSubmit={formik.handleSubmit} style={styles.formContainer}
          className="form-container"
          onMouseEnter={(e) => { e.currentTarget.style.transform = styles.formContainerHover.transform; e.currentTarget.style.boxShadow = styles.formContainerHover.boxShadow; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = styles.formContainer.boxShadow; }}
        >
          <div style={styles.header}>
            <h2 style={styles.heading}>
              {currState}
              {isDataSubmitted && (
                <button type="button" onClick={() => { setIsDataSubmitted(false); formik.resetForm(); }}
                  style={styles.backButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.backButtonHover.backgroundColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                  <FaArrowLeft />
                </button>
              )}
            </h2>
            <p style={styles.subheading}>
              {currState === "Sign up" ? "Create your account to get started" : "Welcome back! Please login to continue"}
            </p>
          </div>

          {currState === "Sign up" && !isDataSubmitted && (
            <div style={styles.inputGroup}>
              <FaUser style={styles.inputIcon} />
              <input type="text" placeholder="Full Name"
                {...formik.getFieldProps("fullName")}
                style={getInputStyle("fullName")}
                onFocus={(e) => { e.currentTarget.style.borderColor = styles.inputFocus.borderColor; e.currentTarget.style.backgroundColor = styles.inputFocus.backgroundColor; e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow; }}
                onBlur={(e) => { formik.handleBlur(e); if (!formik.errors.fullName) { e.currentTarget.style.borderColor = styles.input.border; e.currentTarget.style.backgroundColor = styles.input.backgroundColor; e.currentTarget.style.boxShadow = "none"; } }}
              />
              {formik.touched.fullName && formik.errors.fullName && (
                <span style={styles.errorText}>⚠ {formik.errors.fullName}</span>
              )}
            </div>
          )}

          {!isDataSubmitted && (
            <>
              <div style={styles.inputGroup}>
                <FaEnvelope style={styles.inputIcon} />
                <input type="email" placeholder="Email Address"
                  {...formik.getFieldProps("email")}
                  style={getInputStyle("email")}
                  onFocus={(e) => { e.currentTarget.style.borderColor = styles.inputFocus.borderColor; e.currentTarget.style.backgroundColor = styles.inputFocus.backgroundColor; e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow; }}
                  onBlur={(e) => { formik.handleBlur(e); if (!formik.errors.email) { e.currentTarget.style.borderColor = styles.input.border; e.currentTarget.style.backgroundColor = styles.input.backgroundColor; e.currentTarget.style.boxShadow = "none"; } }}
                />
                {formik.touched.email && formik.errors.email && (
                  <span style={styles.errorText}>⚠ {formik.errors.email}</span>
                )}
              </div>

              <div style={styles.inputGroup}>
                <FaLock style={styles.inputIcon} />
                <input type={showPassword ? "text" : "password"} placeholder="Password"
                  {...formik.getFieldProps("password")}
                  style={getInputStyle("password")}
                  onFocus={(e) => { e.currentTarget.style.borderColor = styles.inputFocus.borderColor; e.currentTarget.style.backgroundColor = styles.inputFocus.backgroundColor; e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow; }}
                  onBlur={(e) => { formik.handleBlur(e); if (!formik.errors.password) { e.currentTarget.style.borderColor = styles.input.border; e.currentTarget.style.backgroundColor = styles.input.backgroundColor; e.currentTarget.style.boxShadow = "none"; } }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  onMouseEnter={(e) => e.currentTarget.style.color = styles.eyeButtonHover.color}
                  onMouseLeave={(e) => e.currentTarget.style.color = styles.eyeButton.color}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {formik.touched.password && formik.errors.password && (
                  <span style={styles.errorText}>⚠ {formik.errors.password}</span>
                )}
              </div>
            </>
          )}

          {currState === "Sign up" && isDataSubmitted && (
            <div style={styles.inputGroup}>
              <textarea placeholder="Tell us about yourself..." value={bio}
                onChange={(e) => setBio(e.target.value)} style={styles.textarea} />
            </div>
          )}

          <button type="submit" style={styles.button} disabled={formik.isSubmitting}
            onMouseOver={(e) => { e.currentTarget.style.transform = styles.buttonHover.transform; e.currentTarget.style.boxShadow = styles.buttonHover.boxShadow; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = styles.button.boxShadow; }}>
            {formik.isSubmitting ? "Please wait..." : (
              currState === "Sign up" ? (
                <>{isDataSubmitted ? "Create Account" : "Continue"} <FaArrowRight style={{ marginLeft: "8px" }} /></>
              ) : (
                <>Login <FaArrowRight style={{ marginLeft: "8px" }} /></>
              )
            )}
          </button>

          <p style={styles.link} onClick={switchMode}
            onMouseEnter={(e) => e.currentTarget.style.color = styles.linkHover.color}
            onMouseLeave={(e) => e.currentTarget.style.color = styles.link.color}>
            {currState === "Sign up" ? "Already have an account? Login here" : "Don't have an account? Sign up here"}
          </p>

          {isDataSubmitted && <p style={styles.success}>✓ Now add a bio or skip</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
