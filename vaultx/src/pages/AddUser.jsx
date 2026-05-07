import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const validate = (field, value, allValues = {}) => {
  switch (field) {
    case "name":
      if (!value.trim()) return "Full name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      return "";
    case "email":
      if (!value.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email";
      return "";
    case "password":
      if (!value) return "Password is required";
      if (value.length < 8) return "Minimum 8 characters";
      if (!/[A-Z]/.test(value)) return "Must contain uppercase letter";
      if (!/[0-9]/.test(value)) return "Must contain a number";
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) return "Must contain special character";
      return "";
    case "confirmPassword":
      if (!value) return "Please confirm your password";
      if (value !== allValues.password) return "Passwords don't match";
      return "";
    case "role":
      if (!value) return "Please select a role";
      return "";
    default:
      return "";
  }
};

const S = {
  input: (err) => ({
    width: "100%", background: "var(--bg-input)",
    border: `1px solid ${err ? "#c0392b" : "rgba(200,169,110,0.2)"}`,
    borderRadius: "6px", padding: "10px 14px", color: "var(--text-primary)",
    fontSize: "13px", outline: "none", fontFamily: "Montserrat, sans-serif",
    transition: "border-color 0.2s", boxSizing: "border-box",
  }),
  label: { display: "block", fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "2px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "6px", fontWeight: 600 },
};

function AddUser() {
  const navigate = useNavigate();
  const [formData, setFormData]     = useState({ name: "", email: "", password: "", confirmPassword: "", role: "" });
  const [errors, setErrors]         = useState({});
  const [touched, setTouched]       = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [serverError, setServerError]   = useState("");

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validate(field, value, { ...formData, [field]: value }) }));
    setServerError("");
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validate(field, formData[field] || "", formData) }));
  };

  const validateAll = () => {
    const fields = ["name", "email", "password", "confirmPassword", "role"];
    const newErrors = {}, newTouched = {};
    fields.forEach(f => { newErrors[f] = validate(f, formData[f] || "", formData); newTouched[f] = true; });
    setErrors(newErrors); setTouched(newTouched);
    return Object.values(newErrors).every(e => !e);
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    setSaving(true);
    try {
      await API.post("/auth/signup", { name: formData.name.trim(), email: formData.email.trim(), password: formData.password, role: formData.role });
      navigate("/users");
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to add user!");
    } finally { setSaving(false); }
  };

  const fields = [
    { key: "name",  label: "Full Name",  type: "text",     placeholder: "John Doe" },
    { key: "email", label: "Email",      type: "email",    placeholder: "john@gmail.com" },
    { key: "role",  label: "Role",       type: "select",   options: ["user", "admin"] },
    { key: "password",        label: "Password",         type: "password", placeholder: "••••••••", show: showPassword,  toggle: () => setShowPassword(p => !p) },
    { key: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "••••••••", show: showConfirm,   toggle: () => setShowConfirm(p => !p) },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <div style={{ width: "100%", maxWidth: "440px", background: "var(--bg-card)", border: "1px solid rgba(200,169,110,0.2)", borderRadius: "12px", padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <button onClick={() => navigate("/users")} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", color: "var(--text-faint)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px", padding: 0, textTransform: "uppercase" }} onMouseEnter={e => e.currentTarget.style.color = "#c8a96e"} onMouseLeave={e => e.currentTarget.style.color = "#6b5a3e"}>
            ← Back
          </button>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "3px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "6px" }}>ADMIN / USERS</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", color: "var(--text-primary)", fontWeight: 300, fontStyle: "italic", margin: 0 }}>Add New User</h2>
        </div>

        {/* Gold divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.4), transparent)", marginBottom: "24px" }} />

        {serverError && (
          <div style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", color: "#c0392b", fontFamily: "Montserrat, sans-serif", fontSize: "11px", padding: "12px 16px", borderRadius: "6px", marginBottom: "20px", letterSpacing: "0.5px" }}>
            {serverError}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {fields.map(({ key, label, type, placeholder, options, show, toggle }) => (
            <div key={key}>
              <label style={S.label}>{label} <span style={{ color: "#c0392b" }}>*</span></label>
              {type === "select" ? (
                <select value={formData[key]} onChange={e => handleChange(key, e.target.value)} onBlur={() => handleBlur(key)}
                  style={{ ...S.input(touched[key] && errors[key]), cursor: "pointer" }}>
                  <option value="" style={{ background: "var(--bg-card)" }}>Select role...</option>
                  {options.map(o => <option key={o} value={o} style={{ background: "var(--bg-card)" }}>{o}</option>)}
                </select>
              ) : type === "password" ? (
                <div style={{ position: "relative" }}>
                  <input type={show ? "text" : "password"} placeholder={placeholder} value={formData[key]}
                    onChange={e => handleChange(key, e.target.value)} onBlur={() => handleBlur(key)}
                    style={{ ...S.input(touched[key] && errors[key]), paddingRight: "40px" }}
                    onFocus={e => e.target.style.borderColor = "#c8a96e"}
                    onBlur_={e => e.target.style.borderColor = touched[key] && errors[key] ? "#c0392b" : "rgba(200,169,110,0.2)"} />
                  <button type="button" onClick={toggle} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: "12px" }}>{show ? "🙈" : "👁️"}</button>
                </div>
              ) : (
                <input type={type} placeholder={placeholder} value={formData[key]}
                  onChange={e => handleChange(key, e.target.value)} onBlur={() => handleBlur(key)}
                  style={S.input(touched[key] && errors[key])}
                  onFocus={e => e.target.style.borderColor = "#c8a96e"} />
              )}
              {touched[key] && errors[key] && (
                <p style={{ color: "#c0392b", fontSize: "11px", marginTop: "4px", fontFamily: "Montserrat, sans-serif" }}>⚠ {errors[key]}</p>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
          <button onClick={() => navigate("/users")} style={{ flex: 1, padding: "12px", borderRadius: "6px", border: "1px solid rgba(200,169,110,0.2)", background: "transparent", color: "var(--text-faint)", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#c8a96e"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,169,110,0.2)"}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "6px", border: "none", background: "linear-gradient(135deg, #c8a96e, #a07840)", color: "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Adding..." : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddUser;