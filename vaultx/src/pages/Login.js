import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { loginSuccess } from "../redux/authSlice";
import API from "../api/axios";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors]     = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [serverError, setServerError] = useState("");

  if (user) return <Navigate to="/dashboard" />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    setServerError("");
  };

  const validate = () => {
    let newErrors = {};
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail)                          newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) newErrors.email = "Invalid email format";
    if (!formData.password)                      newErrors.password = "Password is required";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(formData.password)) newErrors.password = "Enter password in valid format";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      const { data } = await API.post("/auth/admin/login", { email: formData.email.trim(), password: formData.password });
      localStorage.setItem("adminToken", data.token);
<<<<<<< HEAD
=======

>>>>>>> 675f20ab7278e8eabe688050868e3204a775aafb
      dispatch(loginSuccess(data.user));
      navigate("/dashboard");
    } catch (err) { setServerError(err.response?.data?.message || "Server error!"); }
    finally { setLoading(false); }
  };

  const inputStyle = (hasErr) => ({
    width: "100%", background: "var(--bg-input)", border: `1px solid ${hasErr ? "#c0392b" : "rgba(200,169,110,0.2)"}`,
    borderRadius: "6px", padding: "12px 14px", color: "var(--text-primary)", fontSize: "13px", outline: "none",
    fontFamily: "Montserrat, sans-serif", transition: "border-color 0.2s", boxSizing: "border-box",
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative", overflow: "hidden" }}>
      {/* Background glow */}
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: "500px", height: "300px", background: "radial-gradient(ellipse, rgba(200,169,110,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      {/* Decorative circles */}
      <div style={{ position: "fixed", top: "-100px", right: "-100px", width: "300px", height: "300px", borderRadius: "50%", border: "1px solid rgba(200,169,110,0.05)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-80px", left: "-80px", width: "250px", height: "250px", borderRadius: "50%", border: "1px solid rgba(200,169,110,0.05)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "420px", background: "var(--bg-card)", border: "1px solid rgba(200,169,110,0.2)", borderRadius: "12px", padding: "36px", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", position: "relative" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: "linear-gradient(135deg, #c8a96e, #a07840)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(200,169,110,0.3)", flexShrink: 0 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "16px", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.5px" }}>TT</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", fontWeight: 600, color: "#c8a96e", letterSpacing: "1px" }}>TrendyTrove</span>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "8px", letterSpacing: "3px", color: "var(--text-faint)", textTransform: "uppercase" }}>Admin Panel</span>
          </div>
        </div>

        {/* Gold divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.4), transparent)", marginBottom: "24px" }} />

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", color: "var(--text-primary)", fontWeight: 300, fontStyle: "italic", marginBottom: "4px" }}>Welcome back</h2>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1px", color: "var(--text-faint)", marginBottom: "24px" }}>Sign in to your admin account</p>

        {serverError && (
          <div style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", color: "#c0392b", fontFamily: "Montserrat, sans-serif", fontSize: "11px", padding: "12px 16px", borderRadius: "6px", marginBottom: "20px" }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Email */}
          <div>
            <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "2px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "6px", fontWeight: 600 }}>Email</label>
            <input type="text" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} onBlur={() => setFormData(p => ({ ...p, email: p.email.trim() }))} style={inputStyle(errors.email)} onFocus={e => { if (!errors.email) e.target.style.borderColor = "#c8a96e"; }} />
            {errors.email && <p style={{ color: "#c0392b", fontSize: "11px", marginTop: "4px", fontFamily: "Montserrat, sans-serif" }}>⚠ {errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "2px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "6px", fontWeight: 600 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} style={{ ...inputStyle(errors.password), paddingRight: "44px" }} onFocus={e => { if (!errors.password) e.target.style.borderColor = "#c8a96e"; }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: "12px" }}>{showPass ? "🙈" : "👁️"}</button>
            </div>
            {errors.password && <p style={{ color: "#c0392b", fontSize: "11px", marginTop: "4px", fontFamily: "Montserrat, sans-serif" }}>⚠ {errors.password}</p>}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} style={{ padding: "13px", borderRadius: "6px", border: "none", background: "linear-gradient(135deg, #c8a96e, #a07840)", color: "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1, marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {loading ? <><svg style={{ width: "16px", height: "16px", animation: "spin 0.8s linear infinite" }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Signing in...</> : "Sign In"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(200,169,110,0.15)" }} />
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "2px", color: "#3d2f1a", textTransform: "uppercase" }}>or continue with</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(200,169,110,0.15)" }} />
          </div>

          {/* Google */}
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const decoded = jwtDecode(credentialResponse.credential);
              const googleUser = { name: decoded.name, email: decoded.email, picture: decoded.picture, googleId: decoded.sub };
              try {
                const { data } = await API.post("/auth/google-login", googleUser);
                dispatch(loginSuccess(data));
                navigate("/dashboard");
              } catch (err) { setServerError(err.response?.data?.message || "Backend not running!"); }
            }}
            onError={() => setServerError("Google login failed")}
          />
        </form>

        {/* Hint */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "1px", color: "#3d2f1a" }}>dhyey@gmail.com / Dhyey@1234</p>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "1px", color: "#3d2f1a", marginTop: "2px" }}>admin@vaultx.com / Admin@123</p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Login;