import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

// ── Status config ─────────────────────────────────────────────────────────────
const orderStatusConfig = {
  Processing: { label: "Processing", color: "text-blue-500  bg-blue-50  border-blue-200"  },
  Shipped:    { label: "Shipped",    color: "text-purple-500 bg-purple-50 border-purple-200" },
  Delivered:  { label: "Delivered",  color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  Cancelled:  { label: "Cancelled",  color: "text-red-500  bg-red-50   border-red-200"  },
};

// ── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white border border-[#e8e4de] p-6 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-3 w-32 bg-[#ede9e3] rounded" />
      <div className="h-5 w-20 bg-[#ede9e3] rounded-full" />
    </div>
    <div className="h-px bg-[#f0ece6] mb-4" />
    <div className="flex gap-4 mb-4">
      <div className="w-16 h-20 bg-[#ede9e3] rounded shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 w-3/4 bg-[#ede9e3] rounded" />
        <div className="h-3 w-1/2 bg-[#ede9e3] rounded" />
      </div>
    </div>
    <div className="h-px bg-[#f0ece6] mb-4" />
    <div className="flex justify-between">
      <div className="h-3 w-24 bg-[#ede9e3] rounded" />
      <div className="h-4 w-20 bg-[#ede9e3] rounded" />
    </div>
  </div>
);

// ── Order Status Steps ────────────────────────────────────────────────────────
const statusSteps = ["Processing", "Shipped", "Delivered"];

const StatusTracker = ({ status }) => {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2 mt-3">
        <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
        <span className="text-[10px] tracking-[2px] font-['Montserrat'] text-red-500 font-semibold uppercase">
          Order Cancelled
        </span>
      </div>
    );
  }
  const currentIdx = statusSteps.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-3">
      {statusSteps.map((step, idx) => (
        <div key={step} className="flex items-center gap-1 flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-2 h-2 rounded-full shrink-0 ${idx <= currentIdx ? "bg-[#1a1a1a]" : "bg-[#ddd]"}`} />
            <span className={`text-[8px] font-['Montserrat'] tracking-[1px] whitespace-nowrap ${idx <= currentIdx ? "text-[#1a1a1a] font-semibold" : "text-[#c0bbb3]"}`}>
              {step}
            </span>
          </div>
          {idx < statusSteps.length - 1 && (
            <div className={`flex-1 h-px mb-3 ${idx < currentIdx ? "bg-[#1a1a1a]" : "bg-[#e0dbd3]"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
function MyOrders() {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [expanded, setExpanded] = useState(null); // order._id of expanded card

  useEffect(() => {
    API.get("/orders/my-orders")
      .then((res) => setOrders(res.data.orders || res.data.data || []))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";

  const formatCurrency = (n) =>
    `₹${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <div className="bg-[#faf8f5] min-h-screen pt-36 pb-20">
      <div className="max-w-[820px] mx-auto px-6">

        {/* ── Header ── */}
        <div className="mb-10">
          <p className="text-[9px] tracking-[4px] text-[#9b9b9b] font-['Montserrat'] mb-2">✦ YOUR ACCOUNT</p>
          <h1 className="font-['Cormorant_Garamond'] text-5xl font-light italic text-[#1a1a1a] mb-1">My Orders</h1>
          {!loading && !error && (
            <p className="text-[11px] text-[#9b9b9b] font-['Montserrat'] mt-2">
              {orders.length === 0 ? "No orders yet" : `${orders.length} order${orders.length > 1 ? "s" : ""} placed`}
            </p>
          )}
          <div className="w-12 h-px bg-[#c8a96e] mt-4" />
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="border border-red-200 bg-red-50 px-5 py-4 mb-6 flex items-center justify-between">
            <p className="text-[12px] text-red-500 font-['Montserrat']">{error}</p>
            <button
              onClick={() => { setError(""); setLoading(true); API.get("/orders/my-orders").then((res) => setOrders(res.data.orders || [])).catch((e) => setError(e?.response?.data?.message || "Failed")).finally(() => setLoading(false)); }}
              className="text-[10px] tracking-[2px] font-semibold font-['Montserrat'] text-red-500 underline underline-offset-2"
            >
              RETRY
            </button>
          </div>
        )}

        {/* ── Loading Skeletons ── */}
        {loading && (
          <div className="flex flex-col gap-5">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-6 border border-[#e0dbd3] flex items-center justify-center">
              <svg className="w-7 h-7 text-[#c8c0b4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="font-['Cormorant_Garamond'] text-3xl italic text-[#c8c0b4] mb-2">No orders yet</p>
            <p className="text-[11px] text-[#b0a898] font-['Montserrat'] mb-8">Your placed orders will appear here</p>
            <button
              onClick={() => navigate("/")}
              className="text-[10px] tracking-[3px] font-semibold font-['Montserrat'] border border-[#1a1a1a] px-8 py-3 hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
            >
              START SHOPPING
            </button>
          </div>
        )}

        {/* ── Order Cards ── */}
        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col gap-5">
            {orders
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((order) => {
                const isOpen = expanded === order._id;
                const oStatus = orderStatusConfig[order.orderStatus] || { label: order.orderStatus, color: "text-[#9b9b9b] bg-[#f5f5f5] border-[#e0e0e0]" };

                return (
                  <div key={order._id} className="bg-white border border-[#e8e4de] overflow-hidden transition-all duration-300">

                    {/* ── Card Header ── */}
                    <div className="px-6 pt-5 pb-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="text-[9px] tracking-[2px] text-[#9b9b9b] font-['Montserrat'] font-semibold uppercase mb-1">
                            Order ID
                          </p>
                          <p className="text-[11px] text-[#1a1a1a] font-['Montserrat'] font-semibold tracking-wider">
                            #{(order.razorpayOrderId || order._id || "").slice(-12).toUpperCase()}
                          </p>
                        </div>
                        {/* Only order status badge */}
                        <span className={`text-[9px] tracking-[1px] font-semibold font-['Montserrat'] uppercase px-3 py-1 border rounded-full ${oStatus.color}`}>
                          {oStatus.label}
                        </span>
                      </div>

                      {/* Status tracker */}
                      <StatusTracker status={order.orderStatus} />
                    </div>

                    <div className="h-px bg-[#f0ece6]" />

                    {/* ── Items Preview ── */}
                    <div className="px-6 py-4">
                      {/* Always show first item */}
                      {(order.items || []).slice(0, isOpen ? order.items.length : 1).map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-4 ${idx > 0 ? "mt-4 pt-4 border-t border-[#f5f2ee]" : ""}`}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-14 h-18 object-cover border border-[#e8e8e8] shrink-0" style={{ height: "72px" }} />
                          ) : (
                            <div className="w-14 shrink-0 bg-[#f0ece6] border border-[#e8e4de] flex items-center justify-center" style={{ height: "72px" }}>
                              <svg className="w-5 h-5 text-[#c8c0b4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-['Cormorant_Garamond'] text-lg text-[#1a1a1a] truncate leading-snug">{item.name}</p>
                            <div className="flex flex-wrap gap-x-3 mt-0.5">
                              {item.color && <span className="text-[10px] text-[#9b9b9b] font-['Montserrat']">Color: {item.color}</span>}
                              {item.size  && <span className="text-[10px] text-[#9b9b9b] font-['Montserrat']">Size: {item.size}</span>}
                              <span className="text-[10px] text-[#9b9b9b] font-['Montserrat']">Qty: {item.quantity || item.qty || 1}</span>
                            </div>
                          </div>
                          <p className="text-[13px] font-semibold text-[#1a1a1a] font-['Montserrat'] shrink-0">
                            {formatCurrency((item.price || 0) * (item.quantity || item.qty || 1))}
                          </p>
                        </div>
                      ))}

                      {/* Show more / less toggle */}
                      {(order.items || []).length > 1 && (
                        <button
                          onClick={() => setExpanded(isOpen ? null : order._id)}
                          className="mt-3 text-[10px] tracking-[1px] font-['Montserrat'] text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors underline underline-offset-2"
                        >
                          {isOpen
                            ? "SHOW LESS"
                            : `+${order.items.length - 1} MORE ITEM${order.items.length - 1 > 1 ? "S" : ""}`}
                        </button>
                      )}
                    </div>

                    <div className="h-px bg-[#f0ece6]" />

                    {/* ── Payment Details Row ── */}
                    <div className="px-6 py-3 bg-[#faf8f5] border-b border-[#f0ece6] flex flex-wrap gap-x-6 gap-y-2">
                      {order.paymentMethod && (
                        <div>
                          <p className="text-[9px] tracking-[1px] text-[#9b9b9b] font-['Montserrat'] uppercase mb-0.5">Payment Method</p>
                          <p className="text-[11px] text-[#1a1a1a] font-['Montserrat'] font-semibold capitalize">{order.paymentMethod}</p>
                        </div>
                      )}
                      {order.paidBy && (
                        <div>
                          <p className="text-[9px] tracking-[1px] text-[#9b9b9b] font-['Montserrat'] uppercase mb-0.5">Paid By</p>
                          <p className="text-[11px] text-[#1a1a1a] font-['Montserrat'] font-semibold">{order.paidBy}</p>
                        </div>
                      )}
                      {(order.razorpayPaymentId || order.transactionId) && (
                        <div>
                          <p className="text-[9px] tracking-[1px] text-[#9b9b9b] font-['Montserrat'] uppercase mb-0.5">Transaction ID</p>
                          <p className="text-[11px] text-[#1a1a1a] font-['Montserrat'] font-mono tracking-wide">
                            {order.razorpayPaymentId || order.transactionId}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ── Card Footer ── */}
                    <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-5">
                        <div>
                          <p className="text-[9px] tracking-[1px] text-[#9b9b9b] font-['Montserrat'] uppercase mb-0.5">Ordered</p>
                          <p className="text-[11px] text-[#1a1a1a] font-['Montserrat']">{formatDate(order.createdAt)}</p>
                        </div>
                        {order.address && (
                          <div className="hidden sm:block">
                            <p className="text-[9px] tracking-[1px] text-[#9b9b9b] font-['Montserrat'] uppercase mb-0.5">Deliver to</p>
                            <p className="text-[11px] text-[#1a1a1a] font-['Montserrat'] max-w-[180px] truncate">
                              {typeof order.address === "string"
                                ? order.address
                                : `${order.address.city || order.address.fullName || ""}`}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[9px] tracking-[1px] text-[#9b9b9b] font-['Montserrat'] uppercase mb-0.5">Total</p>
                          <p className="text-[16px] font-bold text-[#1a1a1a] font-['Montserrat']">
                            {formatCurrency(order.amount || order.total)}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate("/")}
                          className="text-[9px] tracking-[2px] font-semibold font-['Montserrat'] border border-[#1a1a1a] px-4 py-2 hover:bg-[#1a1a1a] hover:text-white transition-all duration-300 whitespace-nowrap"
                        >
                          BUY AGAIN
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* ── Bottom CTA ── */}
        {!loading && orders.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/")}
              className="text-[10px] tracking-[3px] font-semibold font-['Montserrat'] border border-[#1a1a1a] px-8 py-3 hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default MyOrders;