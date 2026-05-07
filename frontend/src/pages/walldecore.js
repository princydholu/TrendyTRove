import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import API from "../api/axios";

function SkeletonCard() {
  return (
    <div className="group cursor-pointer animate-pulse">
      <div className="bg-[#ede9e3] aspect-[3/4] mb-4" />
      <div className="h-2 bg-[#ede9e3] rounded w-3/4 mb-2" />
      <div className="h-4 bg-[#ede9e3] rounded w-full mb-3" />
      <div className="flex justify-between">
        <div className="h-3 bg-[#ede9e3] rounded w-1/4" />
        <div className="h-6 bg-[#ede9e3] rounded w-16" />
      </div>
    </div>
  );
}

function Walldecore() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("all");
  const [subCats,   setSubCats]   = useState([]);
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    API.get("/categories?limit=100")
      .then((res) => {
        const all = res.data.categories || [];

        // Level 2 "wall decor" dhundo
        const wallDecor =
          all.find(
            (c) =>
              (c.level === 2 || c.level === "2" || c.level === "Child") &&
              c.name.toLowerCase().includes("wall")
          );

        if (!wallDecor) {
          setLoading(false);
          return;
        }

        // Level 3 subs under wallDecor
        const level3Subs = all.filter(
          (c) =>
            (c.level === 3 || c.level === "3" || c.level === "Sub") &&
            (String(c.parentId) === String(wallDecor._id) ||
              String(c.parent?._id) === String(wallDecor._id))
        );
        setSubCats(level3Subs);

        //  Fetch karo — Level 3 hai to unse, nahi to wallDecor se directly
        const idsToFetch =
          level3Subs.length > 0
            ? level3Subs.map((s) => s._id)
            : [wallDecor._id];

        setLoading(true);
        Promise.all(
          idsToFetch.map((id) =>
            API.get(`/products?category=${id}`)
              .then((r) => r.data.products || [])
              .catch(() => [])
          )
        )
          .then((results) => {
            const allProducts = results.flat();
            const unique = Array.from(
              new Map(allProducts.map((p) => [p._id, p])).values()
            );
            setProducts(unique);
          })
          .finally(() => setLoading(false));
      })
      .catch(() => setLoading(false));
  }, []);

  // ✅ category._id se filter karo — subCategory nahi
  const filtered =
    activeTab === "all"
      ? products
      : products.filter(
          (p) =>
            String(p.category?._id || p.category) === String(activeTab)
        );

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const firstVariant = product.variants?.[0];
    const firstSize    = firstVariant?.sizes?.[0];
    dispatch(
      addToCart({
        _id:      product._id,
        product:  product._id,
        name:     product.name,
        price:    firstSize?.sellingPrice || 0,
        image:    firstVariant?.images?.[0] || "",
        size:     firstSize?.size || "",
        color:    firstVariant?.color || "",
        quantity: 1,
      })
    );
  };

  return (
    <div className="bg-[#faf8f5] min-h-screen">

      {/* Hero */}
      <section
        className="h-[45vh] flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #2b2416 0%, #1a1a1a 50%, #3b2f1e 100%)" }}
      >
        <div className="text-center text-white z-10">
          <p className="text-[9px] tracking-[5px] opacity-50 mb-3 font-['Montserrat']">HOME DECOR / WALL DECOR</p>
          <h1 className="font-['Cormorant_Garamond'] text-7xl font-light italic mb-4">Wall Décor</h1>
          <p className="text-[11px] tracking-[2px] opacity-40 font-['Montserrat']">Transform your walls into art</p>
        </div>
      </section>

      {/* Filter Tabs */}
      {subCats.length > 0 && (
        <section className="sticky top-0 z-20 bg-white" style={{ borderBottom: "2px solid #f4c2c2" }}>
          <div className="max-w-[1400px] mx-auto px-20 flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-4 text-[10px] tracking-[2px] font-['Montserrat'] whitespace-nowrap transition-colors duration-200 ${
                activeTab === "all"
                  ? "text-[#1a1a1a] font-semibold border-b-2 border-[#1a1a1a] -mb-[2px]"
                  : "text-[#9b9b9b] font-medium"
              }`}
            >
              All
            </button>
            {subCats.map((sub) => (
              <button
                key={sub._id}
                onClick={() => setActiveTab(sub._id)}
                className={`px-6 py-4 text-[10px] tracking-[2px] font-['Montserrat'] whitespace-nowrap transition-colors duration-200 ${
                  activeTab === sub._id
                    ? "text-[#1a1a1a] font-semibold border-b-2 border-[#1a1a1a] -mb-[2px]"
                    : "text-[#9b9b9b] font-medium"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section className="px-20 py-16 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-6 mb-10">
          <h2 className="font-['Cormorant_Garamond'] text-3xl text-[#1a1a1a] font-light">
            {loading ? "Loading..." : `${filtered.length} Products`}
          </h2>
          <div className="flex-1 h-[1px] bg-[#e8e4de]" />
        </div>

        {loading && (
          <div className="grid grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-['Cormorant_Garamond'] text-4xl text-[#c8c0b4] italic mb-4">No products found</p>
            <p className="text-[10px] tracking-[2px] text-[#9b9b9b] font-['Montserrat']">Check back soon</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-8">
            {filtered.map((product) => {
              const image         = product.variants?.[0]?.images?.[0] || null;
              const price         = product.variants?.[0]?.sizes?.[0]?.sellingPrice || 0;
              const originalPrice = product.variants?.[0]?.sizes?.[0]?.originalPrice || null;
              const discount      = product.variants?.[0]?.sizes?.[0]?.discount || null;

              return (
                <div
                  key={product._id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="relative bg-[#f0ece6] aspect-[3/4] overflow-hidden mb-4 group-hover:shadow-lg transition-all duration-300">
                    {image ? (
                      <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl opacity-20">🖼️</span>
                      </div>
                    )}
                    {discount && (
                      <span className="absolute top-3 left-3 bg-[#1a1a1a] text-white text-[8px] tracking-[2px] font-semibold px-2 py-1 font-['Montserrat']">
                        {discount}% OFF
                      </span>
                    )}
                    {/* ✅ category name dikhao */}
                    {product.category?.name && (
                      <span className="absolute bottom-3 left-3 bg-white/80 text-[#1a1a1a] text-[7px] tracking-[1.5px] font-medium px-2 py-1 font-['Montserrat']">
                        {product.category.name}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[9px] tracking-[2px] text-[#6b6b6b] font-medium uppercase font-['Montserrat']">
                      {product.category?.name}
                    </p>
                    <h3 className="font-['Cormorant_Garamond'] text-lg text-[#1a1a1a] tracking-wide leading-snug">
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
                        onClick={(e) => handleAddToCart(e, product)}
                        className="border border-[#1a1a1a] text-[#1a1a1a] text-[9px] tracking-[1.5px] font-semibold px-4 py-1.5 hover:bg-[#1a1a1a] hover:text-white transition-all duration-300 font-['Montserrat']"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Walldecore;