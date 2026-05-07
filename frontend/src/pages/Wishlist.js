import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { addToCart } from "../redux/slices/cartSlice";
import {
  setWishlist,
  removeFromWishlistLocal,
  clearWishlistLocal,
  selectWishlistItems,
} from "../redux/slices/wishlistSlice";

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-8 right-8 px-6 py-4 text-[11px] tracking-[2px] font-semibold font-['Montserrat'] shadow-lg z-50 transition-all duration-300 ${
        toast.type === "error" ? "bg-red-500 text-white" : "bg-[#1a1a1a] text-white"
      }`}
    >
      {toast.msg}
    </div>
  );
}

function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector((state) => state.auth.user);
  const items    = useSelector(selectWishlistItems);

  const [loading,    setLoading]    = useState(true);
  const [addedId,    setAddedId]    = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch wishlist ------------------------------------------------------------------------------------------------────────────
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    API.get("/wishlist")
      .then((res) => dispatch(setWishlist(res.data.products || [])))
      .catch(() => showToast("Failed to load wishlist", "error"))
      .finally(() => setLoading(false));
  }, [user, dispatch]);

  // ── Remove ------------------------------------------------------------------------------------------------────────────────────
  const handleRemove = async (productId) => {
    setRemovingId(productId);
    dispatch(removeFromWishlistLocal(productId));
    try {
      await API.delete(`/wishlist/${productId}`);
      showToast("Removed from wishlist");
    } catch {
      API.get("/wishlist").then((res) => dispatch(setWishlist(res.data.products || [])));
      showToast("Failed to remove", "error");
    } finally {
      setRemovingId(null);
    }
  };

  // ── Clear all ------------------------------------------------------------------------------------------------─────────────────
const handleClear = async () => {
  dispatch(clearWishlistLocal());
  try {
    await API.delete("/wishlist/clear");   // ← /clear add karo
    showToast("Wishlist cleared");
  } catch {
    API.get("/wishlist").then((res) => dispatch(setWishlist(res.data.products || [])));
    showToast("Failed to clear", "error");
  }
};

  // ── Add to cart ------------------------------------------------------------------------------------------------───────────────
 const handleAddToCart = (product) => {
    const firstVariant = product.variants?.[0];
    const firstSize    = firstVariant?.sizes?.[0];
    
    // colorGroups fallback
    const firstColorGroup = product.colorGroups?.[0];

    const image =
      firstVariant?.images?.[0] ||
      firstColorGroup?.images?.[0] ||
      product.image ||
      "";

    dispatch(
      addToCart({
        _id:       product._id,
        product:   product._id,
        variantId: firstVariant?._id || firstColorGroup?._id || "", // ← fix
        name:      product.name,
        price:     firstSize?.sellingPrice || firstColorGroup?.price || product.price || 0,
        image,
        size:      firstSize?.size || product.sizes?.[0] || "Free Size",
        color:     firstVariant?.color || firstColorGroup?.colorName || "",
        quantity:  1,
      })
    );

    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 2000);
    showToast(`"${product.name}" added to cart ✓`);
  };
  // ── Not logged in ------------------------------------------------------------------------------------------------─────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-40 flex items-center justify-center">
        <div className="text-center">
          <p className="font-['Cormorant_Garamond'] text-5xl text-[#c8c0b4] italic mb-4">
            Sign in to see your wishlist
          </p>
          <p className="text-[10px] tracking-[2px] text-[#9b9b9b] font-['Montserrat'] mb-8">
            Save your favourite pieces in one place
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#1a1a1a] text-white text-[10px] tracking-[3px] font-semibold px-8 py-4 font-['Montserrat'] hover:bg-[#3d3020] transition-all duration-300"
          >
            LOGIN
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ------------------------------------------------------------------------------------------------───────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-36 pb-20">
        <div className="max-w-[1400px] mx-auto px-20">
          <div className="mb-10">
            <div className="h-3 bg-[#ede9e3] rounded w-24 mb-3 animate-pulse" />
            <div className="h-10 bg-[#ede9e3] rounded w-64 animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#ede9e3] aspect-[3/4] mb-4 rounded" />
                <div className="h-3 bg-[#ede9e3] rounded w-1/2 mb-2" />
                <div className="h-4 bg-[#ede9e3] rounded w-3/4 mb-3" />
                <div className="h-8 bg-[#ede9e3] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Empty ------------------------------------------------------------------------------------------------─────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-40 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full border border-[#e8e4de] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#c8c0b4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="font-['Cormorant_Garamond'] text-5xl text-[#c8c0b4] italic mb-4">
            Your wishlist is empty
          </p>
          <p className="text-[10px] tracking-[2px] text-[#9b9b9b] font-['Montserrat'] mb-8">
            Save pieces you love by tapping the heart icon
          </p>
          <button
            onClick={() => navigate("/homedecore")}
            className="bg-[#1a1a1a] text-white text-[10px] tracking-[3px] font-semibold px-8 py-4 font-['Montserrat'] hover:bg-[#3d3020] transition-all duration-300"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    );
  }

  // ── Main wishlist page ------------------------------------------------------------------------------------------------────────
  return (
    <div className="bg-[#faf8f5] min-h-screen pt-36 pb-20">
      <div className="max-w-[1400px] mx-auto px-20">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[9px] tracking-[4px] text-[#9b9b9b] font-['Montserrat'] mb-2">
              YOUR SAVED ITEMS
            </p>
            <h1 className="font-['Cormorant_Garamond'] text-5xl font-light text-[#1a1a1a]">
              Wishlist
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-[10px] tracking-[1px] text-[#9b9b9b] font-['Montserrat']">
              {items.length} {items.length === 1 ? "piece" : "pieces"} saved
            </p>
            <button
              onClick={handleClear}
              className="text-[9px] tracking-[2px] text-[#9b9b9b] font-['Montserrat'] hover:text-red-400 transition-colors underline"
            >
              CLEAR ALL
            </button>
          </div>
        </div>

        <div className="h-px bg-[#e8e4de] mb-10" />

        {/* Grid */}
        <div className="grid grid-cols-3 gap-8">
          {items.map((product) => {
            const firstVariant  = product.variants?.[0];
            const firstSize     = firstVariant?.sizes?.[0];

            // same fallback chain 
            const firstColorGroup = product.colorGroups?.[0];
           const image =
  product.selectedImage ||        
  firstVariant?.images?.[0] ||
  firstColorGroup?.images?.[0] ||
  product.image ||
  "";

            const price         = firstSize?.sellingPrice || product.price || 0;
            const originalPrice = firstSize?.originalPrice || product.originalPrice || null;
            const discount      = firstSize?.discount || product.discount || null;
            const isAdded       = addedId    === product._id;
            const isRemoving    = removingId === product._id;

            return (
              <div
                key={product._id}
                className={`group transition-opacity duration-300 ${
                  isRemoving ? "opacity-40 pointer-events-none" : "opacity-100"
                }`}
              >
                {/* Image */}
                <div
                  className="relative bg-[#f0ece6] aspect-[3/4] overflow-hidden mb-4 cursor-pointer group-hover:shadow-xl transition-shadow duration-300"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      // ✅ FIX: if URL is broken, show placeholder instead of broken icon
                      onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    />
                  ) : null}
                  {/* Placeholder — always rendered, hidden when image loads */}
                  <div
                    className="w-full h-full flex items-center justify-center absolute inset-0"
                    style={{ display: image ? "none" : "flex" }}
                  >
                    <span className="text-6xl opacity-20">🖼️</span>
                  </div>

                  {discount && (
                    <span className="absolute top-3 left-3 bg-[#1a1a1a] text-white text-[8px] tracking-[2px] font-semibold px-2 py-1 font-['Montserrat']">
                      {discount}% OFF
                    </span>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(product._id); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-all duration-200 group/heart"
                    title="Remove from wishlist"
                  >
                    <svg
                      className="w-4 h-4 text-red-400 group-hover/heart:scale-110 transition-transform duration-200"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-[9px] tracking-[2px] text-[#6b6b6b] font-medium uppercase font-['Montserrat']">
                    {product.subCategory?.name || product.category?.name}
                  </p>
                  <h3
                    className="font-['Cormorant_Garamond'] text-lg font-normal text-[#1a1a1a] tracking-wide cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[13px] font-medium text-[#1a1a1a] font-['Montserrat']">
                      ₹{Number(price).toLocaleString("en-IN")}
                    </span>
                    {originalPrice && originalPrice > price && (
                      <span className="text-[11px] text-[#b0a898] line-through font-['Montserrat']">
                        ₹{Number(originalPrice).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-3 text-[10px] tracking-[2px] font-semibold font-['Montserrat'] transition-all duration-300 ${
                      isAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-[#1a1a1a] text-white hover:bg-[#3d3020]"
                    }`}
                  >
                    {isAdded ? "✓ ADDED TO CART" : "ADD TO CART"}
                  </button>

                  <button
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="w-full py-2.5 text-[10px] tracking-[2px] font-semibold font-['Montserrat'] border border-[#e8e4de] text-[#6b6b6b] hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-all duration-300"
                  >
                    VIEW DETAILS
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => navigate("/homedecore")}
            className="text-[10px] tracking-[2px] font-semibold font-['Montserrat'] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
          >
            ← CONTINUE SHOPPING
          </button>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}

export default Wishlist;