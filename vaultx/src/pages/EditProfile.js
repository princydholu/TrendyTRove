import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateUser } from "../redux/authSlice";
import API from "../api/axios";

function EditProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({ name: user?.name || "", email: user?.email || "", password: "", confirmPassword: "" });
  const [errors, setErrors]     = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState("");
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    setServerError(""); setSuccess("");
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim())                       newErrors.name  = "Name is required";
    else if (formData.name.trim().length < 3)         newErrors.name  = "Name must be at least 3 characters";
    if (!formData.email.trim())                       newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) newErrors.email = "Invalid email format";
    if (formData.password) {
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(formData.password)) newErrors.password = "Enter password in valid format";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      const body = { name: formData.name.trim(), email: formData.email.trim(), password: formData.password, confirmPassword: formData.confirmPassword };
      if (formData.password) body.password = formData.password;
      const res = await API.put(`/users/${user.id}`, body);
      dispatch(updateUser(res.data.user));
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate("/dashboard"), 800);
      setFormData({ ...formData, password: "", confirmPassword: "" });
    } catch (err) { setServerError(err.response?.data?.message || "Server error. Make sure backend is running!"); }
    finally { setLoading(false); }
  };

  const inputStyle = (hasErr) => ({
    width: "100%", background: "var(--bg-input)", border: `1px solid ${hasErr ? "#c0392b" : "rgba(200,169,110,0.2)"}`,
    borderRadius: "6px", padding: "11px 14px", color: "var(--text-primary)", fontSize: "13px", outline: "none",
    fontFamily: "Montserrat, sans-serif", transition: "border-color 0.2s", boxSizing: "border-box",
  });
  const labelStyle = { display: "block", fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "2px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "6px", fontWeight: 600 };

  return (
    <div style={{ flex: 1, padding: "32px", position: "relative" }}>
      {/* Modal overlay */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "480px", background: "var(--bg-card)", border: "1px solid rgba(200,169,110,0.25)", borderRadius: "12px", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(200,169,110,0.15)" }}>
            <div>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "8px", letterSpacing: "3px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "4px" }}>ACCOUNT</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", color: "var(--text-primary)", fontWeight: 400, fontStyle: "italic", margin: 0 }}>Edit Profile</h2>
            </div>
            <button onClick={() => navigate("/dashboard")} style={{ width: "32px", height: "32px", borderRadius: "6px", background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.2)", color: "var(--text-faint)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }} onMouseEnter={e => e.currentTarget.style.color = "#c8a96e"} onMouseLeave={e => e.currentTarget.style.color = "#6b5a3e"}>✕</button>
          </div>

          {/* Form */}
          <div style={{ padding: "24px" }}>
            {success && <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", fontFamily: "Montserrat, sans-serif", fontSize: "11px", padding: "12px 16px", borderRadius: "6px", marginBottom: "20px", letterSpacing: "0.5px" }}>{success}</div>}
            {serverError && <div style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", color: "#c0392b", fontFamily: "Montserrat, sans-serif", fontSize: "11px", padding: "12px 16px", borderRadius: "6px", marginBottom: "20px" }}>{serverError}</div>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={() => setFormData(p => ({ ...p, name: p.name.trim() }))} style={inputStyle(errors.name)} onFocus={e => { if (!errors.name) e.target.style.borderColor = "#c8a96e"; }} />
                {errors.name && <p style={{ color: "#c0392b", fontSize: "11px", marginTop: "4px", fontFamily: "Montserrat, sans-serif" }}>⚠ {errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email</label>
                <input type="text" name="email" value={formData.email} onChange={handleChange} onBlur={() => setFormData(p => ({ ...p, email: p.email.trim() }))} style={inputStyle(errors.email)} onFocus={e => { if (!errors.email) e.target.style.borderColor = "#c8a96e"; }} />
                {errors.email && <p style={{ color: "#c0392b", fontSize: "11px", marginTop: "4px", fontFamily: "Montserrat, sans-serif" }}>⚠ {errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>New Password <span style={{ color: "#3d2f1a", fontSize: "8px" }}>(optional)</span></label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} style={{ ...inputStyle(errors.password), paddingRight: "44px" }} onFocus={e => { if (!errors.password) e.target.style.borderColor = "#c8a96e"; }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: "12px" }}>{showPass ? "🙈" : "👁️"}</button>
                </div>
                {errors.password && <p style={{ color: "#c0392b", fontSize: "11px", marginTop: "4px", fontFamily: "Montserrat, sans-serif" }}>⚠ {errors.password}</p>}
              </div>

              {/* Confirm */}
              {formData.password && (
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showConfirm ? "text" : "password"} name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} style={{ ...inputStyle(errors.confirmPassword), paddingRight: "44px" }} onFocus={e => { if (!errors.confirmPassword) e.target.style.borderColor = "#c8a96e"; }} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: "12px" }}>{showConfirm ? "🙈" : "👁️"}</button>
                  </div>
                  {errors.confirmPassword && <p style={{ color: "#c0392b", fontSize: "11px", marginTop: "4px", fontFamily: "Montserrat, sans-serif" }}>⚠ {errors.confirmPassword}</p>}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ padding: "13px", borderRadius: "6px", border: "none", background: "linear-gradient(135deg, #c8a96e, #a07840)", color: "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1, marginTop: "8px" }}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;