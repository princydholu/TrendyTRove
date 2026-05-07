import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ── Tiny animated checkmark ──────────────────────────────────────────────────
const AnimatedCheck = () => (
  <svg viewBox="0 0 52 52" className="w-full h-full" fill="none">
    <circle
      cx="26" cy="26" r="24"
      stroke="#c8a96e"
      strokeWidth="1.5"
      fill="none"
      style={{
        strokeDasharray: 160,
        strokeDashoffset: 160,
        animation: "drawCircle 0.7s ease forwards 0.2s",
      }}
    />
    <path
      d="M14 27l8 8 16-17"
      stroke="#c8a96e"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      style={{
        strokeDasharray: 40,
        strokeDashoffset: 40,
        animation: "drawCheck 0.45s ease forwards 0.9s",
      }}
    />
  </svg>
);

// ── Status Step ──────────────────────────────────────────────────────────────
const Step = ({ icon, label, active, done, delay }) => (
  <div
    className="flex flex-col items-center gap-2"
    style={{
      opacity: 0,
      animation: `fadeUp 0.5s ease forwards ${delay}s`,
    }}
  >
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-500 ${
        done
          ? "bg-[#1a1a1a] border-[#1a1a1a]"
          : active
          ? "border-[#c8a96e] bg-[#fdf8f0]"
          : "border-[#e0dbd3] bg-white"
      }`}
    >
      <span className={`text-sm ${done ? "text-white" : active ? "text-[#c8a96e]" : "text-[#c8c0b4]"}`}>
        {icon}
      </span>
    </div>
    <span
      className={`text-[8px] tracking-[2px] font-['Montserrat'] font-semibold uppercase ${
        done ? "text-[#1a1a1a]" : active ? "text-[#c8a96e]" : "text-[#c8c0b4]"
      }`}
    >
      {label}
    </span>
  </div>
);

// ── Main Page ────────────────────────────────────────────────────────────────
function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  // Trigger entrance animations after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // All data comes from Checkout via navigate("/order-success", { state: {...} })
  // No API call needed — the data is already passed through navigation state
  const {
    orderId    = "TT" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    items      = [],
    grandTotal = 0,
    address    = {},
  } = location.state || {};

  const estimatedDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  })();

  return (
    <>
      <style>{`
        @keyframes drawCircle { to { stroke-dashoffset: 0; } }
        @keyframes drawCheck  { to { stroke-dashoffset: 0; } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      <div className="bg-[#faf8f5] min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-[760px] mx-auto">

          {/* ── Hero block ── */}
          <div
            className="text-center mb-14"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            <div className="w-16 h-16 mx-auto mb-6"><AnimatedCheck /></div>
            <p className="text-[9px] tracking-[5px] text-[#c8a96e] font-['Montserrat'] font-semibold mb-3">
              ✦ ORDER CONFIRMED
            </p>
            <h1 className="font-['Cormorant_Garamond'] text-5xl font-light italic text-[#1a1a1a] leading-tight mb-3">
              Thank you,<br />
              {address.fullName?.split(" ")[0] || "Valued Customer"}
            </h1>
            <p className="text-[12px] text-[#9b9b9b] font-['Montserrat'] max-w-sm mx-auto leading-relaxed">
              Your order has been placed and is being prepared with care. You will receive a confirmation shortly.
            </p>
            <div className="inline-flex items-center gap-2 mt-5 border border-[#e0dbd3] px-5 py-2.5 bg-white">
              <span className="text-[9px] tracking-[2px] text-[#9b9b9b] font-['Montserrat'] font-semibold">ORDER ID</span>
              <span className="w-px h-3 bg-[#e0dbd3]" />
              <span className="text-[12px] text-[#1a1a1a] font-['Montserrat'] font-semibold tracking-wider">#{orderId}</span>
            </div>
          </div>

          {/* ── Order Status Track ── */}
          <div
            className="bg-white border border-[#e8e4de] px-8 py-7 mb-6"
            style={{ opacity: 0, animation: visible ? "fadeUp 0.55s ease forwards 0.4s" : "none" }}
          >
            <p className="text-[9px] tracking-[3px] text-[#1a1a1a] font-semibold font-['Montserrat'] mb-7 flex items-center gap-2">
              <span className="w-4 h-px bg-[#c8a96e]" />ORDER STATUS
            </p>
            <div className="flex items-start justify-between relative">
              <div className="absolute top-4 left-[9%] right-[9%] h-px bg-[#e8e4de]" />
              <div className="absolute top-4 left-[9%] w-[48%] h-px bg-[#1a1a1a]" />
              <Step icon="✓" label="Confirmed"  done   delay={0.5}  />
              <Step icon="⟳" label="Processing" active delay={0.65} />
              <Step icon="⬡" label="Packed"            delay={0.8}  />
              <Step icon="⟶" label="Shipped"           delay={0.95} />
              <Step icon="⌂" label="Delivered"         delay={1.1}  />
            </div>
            <div className="mt-7 pt-5 border-t border-[#f0ece6] flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] text-[#9b9b9b] font-['Montserrat']">Estimated delivery</span>
              <span className="text-[12px] font-semibold text-[#1a1a1a] font-['Montserrat'] tracking-wide">{estimatedDate}</span>
            </div>
          </div>

          {/* ── Items Ordered ── */}
          {items.length > 0 && (
            <div
              className="bg-white border border-[#e8e4de] px-8 py-7 mb-6"
              style={{ opacity: 0, animation: visible ? "fadeUp 0.55s ease forwards 0.55s" : "none" }}
            >
              <p className="text-[9px] tracking-[3px] text-[#1a1a1a] font-semibold font-['Montserrat'] mb-6 flex items-center gap-2">
                <span className="w-4 h-px bg-[#c8a96e]" />ITEMS ORDERED
              </p>
              <div className="flex flex-col divide-y divide-[#f0ece6]">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-5 py-4 first:pt-0 last:pb-0">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-20 object-cover border border-[#e8e8e8] shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-['Cormorant_Garamond'] text-xl text-[#1a1a1a] truncate leading-snug">{item.name}</p>
                      <div className="flex flex-wrap gap-x-3 mt-1">
                        {item.color && <span className="text-[10px] text-[#9b9b9b] font-['Montserrat']">Color: {item.color}</span>}
                        {item.size  && <span className="text-[10px] text-[#9b9b9b] font-['Montserrat']">Size: {item.size}</span>}
                        <span className="text-[10px] text-[#9b9b9b] font-['Montserrat']">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <p className="text-[13px] font-semibold text-[#1a1a1a] font-['Montserrat'] shrink-0">
                      ₹{((item.price || item.sellingPrice || 0) * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-[#f0ece6] flex justify-between items-center">
                <span className="text-[11px] tracking-[1px] text-[#9b9b9b] font-['Montserrat'] font-semibold uppercase">Order Total</span>
                <span className="text-xl font-bold text-[#1a1a1a] font-['Montserrat']">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {/* ── Delivery Address ── */}
          {address.street && (
            <div
              className="bg-white border border-[#e8e4de] px-8 py-7 mb-8"
              style={{ opacity: 0, animation: visible ? "fadeUp 0.55s ease forwards 0.7s" : "none" }}
            >
              <p className="text-[9px] tracking-[3px] text-[#1a1a1a] font-semibold font-['Montserrat'] mb-5 flex items-center gap-2">
                <span className="w-4 h-px bg-[#c8a96e]" />DELIVERY TO
              </p>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 border border-[#e8e4de] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-[#c8a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1a1a1a] font-['Montserrat']">{address.fullName}</p>
                  <p className="text-[12px] text-[#6b6b6b] font-['Montserrat'] mt-1 leading-relaxed">
                    {address.street},<br />{address.city}, {address.state} — {address.pincode}
                  </p>
                  <p className="text-[11px] text-[#9b9b9b] font-['Montserrat'] mt-1.5">📞 {address.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── CTA Buttons ── */}
          <div
            className="flex flex-col sm:flex-row gap-4"
            style={{ opacity: 0, animation: visible ? "fadeUp 0.55s ease forwards 0.85s" : "none" }}
          >
            <button
              onClick={() => navigate("/")}
              className="flex-1 py-4 bg-[#1a1a1a] text-white text-[11px] tracking-[3px] font-semibold font-['Montserrat'] hover:bg-[#3d3020] transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">CONTINUE SHOPPING</span>
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="flex-1 py-4 border border-[#1a1a1a] text-[#1a1a1a] text-[11px] tracking-[3px] font-semibold font-['Montserrat'] hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
            >
              VIEW ALL ORDERS
            </button>
          </div>

          {/* ── Footer note ── */}
          <p
            className="text-center text-[10px] text-[#b0a898] font-['Montserrat'] mt-8 leading-relaxed"
            style={{ opacity: 0, animation: visible ? "fadeUp 0.5s ease forwards 1s" : "none" }}
          >
            Need help with your order?{" "}
            <button className="underline underline-offset-2 hover:text-[#1a1a1a] transition-colors">
              Contact Support
            </button>
          </p>

        </div>
      </div>
    </>
  );
}

export default OrderSuccess;