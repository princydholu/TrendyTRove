import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../redux/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

 const validate = () => {
  const newErrors = {};
  if (!formData.name.trim()) newErrors.name = "Name is required";

  if (!formData.email.trim()) newErrors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

  if (!formData.password) {
    newErrors.password = "Password is required";
  } else if (formData.password.length < 8) {
    newErrors.password = "Minimum 8 characters required";
  } else if (!/[A-Z]/.test(formData.password)) {
    newErrors.password = "Must contain at least 1 uppercase letter";
  } else if (!/[a-z]/.test(formData.password)) {
    newErrors.password = "Must contain at least 1 lowercase letter";
  } else if (!/[0-9]/.test(formData.password)) {
    newErrors.password = "Must contain at least 1 number";
  } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
    newErrors.password = "Must contain at least 1 special character (!@#$%^&*)";
  }

  if (!formData.confirm) {
    newErrors.confirm = "Please confirm your password";
  } else if (formData.confirm !== formData.password) {
    newErrors.confirm = "Passwords don't match";
  }

  return newErrors;
};

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/signup", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      const data = res.data;

      // Save token + user to localStorage & Redux
      localStorage.setItem("trendytroveToken", data.token);
      localStorage.setItem("trendytroveUser", JSON.stringify(data.user));
      dispatch(login(data.user));
      navigate("/");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Server error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] pt-32">
      <Link
        to="/"
        className="fixed top-6 left-8 no-underline text-[10px] tracking-[2px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors font-['Montserrat']"
      >
        ← BACK
      </Link>

      <div className="bg-white w-full max-w-md px-10 py-14 shadow-sm">
        <Link to="/" className="no-underline">
          <h2 className="font-['Cormorant_Garamond'] text-4xl font-light italic text-center text-[#1a1a1a] mb-2 hover:opacity-70 transition-opacity">
            TrendyTrove
          </h2>
        </Link>
        <p className="text-[10px] tracking-[3px] text-center text-[#6b6b6b] mb-10 font-['Montserrat']">
          CREATE ACCOUNT
        </p>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-[11px] px-4 py-3 mb-6 tracking-wide font-['Montserrat']">
            {serverError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border px-4 py-3 text-[12px] tracking-wide font-['Montserrat'] text-[#1a1a1a] outline-none transition-all duration-300 ${
                errors.name
                  ? "border-red-400"
                  : "border-[#e8e8e8] focus:border-[#1a1a1a]"
              }`}
            />
            {errors.name && (
              <p className="text-red-400 text-[10px] mt-1 font-['Montserrat']">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border px-4 py-3 text-[12px] tracking-wide font-['Montserrat'] text-[#1a1a1a] outline-none transition-all duration-300 ${
                errors.email
                  ? "border-red-400"
                  : "border-[#e8e8e8] focus:border-[#1a1a1a]"
              }`}
            />
            {errors.email && (
              <p className="text-red-400 text-[10px] mt-1 font-['Montserrat']">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
<div className="relative">
  <input
    type={showPass ? "text" : "password"}
    name="password"
    placeholder="Password"
    value={formData.password}
    onChange={handleChange}
    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
    className={`w-full border px-4 py-3 pr-10 text-[12px] tracking-wide font-['Montserrat'] text-[#1a1a1a] outline-none transition-all duration-300 ${
      errors.password
        ? "border-red-400"
        : "border-[#e8e8e8] focus:border-[#1a1a1a]"
    }`}
  />
  <button
    type="button"
    onClick={() => setShowPass(!showPass)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors bg-transparent border-none cursor-pointer text-xs"
  >
    {showPass ? "HIDE" : "SHOW"}
  </button>
</div>
{/* ✅ ADD THIS — was missing */}
{errors.password && (
  <p className="text-red-400 text-[10px] mt-1 font-['Montserrat']">
    {errors.password}
  </p>
)}

{/* Confirm Password */}
<div className="relative">
  <input
    type={showConfirm ? "text" : "password"}
    name="confirm"
    placeholder="Confirm Password"
    value={formData.confirm}
    onChange={handleChange}
    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
    className={`w-full border px-4 py-3 pr-10 text-[12px] tracking-wide font-['Montserrat'] text-[#1a1a1a] outline-none transition-all duration-300 ${
      errors.confirm
        ? "border-red-400"
        : "border-[#e8e8e8] focus:border-[#1a1a1a]"
    }`}
  />
  <button
    type="button"
    onClick={() => setShowConfirm(!showConfirm)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors bg-transparent border-none cursor-pointer text-xs"
  >
    {showConfirm ? "HIDE" : "SHOW"}
  </button>
</div>
{/* ✅ ADD THIS — was missing */}
{errors.confirm && (
  <p className="text-red-400 text-[10px] mt-1 font-['Montserrat']">
    {errors.confirm}
  </p>
)}

         
        

        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-8 bg-[#1a1a1a] text-white text-[11px] tracking-[3px] font-semibold py-4 font-['Montserrat'] hover:bg-[#3d3020] transition-all duration-300 disabled:opacity-50"
        >
          {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#e8e8e8]" />
          <span className="text-[10px] tracking-[1px] text-[#b0a898] font-['Montserrat']">
            OR
          </span>
          <div className="flex-1 h-px bg-[#e8e8e8]" />
        </div>

        <p className="text-center text-[11px] text-[#6b6b6b] font-['Montserrat']">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#1a1a1a] font-semibold underline hover:text-[#3d3020] transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
