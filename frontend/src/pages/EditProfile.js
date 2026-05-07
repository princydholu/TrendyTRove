import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

// ── Validation ------------------------------------------------------------------------------------------------───────────────────
const validateName = (v) => {
  if (!v.trim()) return "Full name is required";
  if (v.trim().length < 3) return "Name must be at least 3 characters";
  if (!/^[a-zA-Z\s]+$/.test(v.trim())) return "Name can only contain letters";
  return "";
};

const validateCurrentPassword = (v, isChanging) => {
  if (!isChanging) return "";
  if (!v) return "Current password is required";
  return "";
};

const validateNewPassword = (v, isChanging) => {
  if (!isChanging) return "";
  if (!v) return "New password is required";
  if (v.length < 6) return "Must be at least 6 characters";
  if (!/[A-Z]/.test(v)) return "Include at least one uppercase letter";
  if (!/[0-9]/.test(v)) return "Include at least one number";
  return "";
};

const validateConfirmPassword = (v, newPwd, isChanging) => {
  if (!isChanging) return "";
  if (!v) return "Please confirm your new password";
  if (v !== newPwd) return "Passwords do not match";
  return "";
};

const validateEmail = (v) => {
  if (!v.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email";
  return "";
};

// ── Field Error ------------------------------------------------------------------------------------------------──────────────────
const FieldError = ({ msg }) => (
  <p className="mt-1.5 text-[10px] font-['Montserrat'] text-red-400 min-h-[14px] flex items-center gap-1">
    {msg && (
      <>
        <svg
          className="w-2.5 h-2.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
          />
        </svg>
        {msg}
      </>
    )}
  </p>
);

// ── Input Field ------------------------------------------------------------------------------------------------──────────────────
const Field = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  hint,
  maxLength,
  disabled = false,
  rightElement,
  inputMode,
  onKeyDown,
}) => (
  <div>
    <label className="block text-[9px] tracking-[2px] text-[#9b9b9b] font-['Montserrat'] mb-1.5 uppercase font-semibold">
      {label}
    </label>
    <div className="relative">
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        autoComplete="off"
        className={`w-full border px-4 py-3 text-[12px] font-['Montserrat'] text-[#1a1a1a] outline-none transition-all duration-200 bg-white pr-10 ${
          disabled
            ? "bg-[#f9f7f4] text-[#b0a898] cursor-not-allowed border-[#ede9e4]"
            : touched && error
              ? "border-red-400 bg-red-50/30"
              : touched && !error && value
                ? "border-emerald-400"
                : "border-[#e8e4de] focus:border-[#1a1a1a]"
        }`}
      />
      {/* Tick icon */}
      {!disabled && touched && !error && value && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      )}
      {/* Lock icon for disabled */}
      {disabled && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c8c0b4]">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </span>
      )}
      {/* Custom right element (e.g. show/hide password) */}
      {rightElement && !disabled && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </span>
      )}
    </div>
    <FieldError msg={touched ? error : ""} />
    {hint && (
      <p className="text-[9px] text-[#b0a898] font-['Montserrat'] -mt-1">
        {hint}
      </p>
    )}
  </div>
);

// ── Toast ------------------------------------------------------------------------------------------------────────────────────────
const Toast = ({ toast }) =>
  toast ? (
    <div
      className={`fixed bottom-8 right-8 px-6 py-4 text-[11px] tracking-[2px] font-semibold font-['Montserrat'] shadow-lg z-50 transition-all duration-300 ${
        toast.type === "error"
          ? "bg-red-500 text-white"
          : "bg-[#1a1a1a] text-white"
      }`}
    >
      {toast.msg}
    </div>
  ) : null;

// ── Main Component ------------------------------------------------------------------------------------------------───────────────
function EditProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // ── Fetch profile ------------------------------------------------------------------------------------------------─────────────
  useEffect(() => {
    API.get("/users/profile")
      .then((res) => {
        const u = res.data.user;
        setProfileData(u);
        setForm((f) => ({ ...f, name: u.name || "", email: u.email || "" }));
      })
      .catch(() => showToast("Failed to load profile", "error"))
      .finally(() => setPageLoading(false));
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  
  // ── Validate single field ------------------------------------------------------------------------------------------------─────
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return validateName(value);
        case "email":
  return validateEmail(value);
      case "currentPassword":
        return validateCurrentPassword(value, isChangingPwd);
      case "newPassword":
        return validateNewPassword(value, isChangingPwd);
      case "confirmPassword":
        return validateConfirmPassword(value, form.newPassword, isChangingPwd);
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (touched[name]) {
      setErrors((err) => ({ ...err, [name]: validateField(name, value) }));
    }
    // Re-validate confirm if newPassword changes
    if (name === "newPassword" && touched.confirmPassword) {
      setErrors((err) => ({
        ...err,
        confirmPassword: validateConfirmPassword(
          form.confirmPassword,
          value,
          isChangingPwd,
        ),
      }));
    }
  };

  const handleBlur = (name) => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((err) => ({ ...err, [name]: validateField(name, form[name]) }));
  };

  // Letters + spaces only for name
  const alphaKeyDown = (e) => {
    const allowed = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Enter",
      " ",
    ];
    if (!allowed.includes(e.key) && !/^[a-zA-Z]$/.test(e.key))
      e.preventDefault();
  };

  // ── Toggle password section ------------------------------------------------------------------------------------------------───
  const handleTogglePassword = () => {
    setIsChangingPwd((v) => !v);
    setForm((f) => ({
      ...f,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
    setErrors((e) => ({
      ...e,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
    setTouched((t) => ({
      ...t,
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    }));
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  // ── Submit ------------------------------------------------------------------------------------------------────────────────────
  const handleSubmit = async () => {
    // Touch all relevant fields
    const fields = isChangingPwd
  ? ["name", "email", "currentPassword", "newPassword", "confirmPassword"]
  : ["name", "email"];

    const allTouched = fields.reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched((t) => ({ ...t, ...allTouched }));

    const newErrors = {};
    newErrors.name = validateName(form.name);
    newErrors.email = validateEmail(form.email);
    if (isChangingPwd) {
      newErrors.currentPassword = validateCurrentPassword(
        form.currentPassword,
        true,
      );
      newErrors.newPassword = validateNewPassword(form.newPassword, true);
      newErrors.confirmPassword = validateConfirmPassword(
        form.confirmPassword,
        form.newPassword,
        true,
      );
    }
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim() };
      if (isChangingPwd) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      await API.put("/users/profile", payload);
      showToast("Profile updated successfully ✓");
      setTimeout(() => navigate("/new"), 1500);

      // Reset password fields after success
      if (isChangingPwd) {
        setIsChangingPwd(false);
        setForm((f) => ({
          ...f,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setTouched((t) => ({
          ...t,
          currentPassword: false,
          newPassword: false,
          confirmPassword: false,
        }));
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Page loading ------------------------------------------------------------------------------------------------──────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-40 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border border-[#1a1a1a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] tracking-[3px] text-[#9b9b9b] font-['Montserrat']">
            LOADING PROFILE...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf8f5] min-h-screen pt-36 pb-20">
      <div className="max-w-[680px] mx-auto px-6">
        {/* ── Header ── */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="text-[9px] tracking-[2px] text-[#9b9b9b] font-['Montserrat'] hover:text-[#1a1a1a] transition-colors mb-6 flex items-center gap-2"
          >
            ← BACK
          </button>
          <p className="text-[9px] tracking-[4px] text-[#9b9b9b] font-['Montserrat'] mb-2">
            ✦ ACCOUNT
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-5xl font-light italic text-[#1a1a1a] mb-4">
            Edit Profile
          </h1>
        </div>

        {/* ── Account Info Card ── */}
        <div className="bg-white border border-[#e8e4de] p-6 mb-6 flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
            <span className="font-['Cormorant_Garamond'] text-2xl text-white font-light">
              {(profileData?.name || "U")[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-['Cormorant_Garamond'] text-xl text-[#1a1a1a]">
              {profileData?.name}
            </p>
            <p className="text-[10px] tracking-[1px] text-[#9b9b9b] font-['Montserrat']">
              {profileData?.email}
            </p>
            <span className="inline-block mt-1 text-[8px] tracking-[2px] font-semibold font-['Montserrat'] px-2 py-0.5 bg-[#f0ece6] text-[#6b6b6b]">
              {profileData?.role?.toUpperCase() || "USER"}
            </span>
          </div>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white border border-[#e8e4de] p-8">
          {/* ── Section: Personal Info ── */}
          <h2 className="text-[10px] tracking-[3px] text-[#1a1a1a] font-semibold font-['Montserrat'] mb-6 flex items-center gap-2">
            <span className="w-5 h-px bg-[#c8a96e]" />
            PERSONAL INFORMATION
          </h2>

          <div className="flex flex-col gap-5 mb-8">
            {/* Name */}
            <Field
              label="Full Name *"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              onBlur={() => handleBlur("name")}
              onKeyDown={alphaKeyDown}
              error={errors.name}
              touched={touched.name}
              maxLength={50}
            />

            {/* Email — read only */}
            <Field
  label="Email Address *"
  name="email"
  type="email"
  placeholder="Your email address"
  value={form.email}
  onChange={handleChange}
  onBlur={() => handleBlur("email")}
  error={errors.email}
  touched={touched.email}
  maxLength={100}
/>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-[#e8e4de] mb-8" />

          {/* ── Section: Password ── */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] tracking-[3px] text-[#1a1a1a] font-semibold font-['Montserrat'] flex items-center gap-2">
              <span className="w-5 h-px bg-[#c8a96e]" />
              CHANGE PASSWORD
            </h2>
            <button
              onClick={handleTogglePassword}
              className={`text-[9px] tracking-[1.5px] font-semibold font-['Montserrat'] px-4 py-1.5 border transition-all duration-200 ${
                isChangingPwd
                  ? "border-red-300 text-red-400 hover:bg-red-50"
                  : "border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              {isChangingPwd ? "CANCEL" : "CHANGE PASSWORD"}
            </button>
          </div>

          {!isChangingPwd && (
            <div className="flex items-center gap-3 py-4 px-4 bg-[#faf8f5] border border-[#e8e4de] mb-8">
              <svg
                className="w-4 h-4 text-[#b0a898] shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <p className="text-[10px] tracking-[1px] text-[#9b9b9b] font-['Montserrat']">
                Password is hidden · Click "Change Password" to update it
              </p>
            </div>
          )}

          {/* Password Fields */}
          {isChangingPwd && (
            <div className="flex flex-col gap-5 mb-8">
              {/* Current Password */}
              <Field
                label="Current Password *"
                name="currentPassword"
                type={showCurrent ? "text" : "password"}
                placeholder="Enter your current password"
                value={form.currentPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("currentPassword")}
                error={errors.currentPassword}
                touched={touched.currentPassword}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors"
                    tabIndex={-1}
                  >
                    {showCurrent ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                }
              />

              {/* New Password */}
              <div>
                <Field
                  label="New Password *"
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  placeholder="Min 6 chars · 1 uppercase · 1 number"
                  value={form.newPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur("newPassword")}
                  error={errors.newPassword}
                  touched={touched.newPassword}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors"
                      tabIndex={-1}
                    >
                      {showNew ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  }
                />
              </div>

              {/* Confirm Password */}
              <Field
                label="Confirm New Password *"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your new password"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("confirmPassword")}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                }
              />
            </div>
          )}

          {/* ── Validation Summary ── */}
          {Object.values(errors).some(Boolean) &&
            Object.keys(touched).length > 0 && (
              <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-[10px] tracking-[1px] font-semibold font-['Montserrat'] text-red-500 mb-1">
                  PLEASE FIX THE FOLLOWING
                </p>
                <ul className="space-y-0.5">
                  {Object.values(errors)
                    .filter(Boolean)
                    .map((err, i) => (
                      <li
                        key={i}
                        className="text-[10px] text-red-400 font-['Montserrat'] flex items-center gap-1"
                      >
                        <span>·</span> {err}
                      </li>
                    ))}
                </ul>
              </div>
            )}

          {/* ── Submit Button ── */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#1a1a1a] text-white text-[11px] tracking-[3px] font-semibold py-4 font-['Montserrat'] hover:bg-[#3d3020] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                SAVING...
              </>
            ) : (
              "SAVE CHANGES"
            )}
          </button>

          {/* Security note */}
          <p className="text-[9px] tracking-[1px] text-[#b0a898] font-['Montserrat'] text-center mt-4 flex items-center justify-center gap-1.5">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Your data is safe · Changes apply immediately
          </p>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}

export default EditProfile;
