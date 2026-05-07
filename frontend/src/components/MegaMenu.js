import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../api/axios";

// ── image ──────────
const CATEGORY_IMAGES = {
  "home decor": "/image/homedecore.jpg",
  "candle":     "/image/candlemain.jpg",
  "lamps":      "/image/lampmain.jpg",
};

const getFallbackImage = (categoryName = "") => {
  const key = Object.keys(CATEGORY_IMAGES).find((k) =>
    categoryName.toLowerCase().includes(k)
  );
  return CATEGORY_IMAGES[key] ||
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80";
};

function MegaMenu({ activeMenu, allCategories }) {
  const [subCategories, setSubCategories] = useState([]);

  const activeCat = allCategories?.find((c) => c._id === activeMenu);

  useEffect(() => {
    if (!activeMenu) return;
    API.get("/categories?limit=100")
      .then((res) => {
        const all = res.data.categories || [];
        const subs = all.filter(
          (c) =>
            (c.level === 2 || c.level === "2" || c.level === "Sub" || c.level === "Child") &&
            (String(c.parentId) === String(activeMenu) ||
              String(c.parent?._id) === String(activeMenu))
        );
        setSubCategories(subs);
      })
      .catch(console.error);
  }, [activeMenu]);

  if (!activeCat) return null;

  const getCatPath = (name = "") =>
    `/${name.toLowerCase().replace(/\s+/g, "-")}`;
  const getSubPath = (parentName = "", subName = "") =>
    `/${parentName.toLowerCase().replace(/\s+/g, "-")}/${subName
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

  // Use admin-uploaded category image if available, else pick from map above
  const menuImage =
    activeCat.image && activeCat.image.startsWith("http")
      ? activeCat.image
      : getFallbackImage(activeCat.name);

  return (
    <div
      className="bg-white text-[#1a1a1a] border-t border-[#e8e8e8]"
      style={{ animation: "menuSlideDown 0.22s ease forwards" }}
    >
      <div className="max-w-6xl mx-auto px-12 py-10 flex gap-16 items-start">

        {/* ── Left: links ── */}
        <div className="min-w-[200px]">
          <p className="text-3xl font-light italic text-[#1a1a1a] mb-1 font-['Cormorant_Garamond']">
            {activeCat.name}
          </p>
          <div className="w-8 h-px bg-[#1a1a1a] mt-2 mb-6" />

          <p className="text-[9px] tracking-[2.5px] font-semibold text-[#b0a898] uppercase mb-3 font-['Montserrat']">
            CATEGORIES
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              to={getCatPath(activeCat.name)}
              className="no-underline text-[11px] tracking-[1.5px] text-[#1a1a1a] font-semibold hover:tracking-[2px] transition-all duration-300 w-fit font-['Montserrat']"
            >
              View All
            </Link>
            {subCategories.map((sub) => (
              <Link
                key={sub._id}
                to={getSubPath(activeCat.name, sub.name)}
                className="no-underline text-[11px] tracking-[1.5px] text-[#6b6b6b] hover:text-[#1a1a1a] hover:tracking-[2px] transition-all duration-300 w-fit font-['Montserrat']"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="w-px bg-[#e8e8e8] self-stretch" />

        {/* ── Right: static editorial image ── */}
        <div className="flex-1 flex justify-end">
          <div className="relative w-[280px] h-[320px] overflow-hidden group">
            <img
              src={menuImage}
              alt={activeCat.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Label overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-5 py-4">
              <p className="text-white text-[9px] tracking-[3px] font-['Montserrat'] font-medium">
                {activeCat.name.toUpperCase()} COLLECTION
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MegaMenu;