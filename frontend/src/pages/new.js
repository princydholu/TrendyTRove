import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlistLocal,
  removeFromWishlistLocal,
  selectIsWishlisted,
} from "../redux/slices/wishlistSlice";
import { addToCart } from "../redux/slices/cartSlice";
import API from "../api/axios";

const getEmoji = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("jewel"))  return "💍";
  if (n.includes("mirror")) return "🪞";
  if (n.includes("lamp"))   return "🪔";
  if (n.includes("wall"))   return "🖼️";
  if (n.includes("bag"))    return "👜";
  if (n.includes("candle")) return "🕯️";
  if (n.includes("vase"))   return "🪴";
  return "🏠";
};

// ── ProductCard — own component so hooks work inside .map() ──────────────────
function ProductCard({ product, navigate }) {
  const dispatch     = useDispatch();
  const isWishlisted = useSelector(selectIsWishlisted(product._id));
  const [added, setAdded] = useState(false);

  // ── Resolve data from variants (new schema) ──────────────────────────────
  const firstVariant  = product.variants?.[0];
  const firstSize     = firstVariant?.sizes?.[0];

  const image         = firstVariant?.images?.[0] || product.colorGroups?.[0]?.images?.[0] || null;
  const price         = firstSize?.sellingPrice   || product.price         || 0;
  const originalPrice = firstSize?.originalPrice  || product.originalPrice || null;
  const discount      = firstSize?.discount       || product.discount      || null;

  // ── Wishlist ------------------------------------------------------------------------------------------------────────────────
  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (isWishlisted) {
      dispatch(removeFromWishlistLocal(product._id));
      await API.delete(`/wishlist/${product._id}`);
    } else {
      dispatch(addToWishlistLocal({ _id: product._id, ...product }));
      await API.post("/wishlist", { productId: product._id });
    }
  };

  // ── Add to cart ------------------------------------------------------------------------------------------------─────────────
  // FIX: pass variantId so duplicate check in cartSlice works correctly
  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(
      addToCart({
        _id:       product._id,
        product:   product._id,
        variantId: firstVariant?._id || product._id, // ✅ critical — prevents duplicates
        name:      product.name,
        price,
        image:     image || "",
        size:      firstSize?.size || "Free Size",
        color:     firstVariant?.color || "",
        quantity:  1,
      })
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className="relative bg-[#faf8f5] aspect-[3/4] flex items-center justify-center mb-4 overflow-hidden group-hover:shadow-xl transition-shadow duration-300">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="font-['Cormorant_Garamond'] text-5xl text-[#e8e8e8]">♠</span>
        )}

        {/* Discount / NEW badge */}
        <span className="absolute top-3 left-3 bg-[#1a1a1a] text-white text-[8px] tracking-[2px] font-semibold px-2 py-1 font-['Montserrat']">
          {discount ? `${discount}% OFF` : "NEW"}
        </span>

        {/* Wishlist icon */}
        <button
          onClick={handleWishlist}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all duration-300 ${
            isWishlisted ? "bg-red-50" : "bg-white/80 hover:bg-white"
          }`}
        >
          <svg
            className={`w-4 h-4 transition-colors duration-300 ${
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

      <div className="flex flex-col gap-1.5">
        <p className="text-[9px] tracking-[2px] text-[#6b6b6b] font-medium uppercase font-['Montserrat']">
          {product.category?.name}
        </p>
        <h3 className="font-['Cormorant_Garamond'] text-lg font-normal text-[#1a1a1a] tracking-wide">
          {product.name}
        </h3>
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[#1a1a1a] tracking-wide font-['Montserrat']">
              ₹{Number(price).toLocaleString("en-IN")}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-[11px] text-[#b0a898] line-through font-['Montserrat']">
                ₹{Number(originalPrice).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* ✅ FIX: actually dispatches addToCart instead of navigating */}
          <button
            onClick={handleAddToCart}
            className={`text-[9px] tracking-[1.5px] font-semibold px-4 py-1.5 font-['Montserrat'] transition-all duration-300 ${
              added
                ? "bg-green-600 text-white border border-green-600"
                : "border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
            }`}
          >
            {added ? "✓ Added" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ------------------------------------------------------------------------------------------------────────────────────
function New() {
  const navigate = useNavigate();
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    API.get("/categories?limit=100")
      .then((res) => {
        const all = res.data.categories || [];
        setCategories(
          all.filter((c) => c.level === 1 || c.level === "1" || c.level === "Main")
        );
      })
      .catch(console.error)
      .finally(() => setCatLoading(false));

    API.get("/products?limit=100")
      .then((res) => setProducts(res.data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCatPath = (name = "") =>
    `/${name.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section
        className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 40%, #3d3020 100%)" }}
      >
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0">
          <source src="/White Clean Video-centric Accessories Review Fashion 169 Video (1).mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div
          className="absolute inset-0 z-10"
          style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(184,134,11,0.15) 0%, transparent 60%)" }}
        />
        <div className="relative z-20 text-center text-white">
          <a
            href="#new-products"
            className="inline-block no-underline text-white text-[10px] tracking-[3px] font-semibold border-b border-white pb-1 hover:tracking-[5px] hover:opacity-70 transition-all duration-300 font-['Montserrat'] mt-16"
          >
            SHOP THE LATEST
          </a>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] tracking-[3px] text-white/50 animate-bounce z-20">
          ↓ SCROLL
        </div>
      </section>

      {/* ── Categories ── */}
<section className="px-20 py-16 bg-[#faf8f5]">
  <div className="text-center mb-10">
    <p className="text-[10px] tracking-[4px] text-[#6b6b6b] font-medium font-['Montserrat']">
      ✦ SHOP BY CATEGORY
    </p>
  </div>
  <div className="flex flex-wrap justify-center gap-10 max-w-5xl mx-auto">
    {catLoading
      ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
            <div className="w-32 h-32 rounded-full bg-[#ede9e3]" />
            <div className="h-3 w-20 bg-[#ede9e3] rounded" />
          </div>
        ))
      : categories.map((cat) => (
          <div
            key={cat._id}
            onClick={() => navigate(getCatPath(cat.name))}
            className="flex flex-col items-center gap-3 cursor-pointer group"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border border-[#e8e4de] group-hover:border-[#c8a96e] group-hover:shadow-lg transition-all duration-300 bg-[#f0ece6] flex items-center justify-center">
              {cat.image && cat.image.startsWith("http") ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <span className="text-4xl">{getEmoji(cat.name)}</span>
              )}
            </div>
            <p className="text-[11px] tracking-[1.5px] text-[#1a1a1a] font-medium text-center group-hover:text-[#c8a96e] transition-colors duration-300 font-['Montserrat']">
              {cat.name}
            </p>
          </div>
        ))}
  </div>
</section>

      {/* ── New Arrivals ── */}
      <section className="px-20 py-20 max-w-[1400px] mx-auto" id="new-products">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[4px] text-[#6b6b6b] font-medium mb-3 font-['Montserrat']">
            ✦ JUST DROPPED
          </p>
          <h2 className="font-['Cormorant_Garamond'] text-5xl font-light italic text-[#1a1a1a]">
            New Arrivals
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#ede9e3] aspect-[3/4] mb-4 rounded" />
                <div className="h-3 bg-[#ede9e3] rounded w-1/2 mb-2" />
                <div className="h-4 bg-[#ede9e3] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} navigate={navigate} />
            ))}
          </div>
        )}
      </section>

      {/* ── Banner Strip ── */}
      <section className="bg-[#1a1a1a] py-5">
        <div className="flex flex-wrap gap-16 justify-center px-10">
          {["Free Shipping Over ₹5000", "Easy Returns", "Authentic Products", "New Drops Weekly"].map((text) => (
            <span
              key={text}
              className="text-[10px] tracking-[2px] text-white/70 font-medium whitespace-nowrap font-['Montserrat']"
            >
              ✦ {text}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

export default New;