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
  if (n.includes("jewel")) return "💍";
  if (n.includes("mirror")) return "🪞";
  if (n.includes("lamp")) return "🪔";
  if (n.includes("wall")) return "🖼️";
  if (n.includes("bag")) return "👜";
  if (n.includes("candle")) return "🕯️";
  if (n.includes("vase")) return "🪴";
  return "🏠";
};

// ── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ product, navigate }) {
  const dispatch = useDispatch();
  const isWishlisted = useSelector(selectIsWishlisted(product._id));
  const [added, setAdded] = useState(false);
  const [avgRating, setAvgRating] = useState(0);

  const firstVariant = product.variants?.[0];
  const firstSize = firstVariant?.sizes?.[0];
  const image =
    firstVariant?.images?.[0] || product.colorGroups?.[0]?.images?.[0] || null;
  const price = firstSize?.sellingPrice || product.price || 0;
  const originalPrice =
    firstSize?.originalPrice || product.originalPrice || null;
  const discount = firstSize?.discount || product.discount || null;

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

  useEffect(() => {
    API.get(`/reviews/${product._id}`)
      .then((res) => setAvgRating(res.data.avgRating || 0))
      .catch(() => {});
  }, [product._id]);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(
      addToCart({
        _id: product._id,
        product: product._id,
        variantId: firstVariant?._id || product._id,
        name: product.name,
        price,
        image: image || "",
        size: firstSize?.size || "Free Size",
        color: firstVariant?.color || "",
        quantity: 1,
      }),
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
          <span className="font-['Cormorant_Garamond'] text-5xl text-[#e8e8e8]">
            ♠
          </span>
        )}
        <span className="absolute top-3 left-3 bg-[#1a1a1a] text-white text-[8px] tracking-[2px] font-semibold px-2 py-1 font-['Montserrat']">
          {discount ? `${discount}% OFF` : "NEW"}
        </span>
        <button
          onClick={handleWishlist}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all duration-300 ${isWishlisted ? "bg-red-50" : "bg-white/80 hover:bg-white"}`}
        >
          <svg
            className={`w-4 h-4 transition-colors duration-300 ${isWishlisted ? "text-red-500" : "text-[#9b9b9b]"}`}
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
        {avgRating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg
                key={s}
                className={`w-3 h-3 ${s <= Math.round(avgRating) ? "text-[#c8a96e]" : "text-[#e8e4de]"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-[9px] text-[#9b9b9b] font-['Montserrat']">
              {avgRating}
            </span>
          </div>
        )}
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
          <button
            onClick={handleAddToCart}
            className={`text-[9px] tracking-[1.5px] font-semibold px-4 py-1.5 font-['Montserrat'] transition-all duration-300 ${added ? "bg-green-600 text-white border border-green-600" : "border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"}`}
          >
            {added ? "✓ Added" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reviews Section ──────────────────────────────────────────────────────────
function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [productId, setProductId] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const user = useSelector((state) => state.auth.user);

  const fetchReviews = () => {
    setLoading(true);
    API.get("/reviews/admin/all")
      .then((res) => setReviews((res.data.reviews || []).slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
    API.get("/products?limit=100")
      .then((res) => setAllProducts(res.data.products || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!productId) {
      setError("Please select a product");
      return;
    }
    if (!myRating) {
      setError("Please select a rating");
      return;
    }
    if (!myComment.trim()) {
      setError("Please write a comment");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await API.post("/reviews", {
        productId,
        rating: myRating,
        comment: myComment,
      });
      setSuccess("Review submitted! ✓");
      setMyRating(0);
      setMyComment("");
      setProductId("");
      fetchReviews();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Write Review Form */}
      {user ? (
        <div className="bg-[#faf8f5] border border-[#e8e4de] p-8 mb-12 max-w-2xl mx-auto">
          <h3 className="text-[10px] tracking-[3px] font-semibold font-['Montserrat'] text-[#1a1a1a] mb-6">
            WRITE A REVIEW
          </h3>

          {/* Product Select */}
          <div className="mb-4">
            <p className="text-[9px] tracking-[2px] text-[#9b9b9b] font-['Montserrat'] mb-2">
              SELECT PRODUCT *
            </p>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border border-[#e8e4de] px-4 py-3 text-[12px] font-['Montserrat'] text-[#1a1a1a] outline-none focus:border-[#1a1a1a] bg-white"
            >
              <option value="">-- Select a product --</option>
              {allProducts
                .filter(
                  (p, index, self) =>
                    index === self.findIndex((t) => t.name === p.name),
                )
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Star Rating */}
          <div className="mb-4">
            <p className="text-[9px] tracking-[2px] text-[#9b9b9b] font-['Montserrat'] mb-2">
              RATING *
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setMyRating(s)}>
                  <svg
                    className={`w-7 h-7 transition-colors ${s <= myRating ? "text-[#c8a96e]" : "text-[#e8e4de] hover:text-[#c8a96e]"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <p className="text-[9px] tracking-[2px] text-[#9b9b9b] font-['Montserrat'] mb-2">
              COMMENT *
            </p>
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              rows={3}
              placeholder="Share your experience..."
              className="w-full border border-[#e8e4de] px-4 py-3 text-[12px] font-['Montserrat'] text-[#1a1a1a] outline-none resize-none focus:border-[#1a1a1a]"
            />
          </div>

          {error && (
            <p className="text-red-400 text-[11px] font-['Montserrat'] mb-3">
              {error}
            </p>
          )}
          {success && (
            <p className="text-emerald-500 text-[11px] font-['Montserrat'] mb-3">
              {success}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-[#1a1a1a] text-white text-[10px] tracking-[3px] font-semibold font-['Montserrat'] hover:bg-[#3d3020] transition-all disabled:opacity-50"
          >
            {submitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
          </button>
        </div>
      ) : (
        <div className="text-center mb-12">
          <p className="text-[12px] text-[#9b9b9b] font-['Montserrat'] italic mb-3">
            Login to write a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-[#faf8f5] p-6">
              <div className="h-3 bg-[#ede9e3] rounded w-1/3 mb-3" />
              <div className="h-4 bg-[#ede9e3] rounded w-full mb-2" />
              <div className="h-4 bg-[#ede9e3] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-[12px] text-[#9b9b9b] font-['Montserrat'] italic">
          No reviews yet. Be the first!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="bg-[#faf8f5] border border-[#e8e4de] p-6"
            >
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= r.rating ? "text-[#c8a96e]" : "text-[#e8e4de]"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="font-['Cormorant_Garamond'] text-lg text-[#1a1a1a] leading-relaxed mb-4 italic">
                "{r.comment}"
              </p>
              <div className="flex items-center gap-3 border-t border-[#e8e4de] pt-4">
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-[10px] font-semibold font-['Montserrat'] shrink-0">
                  {r.user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#1a1a1a] font-['Montserrat']">
                    {r.user?.name}
                  </p>
                  <p className="text-[9px] text-[#9b9b9b] font-['Montserrat']">
                    {r.product?.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
function New() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    API.get("/categories?limit=100")
      .then((res) => {
        const all = res.data.categories || [];
        setCategories(
          all.filter(
            (c) => c.level === 1 || c.level === "1" || c.level === "Main",
          ),
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
        style={{
          background:
            "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 40%, #3d3020 100%)",
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source
            src="/White Clean Video-centric Accessories Review Fashion 169 Video (1).mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(ellipse at 70% 50%, rgba(184,134,11,0.15) 0%, transparent 60%)",
          }}
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
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 animate-pulse"
                >
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
              <ProductCard
                key={product._id}
                product={product}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Customer Reviews ── */}
      <section className="px-20 py-16 bg-white border-t border-[#e8e4de]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] tracking-[4px] text-[#6b6b6b] font-medium mb-3 font-['Montserrat']">
              ✦ WHAT OUR CUSTOMERS SAY
            </p>
            <h2 className="font-['Cormorant_Garamond'] text-5xl font-light italic text-[#1a1a1a]">
              Customer Reviews
            </h2>
          </div>
          <ReviewsSection />
        </div>
      </section>

      {/* ── Banner Strip ── */}
      <section className="bg-[#1a1a1a] py-5">
        <div className="flex flex-wrap gap-16 justify-center px-10">
          {[
            "Free Shipping Over ₹1000",
            "Easy Returns",
            "Authentic Products",
            "New Drops Weekly",
          ].map((text) => (
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
