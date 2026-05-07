import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { addToCart, selectCartItems } from "../redux/slices/cartSlice";
import {
  addToWishlistLocal,
  removeFromWishlistLocal,
  selectIsWishlisted,
} from "../redux/slices/wishlistSlice";
import API from "../api/axios";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const isWishlisted = useSelector(selectIsWishlisted(product?._id));

  const handleWishlist = async () => {
  if (isWishlisted) {
    dispatch(removeFromWishlistLocal(product._id));
    await API.delete(`/wishlist/${product._id}`);
  } else {
    dispatch(addToWishlistLocal({ 
      ...product,
      _id: product._id,
      // ✅ Selected image pass karo
      selectedImage: selectedColor?.images?.[activeImage] || "",
      selectedColor: selectedColor?.color || "",
    }));
    await API.post("/wishlist", { productId: product._id });
  }
};
  // ── Fetch product ------------------------------------------------------------------------------------------------─────────────
 useEffect(() => {
  setLoading(true);
  API.get(`/products/${id}`)
    .then((res) => {
      const p = res.data.product;
      setProduct(p);
 
     if (p.variants?.length > 0) {
  const fromCart = location.state;

  const matchedVariant = fromCart?.variantId
    ? p.variants.find((v) => String(v._id) === String(fromCart.variantId))
    : fromCart?.color
    ? p.variants.find((v) => v.color?.toLowerCase() === fromCart.color?.toLowerCase())
    : null;

  const activeVariant = matchedVariant || p.variants[0];
  setSelectedColor(activeVariant);

  const matchedSize = fromCart?.size
    ? activeVariant.sizes?.find((s) => s.size?.toLowerCase() === fromCart.size?.toLowerCase())
    : null;

  setSelectedSize(matchedSize || activeVariant.sizes?.[0] || null);
}
      // ── OLD schema fallback: colorGroups[] ──────────────────────────
      else if (p.colorGroups?.length > 0) {
        setSelectedColor({
          color: p.colorGroups[0].colorName,
          colorHex: p.colorGroups[0].colorHex,
          images: p.colorGroups[0].images || [],
          sizes: p.sizes?.map((s) => ({
            size: s,
            sellingPrice: p.price,
            originalPrice: p.originalPrice || null,
            discount: p.discount || null,
          })) || [{ size: "Free Size", sellingPrice: p.price }],
        });
        setSelectedSize({
          size: p.sizes?.[0] || "Free Size",
          sellingPrice: p.price,
          originalPrice: p.originalPrice || null,
          discount: p.discount || null,
        });
      }
      // ── No variants at all ───────────────────────────────────────────
      else {
        setSelectedColor({
          color: "",
          colorHex: "#000000",
          images: [],
          sizes: [{ size: "Free Size", sellingPrice: p.price || 0 }],
        });
        setSelectedSize({ size: "Free Size", sellingPrice: p.price || 0 });
      }
    })
    .catch(() => setError("Product not found"))
    .finally(() => setLoading(false));
}, [id , location.state]); 

  // ── Color / Size handlers ------------------------------------------------------------------------------------------------─────
  const handleColorSelect = (variant) => {
    setSelectedColor(variant);
    setSelectedSize(variant.sizes?.[0] || null);
    setActiveImage(0);
  };

  const handleSizeSelect = (sizeObj) => {
    setSelectedSize(sizeObj);
  };

  // ── Add to cart ------------------------------------------------------------------------------------------------───────────────
const handleAddToCart = () => {
  if (!selectedColor) { setError("Please select a color"); return; }
  if (!selectedSize)  { setError("Please select a size");  return; }
  setError("");

  dispatch(
    addToCart({
      _id:       product._id,
      variantId: selectedColor._id || selectedColor.color || "", // ← fix
      product:   product._id,
      name:      product.name,
      price:     selectedSize.sellingPrice,
      image:     selectedColor.images?.[activeImage] || "",
      description: product.description || "",
      size:      selectedSize.size,
      color:     selectedColor.color,
      quantity,
    })
  );

  setAdded(true);
  setTimeout(() => setAdded(false), 2000);
};

  // ── Buy now ------------------------------------------------------------------------------------------------───────────────────
  const handleBuyNow = () => {
    if (!selectedColor) {
      setError("Please select a color");
      return;
    }
    if (!selectedSize) {
      setError("Please select a size");
      return;
    }
    setError("");
    const cartItem = cartItems.find(
  (c) =>
    String(c._id) === String(product._id) &&
    String(c.variantId || "") === String(selectedColor._id || selectedColor.color || "") &&
    c.size  === selectedSize.size &&
    c.color === selectedColor.color
);

    navigate("/checkout", {
      state: {
        isBuyNow: true,
        items: [
          {
            product: product._id,
            _id: product._id,
            variantId: selectedColor._id,
            name: product.name,
            price: selectedSize.sellingPrice,
            image: selectedColor.images?.[activeImage] || "",
            size: selectedSize.size,
            color: selectedColor.color,
            quantity,
            itemId:    cartItem?.itemId || null, 
          },
        ],
      },
    });
  };

  // ── Loading ------------------------------------------------------------------------------------------------───────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-40 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border border-[#1a1a1a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] tracking-[3px] text-[#9b9b9b] font-['Montserrat']">
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-40 flex items-center justify-center">
        <div className="text-center">
          <p className="font-['Cormorant_Garamond'] text-4xl text-[#c8c0b4] italic mb-4">
            Product not found
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-[10px] tracking-[2px] font-semibold font-['Montserrat'] border border-[#1a1a1a] px-6 py-2 hover:bg-[#1a1a1a] hover:text-white transition-all"
          >
            ← GO BACK
          </button>
        </div>
      </div>
    );
  }

  // Guard — wait until state is populated
  if (!product || !selectedColor || !selectedSize) return null;

  const images =
    selectedColor.images?.length > 0 ? selectedColor.images : [null];

  return (
    <div className="bg-[#faf8f5] min-h-screen pt-36">
      {/* ── Breadcrumb ── */}
      <div className="max-w-[1400px] mx-auto px-20 pb-6">
        <p className="text-[9px] tracking-[2px] text-[#b0a898] font-['Montserrat']">
          <span
            className="cursor-pointer hover:text-[#1a1a1a] transition-colors"
            onClick={() => navigate("/")}
          >
            HOME
          </span>
          &nbsp;/&nbsp;
          <span
            className="cursor-pointer hover:text-[#1a1a1a] transition-colors"
            onClick={() => navigate("/homedecore")}
          >
            {product.category?.name?.toUpperCase() || "PRODUCTS"}
          </span>
          &nbsp;/&nbsp;
          <span className="text-[#1a1a1a]">{product.name.toUpperCase()}</span>
        </p>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-[1400px] mx-auto px-20 pb-20">
        <div className="grid grid-cols-2 gap-16">
          {/* ── Left: Image Gallery ── */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-20 border-2 transition-all duration-200 overflow-hidden ${
                      activeImage === i
                        ? "border-[#1a1a1a]"
                        : "border-transparent hover:border-[#c8c0b4]"
                    }`}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#f0ece6] flex items-center justify-center text-2xl">
                        🖼️
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 bg-[#f0ece6] aspect-[3/4] overflow-hidden relative">
              {images[activeImage] ? (
                <img
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl opacity-20">🖼️</span>
                </div>
              )}
              {/* Subcategory badge */}
              {product.subCategory?.name && (
                <span className="absolute top-4 left-4 bg-white/80 text-[#1a1a1a] text-[8px] tracking-[2px] font-medium px-3 py-1.5 font-['Montserrat']">
                  {product.subCategory.name.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* ── Right: Product Info ── */}
          <div className="flex flex-col">
            {/* Category */}
            <p className="text-[9px] tracking-[3px] text-[#9b9b9b] font-['Montserrat'] mb-3">
              {product.category?.name?.toUpperCase()}
            </p>

            {/* Name */}
            <h1 className="font-['Cormorant_Garamond'] text-5xl font-light text-[#1a1a1a] mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Divider */}
            <div className="w-12 h-px bg-[#c8a96e] mb-6" />

            {/* ── Price Block ── */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="text-2xl font-medium text-[#1a1a1a] font-['Montserrat']">
                ₹{Number(selectedSize.sellingPrice).toLocaleString("en-IN")}
              </span>
              {selectedSize.originalPrice &&
                selectedSize.originalPrice > selectedSize.sellingPrice && (
                  <span className="text-base text-[#9b9b9b] line-through font-['Montserrat']">
                    ₹
                    {Number(selectedSize.originalPrice).toLocaleString("en-IN")}
                  </span>
                )}
              {selectedSize.discount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded tracking-wide font-['Montserrat']">
                  {selectedSize.discount}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-[12px] text-[#6b6b6b] leading-relaxed font-['Montserrat'] mb-8 tracking-wide">
                {product.description}
              </p>
            )}

            {/* ── Color Selector ── */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <p className="text-[9px] tracking-[2px] text-[#9b9b9b] font-semibold font-['Montserrat'] mb-3">
                  COLOR {selectedColor.color && `— ${selectedColor.color}`}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => handleColorSelect(v)}
                      title={v.color}
                      className={`w-8 h-8 rounded-full transition-all duration-200 ${
                        selectedColor.color === v.color
                          ? "ring-2 ring-offset-2 ring-[#1a1a1a] scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: v.colorHex || "#000000" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Size Selector ── */}
            {selectedColor.sizes?.length > 0 && (
              <div className="mb-6">
                <p className="text-[9px] tracking-[2px] text-[#9b9b9b] font-semibold font-['Montserrat'] mb-3">
                  SIZE {selectedSize.size && `— ${selectedSize.size}`}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {selectedColor.sizes.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSizeSelect(s)}
                      className={`px-4 py-2 text-[10px] tracking-[1px] font-semibold font-['Montserrat'] border transition-all duration-200 ${
                        selectedSize.size === s.size
                          ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                          : "border-[#e8e4de] text-[#1a1a1a] hover:border-[#1a1a1a]"
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Quantity ── */}
            <div className="mb-8">
              <p className="text-[9px] tracking-[2px] text-[#9b9b9b] font-semibold font-['Montserrat'] mb-3">
                QUANTITY
              </p>
              <div className="flex items-center gap-0 border border-[#e8e4de] w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 text-[#1a1a1a] hover:bg-[#f0ece6] transition-colors text-lg font-light"
                >
                  −
                </button>
                <span className="w-12 text-center text-[13px] font-medium text-[#1a1a1a] font-['Montserrat']">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 text-[#1a1a1a] hover:bg-[#f0ece6] transition-colors text-lg font-light"
                >
                  +
                </button>
              </div>
            </div>

            {/* ── Error ── */}
            {error && (
              <p className="text-red-400 text-[11px] font-['Montserrat'] mb-4 tracking-wide">
                {error}
              </p>
            )}

            {/* ── Buttons ── */}
            {/* ── Buttons ── */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 text-[11px] tracking-[3px] font-semibold font-['Montserrat'] transition-all duration-300 ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-[#1a1a1a] text-white hover:bg-[#3d3020]"
                }`}
              >
                {added ? "✓ ADDED TO CART" : "ADD TO CART"}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-4 border border-[#1a1a1a] text-[#1a1a1a] text-[11px] tracking-[3px] font-semibold font-['Montserrat'] hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
              >
                BUY NOW
              </button>

              {/* ✅ ADD THIS — Wishlist heart button */}
              <button
                onClick={handleWishlist}
                title={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                className={`w-14 h-14 border flex items-center justify-center transition-all duration-300 shrink-0 ${
                  isWishlisted
                    ? "border-red-400 bg-red-50"
                    : "border-[#e8e4de] hover:border-red-400 hover:bg-red-50"
                }`}
              >
                <svg
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isWishlisted ? "text-red-500" : "text-[#9b9b9b]"
                  }`}
                  fill={isWishlisted ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>

            {/* ── Info Strips ── */}
            <div className="mt-8 border-t border-[#e8e4de] pt-6 flex flex-col gap-3">
              {[
                "✦ Free shipping on orders over ₹5000",
                "✦ Easy 30-day returns",
                "✦ Secure checkout with Razorpay",
              ].map((text) => (
                <p
                  key={text}
                  className="text-[10px] tracking-[1.5px] text-[#9b9b9b] font-['Montserrat']"
                >
                  {text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
