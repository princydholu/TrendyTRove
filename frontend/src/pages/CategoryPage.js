import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import {
  addToWishlistLocal,
  removeFromWishlistLocal,
  selectIsWishlisted,
} from "../redux/slices/wishlistSlice";
import API from "../api/axios";


function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#ede9e3] aspect-[3/4] mb-4 rounded" />
      <div className="h-3 bg-[#ede9e3] rounded w-1/2 mb-2" />
      <div className="h-4 bg-[#ede9e3] rounded w-3/4" />
    </div>
  );
}

function ProductCard({ product, navigate }) {
  const dispatch     = useDispatch();
  const isWishlisted = useSelector(selectIsWishlisted(product._id));
  const [added, setAdded] = useState(false);

  const firstVariant  = product.variants?.[0];
  const firstSize     = firstVariant?.sizes?.[0];
  const image         = firstVariant?.images?.[0] || null;
  const price         = firstSize?.sellingPrice   || 0;
  const originalPrice = firstSize?.originalPrice  || null;
  const discount      = firstSize?.discount       || null;

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

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(
      addToCart({
        _id:       product._id,
        product:   product._id,
        variantId: firstVariant?._id || product._id,
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
      <div className="relative bg-[#f0ece6] aspect-[3/4] overflow-hidden mb-4 group-hover:shadow-xl transition-shadow duration-300">
        
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
       

        {discount && (
          <span className="absolute top-3 left-3 bg-[#1a1a1a] text-white text-[8px] tracking-[2px] font-semibold px-2 py-1 font-['Montserrat']">
            {discount}% OFF
          </span>
        )}

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

        {product.subCategory?.name && (
          <span className="absolute bottom-3 left-3 bg-white/80 text-[#1a1a1a] text-[7px] tracking-[1.5px] font-medium px-2 py-1 font-['Montserrat']">
            {product.subCategory.name}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-[9px] tracking-[2px] text-[#6b6b6b] font-medium uppercase font-['Montserrat']">
          {product.subCategory?.name || product.category?.name}
        </p>
        <h3 className="font-['Cormorant_Garamond'] text-lg font-normal text-[#1a1a1a] tracking-wide">
          {product.name}
        </h3>
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center gap-2">
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

// ── Main Page ────────────────────────────────────────────────────────────────
function CategoryPage() {
  const { category, subcategory } = useParams();
  const navigate = useNavigate();

  const [mainCat,      setMainCat]      = useState(null);
  const [subCat,       setSubCat]       = useState(null);
  const [subCats,      setSubCats]      = useState([]);
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("all");
  const [isSticky,     setIsSticky]     = useState(false);
  const sentinelRef = useRef(null);

  // ── Sticky observer ────────────────────────────────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [mainCat, subCat]);

  // ── Fetch categories ───────────────────────────────────────────────────────
  useEffect(() => {
    setActiveSubTab("all");
    setIsSticky(false);
    setProducts([]);
    setMainCat(null);
    setSubCat(null);
    setSubCats([]);

    API.get("/categories?limit=100")
      .then((res) => {
        const all = res.data.categories || [];

        // Find the level-1 main category matching URL slug
        const foundMain = all.find(
          (c) =>
            (c.level === 1 || c.level === "1" || c.level === "Main") &&
            c.name.toLowerCase().replace(/\s+/g, "-") === category
        );
        setMainCat(foundMain || null);

        if (foundMain) {
          // Get level-2 children of this main category
          const children = all.filter(
            (c) =>
              (c.level === 2 || c.level === "2" || c.level === "Child") &&
              (String(c.parentId) === String(foundMain._id) ||
                String(c.parent?._id) === String(foundMain._id))
          );

          if (subcategory) {
            // Find matching level-2 child
            const child = children.find(
              (c) => c.name.toLowerCase().replace(/\s+/g, "-") === subcategory
            );
            setSubCat(child || null);
            if (child) {
              // Get level-3 children of this subcategory
              const level3Subs = all.filter(
                (c) =>
                  (c.level === 3 || c.level === "3" || c.level === "Sub") &&
                  (String(c.parentId) === String(child._id) ||
                    String(c.parent?._id) === String(child._id))
              );
              setSubCats(level3Subs);
            } else {
              setSubCats([]);
            }
          } else {
            setSubCat(null);
            setSubCats(children);
          }
        }
      })
      .catch(console.error);
  }, [category, subcategory]);

  // ── Fetch products ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mainCat) return;
    setLoading(true);
    setProducts([]);

    if (subcategory && subCat) {
      // On subcategory page: fetch from level-3 children + the subCat itself
      const idsToFetch =
        subCats.length > 0
          ? [...subCats.map((s) => s._id), subCat._id]  // level-3 + level-2
          : [subCat._id];

      Promise.all(
        idsToFetch.map((id) =>
          API.get(`/products?category=${id}`)
            .then((res) => res.data.products || [])
            .catch(() => [])
        )
      )
        .then((results) => {
          const unique = Array.from(
            new Map(results.flat().map((p) => [p._id, p])).values()
          );
          setProducts(unique);
        })
        .finally(() => setLoading(false));

    } else if (subcategory && !subCat) {
      setLoading(false);

    } else {
      // On main category page: fetch from ALL level-2 + level-3 IDs
      if (subCats.length === 0) { setLoading(false); return; }

      API.get("/categories?limit=100")
        .then((res) => {
          const all = res.data.categories || [];

          // Collect all level-3 IDs under each level-2 child
          const level3Ids = [];
          subCats.forEach((child) => {
            all
              .filter(
                (c) =>
                  (c.level === 3 || c.level === "3" || c.level === "Sub") &&
                  (String(c.parentId) === String(child._id) ||
                    String(c.parent?._id) === String(child._id))
              )
              .forEach((s) => level3Ids.push(s._id));
          });

          // Always fetch BOTH level-2 (subCats) AND level-3 IDs
          const allIdsToFetch = [
            ...subCats.map((c) => c._id), // level-2 (b)
            ...level3Ids,                  // level-3 (c)
          ];

          return Promise.all(
            allIdsToFetch.map((id) =>
              API.get(`/products?category=${id}`)
                .then((r) => r.data.products || [])
                .catch(() => [])
            )
          );
        })
        .then((results) => {
          if (!results) return;
          const unique = Array.from(
            new Map(results.flat().map((p) => [p._id, p])).values()
          );
          setProducts(unique);
        })
        .finally(() => setLoading(false));
    }
  }, [mainCat, subCat, subCats, subcategory]);

  const displayedProducts =
    activeSubTab === "all"
      ? products
      : products.filter(
          (p) => String(p.category?._id || p.category) === String(activeSubTab)
        );

  const getSubPath = (subName) =>
    `/${category}/${subName.toLowerCase().replace(/\s+/g, "-")}`;
  const displayName  = subCat?.name  || mainCat?.name  || category;
  const displayImage = subCat?.image || mainCat?.image;
  const showSubTabs  = subcategory && subCats.length > 0;

  return (
    <div className="bg-[#faf8f5] min-h-screen">

      {/* ── Hero ── */}
      <section
        className="h-[45vh] flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2c2416 60%, #1a1a1a 100%)" }}
      >
        {displayImage && displayImage.startsWith("http") && (
          <img
            src={displayImage}
            alt={displayName}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="text-center text-white z-10 px-8">
          <p className="text-[9px] tracking-[6px] opacity-40 mb-3 font-['Montserrat']">
            {mainCat?.name?.toUpperCase()}
            {subCat ? ` / ${subCat.name.toUpperCase()}` : ""}
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-6xl font-light italic mb-4">
            {displayName}
          </h1>
          <div className="w-16 h-[1px] bg-[#c8a96e] mx-auto opacity-60" />
        </div>
      </section>

      {/* ── Sticky bar ── */}
      {showSubTabs && (
        <div
          className={`fixed top-0 left-0 right-0 z-40 bg-white transition-all duration-300 ${
            isSticky
              ? "translate-y-0 opacity-100 shadow-sm"
              : "-translate-y-full opacity-0 pointer-events-none"
          }`}
          style={{ borderBottom: "2px solid #f4c2c2" }}
        >
          <div className="max-w-[1400px] mx-auto px-20 flex items-center overflow-x-auto">
            <button
              onClick={() => setActiveSubTab("all")}
              className={`px-6 py-4 text-[10px] tracking-[2px] font-['Montserrat'] whitespace-nowrap transition-colors duration-200 ${
                activeSubTab === "all"
                  ? "text-[#1a1a1a] font-semibold border-b-2 border-[#1a1a1a] -mb-[2px]"
                  : "text-[#9b9b9b] font-medium"
              }`}
            >All</button>
            {subCats.map((sub) => (
              <button
                key={sub._id}
                onClick={() => setActiveSubTab(sub._id)}
                className={`px-6 py-4 text-[10px] tracking-[2px] font-['Montserrat'] whitespace-nowrap transition-colors duration-200 ${
                  activeSubTab === sub._id
                    ? "text-[#1a1a1a] font-semibold border-b-2 border-[#1a1a1a] -mb-[2px]"
                    : "text-[#9b9b9b] font-medium"
                }`}
              >{sub.name}</button>
            ))}
            <div className="ml-auto shrink-0 pl-8">
              <p className="text-[10px] tracking-[1px] text-[#9b9b9b] font-['Montserrat']">
                {loading ? "—" : `${displayedProducts.length} Products`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div className="max-w-[1400px] mx-auto px-20 pt-8 pb-2">
        <p className="text-[9px] tracking-[2px] text-[#b0a898] font-['Montserrat']">
          <span className="cursor-pointer hover:text-[#1a1a1a]" onClick={() => navigate("/")}>
            HOME
          </span>
          &nbsp;/&nbsp;
          <span
            className="cursor-pointer hover:text-[#1a1a1a]"
            onClick={() => navigate(`/${category}`)}
          >
            {mainCat?.name?.toUpperCase() || category.toUpperCase()}
          </span>
          {subCat && (
            <>&nbsp;/&nbsp;<span className="text-[#1a1a1a]">{subCat.name.toUpperCase()}</span></>
          )}
        </p>
      </div>

      {/* ── Circle pills — main category page (big, like Homedecore) ── */}
      {!subcategory && subCats.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-20 py-12">
          <div className="flex flex-wrap justify-center gap-10">
            {subCats.map((sub) => (
              <div
                key={sub._id}
                onClick={() => navigate(getSubPath(sub.name))}
                className="flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden border border-[#e8e4de] group-hover:border-[#c8a96e] group-hover:shadow-lg transition-all duration-300 bg-[#f0ece6] flex items-center justify-center">
                  
                    <img
                      src={sub.image}
                      alt={sub.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                 
                </div>
                <p className="text-[11px] tracking-[1.5px] text-[#1a1a1a] font-medium text-center group-hover:text-[#c8a96e] transition-colors duration-300 font-['Montserrat']">
                  {sub.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Inline tabs — subcategory page ── */}
      {showSubTabs && (
        <section className="bg-white" style={{ borderBottom: "2px solid #f4c2c2" }}>
          <div className="max-w-[1400px] mx-auto px-20 flex overflow-x-auto">
            <button
              onClick={() => setActiveSubTab("all")}
              className={`px-6 py-4 text-[10px] tracking-[2px] font-['Montserrat'] whitespace-nowrap transition-colors duration-200 ${
                activeSubTab === "all"
                  ? "text-[#1a1a1a] font-semibold border-b-2 border-[#1a1a1a] -mb-[2px]"
                  : "text-[#9b9b9b] font-medium"
              }`}
            >All</button>
            {subCats.map((sub) => (
              <button
                key={sub._id}
                onClick={() => setActiveSubTab(sub._id)}
                className={`px-6 py-4 text-[10px] tracking-[2px] font-['Montserrat'] whitespace-nowrap transition-colors duration-200 ${
                  activeSubTab === sub._id
                    ? "text-[#1a1a1a] font-semibold border-b-2 border-[#1a1a1a] -mb-[2px]"
                    : "text-[#9b9b9b] font-medium"
                }`}
              >{sub.name}</button>
            ))}
          </div>
        </section>
      )}

      <div ref={sentinelRef} className="h-0 w-full" />

      {/* ── Products Grid ── */}
      <section className="max-w-[1400px] mx-auto px-20 py-10">
        <div className="flex items-center gap-6 mb-10">
          <h2 className="font-['Cormorant_Garamond'] text-3xl text-[#1a1a1a] font-light">
            {loading ? "Loading..." : `${displayedProducts.length} Products`}
          </h2>
          <div className="flex-1 h-[1px] bg-[#e8e4de]" />
        </div>

        {loading && (
          <div className="grid grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && displayedProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="font-['Cormorant_Garamond'] text-4xl text-[#c8c0b4] italic mb-4">
              No products yet
            </p>
            <p className="text-[10px] tracking-[2px] text-[#b0a898] font-['Montserrat']">
              Check back soon
            </p>
          </div>
        )}

        {!loading && displayedProducts.length > 0 && (
          <div className="grid grid-cols-3 gap-8">
            {displayedProducts.map((product) => (
              <ProductCard key={product._id} product={product} navigate={navigate} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CategoryPage;