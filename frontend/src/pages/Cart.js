import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  setCartFromBackend,
  selectCartItems,
  selectCartTotal,
} from "../redux/slices/cartSlice";

// ── Razorpay loader ───────────────────────────────────────────────────────────
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector((state) => state.auth.user);
  const items    = useSelector(selectCartItems);
  const total    = useSelector(selectCartTotal);

  const [syncing, setSyncing] = useState(false);
  const [paying,  setPaying]  = useState(false);
  const [toast,   setToast]   = useState(null);

  // ── Sync guest cart to backend when user logs in ──────────────────────────
  useEffect(() => {
  if (!user) return;

  const syncCart = async () => {
  setSyncing(true);
  try {
    const res = await API.get("/cart");
    const backendItems = res.data.cart?.items || [];

    for (const item of items) {
      const alreadyInBackend = backendItems.find(
        (b) =>
          String(b.productId?._id || b.productId) === String(item._id) &&
          b.size?.toLowerCase() === (item.size || "").toLowerCase() &&
          b.color?.toLowerCase() === (item.color || "").toLowerCase()
      );
      if (!alreadyInBackend) {
        await API.post("/cart", {
          productId: item._id,
          quantity: item.quantity,
          size: item.size || "",
          color: item.color || "",
        });
      }
    }

    const finalRes = await API.get("/cart");
    const mapped = (finalRes.data.cart?.items || []).map((i) => ({
      _id: i.productId?._id || i.productId,
      product: i.productId?._id || i.productId,
      itemId: i._id,
      name: i.productId?.name || "",
      image: i.productId?.variants?.find((v) => v.color === i.color)?.images?.[0] || "",
      price: i.price,
      size: i.size || "",
      color: i.color || "",
      variantId: i.variantId || "",
      quantity: i.quantity,
    }));
    dispatch(setCartFromBackend(mapped));
  } catch {
  } finally {
    setSyncing(false);
  }
};

  syncCart();
}, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Navigate to product — passes the exact color/size the user had ────────
  const goToProduct = (item) => {
    navigate(`/product/${item._id}`, {
      state: {
        color:     item.color     || "",
        size:      item.size      || "",
        variantId: item.variantId || "",
      },
    });
  };

  // ── Remove ────────────────────────────────────────────────────────────────
  const handleRemove = async (item) => {
    if (user && item.itemId) {
      try { await API.delete(`/cart/${item.itemId}`); } catch {}
    }
    dispatch(removeFromCart({ _id: item._id, size: item.size, color: item.color, variantId: item.variantId }));
    showToast("Item removed");
  };

  // ── Quantity ──────────────────────────────────────────────────────────────
  const handleQtyChange = async (item, qty) => {
    if (qty <= 0) {
      if (user && item.itemId) {
        try { await API.delete(`/cart/${item.itemId}`); } catch {}
      }
      dispatch(removeFromCart({ _id: item._id, size: item.size, color: item.color, variantId: item.variantId }));
      return;
    }

    if (user && item.itemId) {
      try { await API.put(`/cart/${item.itemId}`, { quantity: qty }); } catch {}
    }
    dispatch(updateQuantity({ _id: item._id, size: item.size, color: item.color, variantId: item.variantId, quantity: qty }));
  };

  // ── Clear ─────────────────────────────────────────────────────────────────
  const handleClear = async () => {
    if (user) {
      try { await API.delete("/cart/clear"); } catch {}
    }
    dispatch(clearCart());
    showToast("Cart cleared");
  };

  // ── Shipping & totals ─────────────────────────────────────────────────────
  const shipping = total >= 1000 ? 0 : 99;
  const grandTotal = total + shipping;

  // ── Razorpay ──────────────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!user) { navigate("/login"); return; }

    setPaying(true);
    const loaded = await loadRazorpay();
    if (!loaded) {
      showToast("Razorpay failed to load.", "error");
      setPaying(false);
      return;
    }

    try {
      const { data } = await API.post("/orders/create-razorpay-order", { amount: grandTotal });

      const options = {
        key:      data.key || process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount:   data.order.amount,
        currency: data.order.currency || "INR",
        order_id: data.order.id,
        name:        "TrendyTrove",
        description: `Order of ${items.length} item(s)`,
        prefill: { name: user.name || "", email: user.email || "" },
        theme: { color: "#1a1a1a" },

        handler: async (response) => {
          try {
            await API.post("/orders/place", {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              items: items.map((item) => ({
                product:  item._id || item.product,
                name:     item.name,
                quantity: item.quantity,
                price:    item.price,
                image:    item.image || "",
                size:     item.size  || "",
                color:    item.color || "",
              })),
              amount:  grandTotal,
              type:    "cart",
              address: {},
            });
            dispatch(clearCart());
            if (user) { try { await API.delete("/cart/clear"); } catch {} }
            showToast("Payment successful! Order placed.");
            setTimeout(() => navigate("/"), 2000);
          } catch {
            showToast("Payment done but order failed. Contact support.", "error");
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false);
            showToast("Payment cancelled", "error");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        showToast("Payment failed. Please try again.", "error");
        setPaying(false);
      });
      rzp.open();
    } catch {
      showToast("Failed to initiate payment.", "error");
      setPaying(false);
    }
  };

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-40 flex items-center justify-center">
        <div className="text-center">
          <p className="font-['Cormorant_Garamond'] text-5xl text-[#c8c0b4] italic mb-4">Your cart is empty</p>
          <p className="text-[10px] tracking-[2px] text-[#9b9b9b] font-['Montserrat'] mb-8">
            Looks like you haven't added anything yet
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#1a1a1a] text-white text-[10px] tracking-[3px] font-semibold px-8 py-4 font-['Montserrat'] hover:bg-[#3d3020] transition-all duration-300"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf8f5] min-h-screen pt-36 pb-20">
      <div className="max-w-[1400px] mx-auto px-20">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[9px] tracking-[4px] text-[#9b9b9b] font-['Montserrat'] mb-2">YOUR BAG</p>
            <h1 className="font-['Cormorant_Garamond'] text-5xl font-light text-[#1a1a1a]">Shopping Cart</h1>
          </div>
          <button
            onClick={handleClear}
            className="text-[9px] tracking-[2px] text-[#9b9b9b] font-['Montserrat'] hover:text-red-400 transition-colors underline"
          >
            CLEAR ALL
          </button>
        </div>

        {syncing && (
          <p className="text-[10px] tracking-[2px] text-[#9b9b9b] font-['Montserrat'] mb-6 animate-pulse">
            Syncing your cart...
          </p>
        )}

        <div className="grid grid-cols-[1fr_380px] gap-12">

          {/* Cart Items */}
          <div className="flex flex-col gap-0">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] pb-4 border-b border-[#e8e4de]">
              {["PRODUCT", "PRICE", "QUANTITY", "TOTAL"].map((h) => (
                <p key={h} className="text-[8px] tracking-[3px] text-[#9b9b9b] font-semibold font-['Montserrat']">{h}</p>
              ))}
            </div>

            {items.map((item, i) => (
              <div
                key={`${item._id}-${item.variantId}-${item.size}-${item.color}-${i}`}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] py-6 border-b border-[#f0ece6] items-center"
              >
                {/* Product */}
                <div className="flex items-center gap-4">
                  {/* Image — click goes to product with correct variant pre-selected */}
                  <div
                    className="w-20 h-24 bg-[#f0ece6] overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() => goToProduct(item)}
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">🖼️</div>
                    )}
                  </div>

                  <div>
                    {/* Name — click goes to product with correct variant pre-selected */}
                    <p
                      className="font-['Cormorant_Garamond'] text-lg text-[#1a1a1a] cursor-pointer hover:underline leading-snug"
                      onClick={() => goToProduct(item)}
                    >
                      {item.name}
                    </p>
                    {item.size && (
                      <p className="text-[9px] tracking-[1.5px] text-[#9b9b9b] font-['Montserrat'] mt-1">
                        Size: {item.size}
                      </p>
                    )}
                    {item.color && (
                      <p className="text-[9px] tracking-[1.5px] text-[#9b9b9b] font-['Montserrat']">
                        Color: {item.color}
                      </p>
                    )}
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-[9px] tracking-[1px] text-[#9b9b9b] hover:text-red-400 transition-colors font-['Montserrat'] mt-2 underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <p className="text-[13px] font-medium text-[#1a1a1a] font-['Montserrat']">
                  ₹{Number(item.price).toLocaleString("en-IN")}
                </p>

                {/* Quantity */}
                <div className="flex items-center border border-[#e8e4de] w-fit">
                  <button
                    onClick={() => handleQtyChange(item, item.quantity - 1)}
                    className="w-8 h-8 hover:bg-[#f0ece6] transition-colors text-[#1a1a1a]"
                  >−</button>
                  <span className="w-8 text-center text-[12px] font-medium font-['Montserrat'] text-[#1a1a1a]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange(item, item.quantity + 1)}
                    className="w-8 h-8 hover:bg-[#f0ece6] transition-colors text-[#1a1a1a]"
                  >+</button>
                </div>

                {/* Total */}
                <p className="text-[13px] font-medium text-[#1a1a1a] font-['Montserrat']">
                  ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                </p>
              </div>
            ))}

            <button
              onClick={() => navigate("/")}
              className="mt-6 text-[10px] tracking-[2px] font-semibold font-['Montserrat'] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors w-fit"
            >
              ← CONTINUE SHOPPING
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-white border border-[#e8e4de] p-8 h-fit sticky top-36">
            <h2 className="font-['Cormorant_Garamond'] text-2xl text-[#1a1a1a] mb-6">Order Summary</h2>

            <div className="flex flex-col gap-3 mb-6">
              <div className="flex justify-between">
                <p className="text-[11px] tracking-[1px] text-[#6b6b6b] font-['Montserrat']">
                  Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)
                </p>
                <p className="text-[12px] font-medium text-[#1a1a1a] font-['Montserrat']">
                  ₹{total.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-[11px] tracking-[1px] text-[#6b6b6b] font-['Montserrat']">Shipping</p>
                <p className={`text-[12px] font-medium font-['Montserrat'] ${shipping === 0 ? "text-emerald-600" : "text-[#1a1a1a]"}`}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </p>
              </div>
              {shipping > 0 && (
                <p className="text-[9px] tracking-[1px] text-[#b0a898] font-['Montserrat']">
                  Add ₹{(1000 - total).toLocaleString("en-IN")} more for free shipping
                </p>
              )}
            </div>

            <div className="border-t border-[#e8e4de] mb-6" />

            <div className="flex justify-between mb-8">
              <p className="text-[12px] tracking-[2px] font-semibold text-[#1a1a1a] font-['Montserrat']">TOTAL</p>
              <p className="text-xl font-medium text-[#1a1a1a] font-['Montserrat']">
                ₹{grandTotal.toLocaleString("en-IN")}
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={paying}
              className="w-full bg-[#1a1a1a] text-white text-[10px] tracking-[3px] font-semibold py-4 font-['Montserrat'] hover:bg-[#3d3020] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  PROCESSING...
                </>
              ) : (
                "PAY WITH RAZORPAY"
              )}
            </button>

            {!user && (
              <p className="text-[9px] tracking-[1px] text-[#9b9b9b] font-['Montserrat'] text-center mt-3">
                You'll be asked to login before payment
              </p>
            )}
            <p className="text-[9px] tracking-[1px] text-[#b0a898] font-['Montserrat'] text-center mt-4">
              🔒 Secured by Razorpay · 256-bit SSL
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 text-[11px] tracking-[2px] font-semibold font-['Montserrat'] shadow-lg z-50 ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-[#1a1a1a] text-white"
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default Cart;