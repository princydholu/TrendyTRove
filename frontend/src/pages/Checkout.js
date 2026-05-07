import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, removeFromCart } from "../redux/slices/cartSlice";
import API from "../api/axios";

// ── Validation ────────────────────────────────────────────────────────────────
const validate = (address) => {
  const e = {};
  if (!address.fullName.trim())
    e.fullName = "Full name is required";
  else if (address.fullName.trim().length < 3)
    e.fullName = "Name must be at least 3 characters";

  if (!address.phone.trim())
    e.phone = "Phone number is required";
  else if (!/^\d{10}$/.test(address.phone))
    e.phone = "Enter a valid 10-digit number";

  if (!address.street.trim())
    e.street = "Street address is required";
  else if (address.street.trim().length < 5)
    e.street = "Enter a complete address";

  if (!address.city.trim())
    e.city = "City is required";
  else if (address.city.trim().length < 2)
    e.city = "Enter a valid city name";

  if (!address.state.trim())
    e.state = "State is required";
  else if (address.state.trim().length < 2)
    e.state = "Enter a valid state name";

  if (!address.pincode.trim())
    e.pincode = "Pincode is required";
  else if (!/^\d{6}$/.test(address.pincode))
    e.pincode = "Enter a valid 6-digit pincode";

  return e;
};

// ── Field Error ───────────────────────────────────────────────────────────────
const FieldError = ({ msg }) => (
  <p className="mt-1 text-[10px] font-['Montserrat'] text-red-400 flex items-center gap-1 min-h-[14px]">
    {msg && (
      <>
        <svg className="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
        </svg>
        {msg}
      </>
    )}
  </p>
);

// ── Input Field ───────────────────────────────────────────────────────────────
const Field = ({
  label, name, placeholder, type = "text", value, onChange, onBlur,
  error, touched, maxLength, inputMode, onKeyDown, hint,
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
        autoComplete="off"
        className={`w-full border px-4 py-3 text-[12px] font-['Montserrat'] text-[#1a1a1a] outline-none transition-all duration-200 bg-white ${
          touched && error
            ? "border-red-400 bg-red-50/30"
            : touched && !error
            ? "border-emerald-400"
            : "border-[#e8e8e8] focus:border-[#1a1a1a]"
        }`}
      />
      {touched && !error && value && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </div>
    <FieldError msg={touched ? error : ""} />
    {hint && !error && (
      <p className="text-[9px] text-[#b0b0b0] font-['Montserrat'] mt-0.5">{hint}</p>
    )}
  </div>
);

// ── Razorpay loader ───────────────────────────────────────────────────────────
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src     = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// ── Main Component ────────────────────────────────────────────────────────────
function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user     = useSelector((state) => state.auth.user);

  const { items = [] } = location.state || {};

  const totalAmount  = items.reduce(
    (sum, i) => sum + (i.price || i.sellingPrice || 0) * i.quantity,
    0
  );
  const shippingCost = totalAmount >= 5000 ? 0 : 99;
  const grandTotal   = totalAmount + shippingCost;

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone:    "",
    street:   "",
    city:     "",
    state:    "",
    pincode:  "",
  });

  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const handleBlur = (name) => {
    setTouched((t) => ({ ...t, [name]: true }));
    const errs = validate(address);
    setErrors((e) => ({ ...e, [name]: errs[name] || "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((a) => ({ ...a, [name]: value }));
    if (touched[name]) {
      const errs = validate({ ...address, [name]: value });
      setErrors((e) => ({ ...e, [name]: errs[name] || "" }));
    }
  };

  const numericKeyDown = (e) => {
    const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Enter"];
    if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
  };

  const alphaKeyDown = (e) => {
    const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Enter", " "];
    if (!allowed.includes(e.key) && !/^[a-zA-Z]$/.test(e.key)) e.preventDefault();
  };

  // ── Handle Payment ────────────────────────────────────────────────────────
  const handlePayment = async () => {
    const allTouched = Object.keys(address).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const errs = validate(address);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert("Razorpay failed to load. Please check your internet connection.");
        setLoading(false);
        return;
      }

      const { data } = await API.post("/orders/create-razorpay-order", {
        amount: grandTotal,
      });
      const rzpOrder = data.order;

      const options = {
        key:         data.key,
        amount:      rzpOrder.amount,
        currency:    rzpOrder.currency || "INR",
        name:        "TrendyTrove",
        description: "Order Payment",
        order_id:    rzpOrder.id,
        prefill: {
          name:    address.fullName,
          contact: address.phone,
          email:   user?.email || "",
        },
        theme: { color: "#1a1a1a" },

handler: async (response) => {
  try {
    const orderRes = await API.post("/orders/place", {
      razorpayOrderId:   response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
      items: items.map((item) => ({
        product:  item._id || item.product,
        name:     item.name,
        quantity: item.quantity,
        price:    item.price || item.sellingPrice || 0,
        image:    item.image || "",
        size:     item.size  || "",
        color:    item.color || "",
      })),
      amount:  grandTotal,
      address: address,
      type:    "cart",
    });

    // ✅ KEY LOGIC HERE
    const isBuyNow = location.state?.isBuyNow;

    if (isBuyNow) {
      // Remove ONLY the bought items, keep rest of cart
      for (const item of items) {
        dispatch(removeFromCart({
          _id:   item._id || item.product,
          size:  item.size  || "",
          color: item.color || "",
        }));

        // Also remove from backend cart if itemId exists
        if (item.itemId) {
          try { await API.delete(`/cart/${item.itemId}`); } catch {}
        }
      }
    } else {
      // Normal cart checkout — clear everything
      dispatch(clearCart());
      try { await API.delete("/cart/clear"); } catch {}
    }

    navigate("/order-success", {
      state: {
        orderId:   orderRes.data?.order?._id || response.razorpay_order_id,
        items,
        grandTotal,
        address,
        isBuyNow,
      },
      replace: true,
    });

  } catch (err) {
    alert(err.response?.data?.message || "Order placement failed.");
  }
},

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        alert("Payment failed: " + (response.error?.description || "Please try again."));
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!items.length) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-40 flex items-center justify-center">
        <div className="text-center">
          <p className="font-['Cormorant_Garamond'] text-4xl text-[#c8c0b4] italic mb-4">No items to checkout</p>
          <button
            onClick={() => navigate("/")}
            className="text-[10px] tracking-[2px] font-semibold font-['Montserrat'] border border-[#1a1a1a] px-6 py-2 hover:bg-[#1a1a1a] hover:text-white transition-all"
          >
            ← SHOP NOW
          </button>
        </div>
      </div>
    );
  }

  const completedFields = Object.keys(address).filter(
    (k) => address[k] && !validate(address)[k]
  ).length;
  const progressPct = Math.round((completedFields / 6) * 100);

  return (
    <div className="bg-[#faf8f5] min-h-screen pt-36 pb-20">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-20">

        {/* ── Header ── */}
        <div className="mb-10">
          <p className="text-[9px] tracking-[4px] text-[#9b9b9b] font-['Montserrat'] mb-2">✦ ALMOST THERE</p>
          <h1 className="font-['Cormorant_Garamond'] text-5xl font-light italic text-[#1a1a1a] mb-4">Checkout</h1>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-0.5 bg-[#e8e4de] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a1a1a] transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[9px] tracking-[2px] font-['Montserrat'] text-[#9b9b9b] shrink-0">
              {completedFields}/6 FIELDS
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Left — Address Form ── */}
          <div>
            <h2 className="text-[10px] tracking-[3px] text-[#1a1a1a] font-semibold font-['Montserrat'] mb-6 flex items-center gap-2">
              <span className="w-5 h-px bg-[#c8a96e]" />
              DELIVERY ADDRESS
            </h2>

            <div className="flex flex-col gap-5">
              <Field
                label="Full Name *"
                name="fullName"
                placeholder="Your full name"
                value={address.fullName}
                onChange={handleChange}
                onBlur={() => handleBlur("fullName")}
                onKeyDown={alphaKeyDown}
                error={errors.fullName}
                touched={touched.fullName}
                maxLength={50}
              />
              <Field
                label="Phone *"
                name="phone"
                placeholder="10-digit mobile number"
                type="tel"
                inputMode="numeric"
                value={address.phone}
                onChange={handleChange}
                onBlur={() => handleBlur("phone")}
                onKeyDown={numericKeyDown}
                error={errors.phone}
                touched={touched.phone}
                maxLength={10}
                hint="Digits only · No spaces or dashes"
              />
              <Field
                label="Street / Area *"
                name="street"
                placeholder="House no, Street, Area"
                value={address.street}
                onChange={handleChange}
                onBlur={() => handleBlur("street")}
                error={errors.street}
                touched={touched.street}
                maxLength={100}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="City *"
                  name="city"
                  placeholder="City"
                  value={address.city}
                  onChange={handleChange}
                  onBlur={() => handleBlur("city")}
                  onKeyDown={alphaKeyDown}
                  error={errors.city}
                  touched={touched.city}
                  maxLength={50}
                />
                <Field
                  label="State *"
                  name="state"
                  placeholder="State"
                  value={address.state}
                  onChange={handleChange}
                  onBlur={() => handleBlur("state")}
                  onKeyDown={alphaKeyDown}
                  error={errors.state}
                  touched={touched.state}
                  maxLength={50}
                />
              </div>
              <Field
                label="Pincode *"
                name="pincode"
                placeholder="6-digit pincode"
                type="tel"
                inputMode="numeric"
                value={address.pincode}
                onChange={handleChange}
                onBlur={() => handleBlur("pincode")}
                onKeyDown={numericKeyDown}
                error={errors.pincode}
                touched={touched.pincode}
                maxLength={6}
                hint="Digits only · 6 characters"
              />
            </div>

            {Object.values(errors).some(Boolean) && Object.keys(touched).length === 6 && (
              <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-[10px] tracking-[1px] font-semibold font-['Montserrat'] text-red-500 mb-1">
                  PLEASE FIX THE FOLLOWING
                </p>
                <ul className="space-y-0.5">
                  {Object.values(errors).filter(Boolean).map((err, i) => (
                    <li key={i} className="text-[10px] text-red-400 font-['Montserrat'] flex items-center gap-1">
                      <span>·</span> {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Right — Order Summary ── */}
          <div>
            <h2 className="text-[10px] tracking-[3px] text-[#1a1a1a] font-semibold font-['Montserrat'] mb-6 flex items-center gap-2">
              <span className="w-5 h-px bg-[#c8a96e]" />
              ORDER SUMMARY
            </h2>

            <div className="bg-white border border-[#e8e8e8] p-6 flex flex-col gap-4 mb-4">
              {items.map((item, i) => (
                <div key={i} className="flex gap-4 items-center">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-20 object-cover border border-[#e8e8e8] shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-['Cormorant_Garamond'] text-lg text-[#1a1a1a] truncate">{item.name}</p>
                    <p className="text-[10px] text-[#9b9b9b] font-['Montserrat'] mt-0.5">
                      {item.color && `Color: ${item.color}`}
                      {item.color && item.size && " · "}
                      {item.size && `Size: ${item.size}`}
                      {" · "}Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-[13px] font-medium text-[#1a1a1a] font-['Montserrat'] shrink-0">
                    ₹{((item.price || item.sellingPrice || 0) * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-[#e8e8e8] p-6 mb-5">
              <div className="flex justify-between mb-3">
                <span className="text-[11px] text-[#9b9b9b] font-['Montserrat']">Subtotal</span>
                <span className="text-[13px] text-[#1a1a1a] font-['Montserrat']">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-[11px] text-[#9b9b9b] font-['Montserrat']">Shipping</span>
                <span className={`text-[13px] font-['Montserrat'] ${shippingCost === 0 ? "text-emerald-600" : "text-[#1a1a1a]"}`}>
                  {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                </span>
              </div>
              {shippingCost > 0 && (
                <p className="text-[9px] text-[#b0a898] font-['Montserrat'] mb-3">
                  Add ₹{(5000 - totalAmount).toLocaleString("en-IN")} more for free shipping
                </p>
              )}
              <div className="w-full h-px bg-[#e8e8e8] my-3" />
              <div className="flex justify-between">
                <span className="text-[13px] font-semibold text-[#1a1a1a] font-['Montserrat']">Total</span>
                <span className="text-xl font-bold text-[#1a1a1a] font-['Montserrat']">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 bg-[#1a1a1a] text-white text-[11px] tracking-[3px] font-semibold font-['Montserrat'] hover:bg-[#3d3020] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? "PROCESSING..." : `PAY ₹${grandTotal.toLocaleString("en-IN")}`}
              </span>
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </button>

            <p className="text-[10px] tracking-[1px] text-[#9b9b9b] font-['Montserrat'] text-center mt-4 flex items-center justify-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secured by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout; 