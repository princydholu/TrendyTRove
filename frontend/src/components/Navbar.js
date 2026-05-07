import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCartItems } from "../redux/slices/cartSlice";
import { selectWishlistCount } from "../redux/slices/wishlistSlice";
import { logout } from "../redux/slices/authSlice";
import { setWishlist } from "../redux/slices/wishlistSlice";
import Logo from "./Logo";
import MegaMenu from "./MegaMenu";
import API from "../api/axios";

function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [activeMenu,   setActiveMenu]   = useState(null);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [navItems,     setNavItems]     = useState([]);
  const profileRef = useRef(null);

  const user          = useSelector((state) => state.auth.user);
  const cartItems     = useSelector(selectCartItems);
  const wishlistCount = useSelector(selectWishlistCount); //  wishlist count
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const location      = useLocation();

  // ── Fetch main categories for nav ─────────────────────────────────────────
  useEffect(() => {
    API.get("/categories?limit=100")
      .then((res) => {
        const all = res.data.categories || [];
        const mains = all.filter(
          (c) => c.level === 1 || c.level === "1" || c.level === "Main",
        );
        setNavItems(mains);
      })
      .catch(console.error);
  }, []);

  // ── Sync wishlist from backend when user logs in ───────────────────────────
  useEffect(() => {
    if (user) {
      API.get("/wishlist").then((res) =>
        dispatch(setWishlist(res.data.products || []))
      );
    }
  }, [user, dispatch]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate("/");
  };

  const isWhite = scrolled || activeMenu || location.pathname !== "/";

  const getCatPath = (name = "") =>
    `/${name.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isWhite
          ? "bg-white text-[#1a1a1a] shadow-sm"
          : "bg-transparent text-white"
      }`}
      onMouseLeave={() => setActiveMenu(null)}
    >
      {/* Announcement */}
      <div className="bg-[#1a1a1a] text-white text-center py-2 text-[10px] tracking-[2px] font-['Montserrat']">
        ✦ FREE SHIPPING ON ORDERS OVER ₹5000 &nbsp;✦&nbsp; NEW ARRIVALS ARE HERE ✦
      </div>

      {/* Main Row */}
      <div
        className={`flex items-center justify-between px-12 py-4 border-b transition-all duration-300 ${
          isWhite ? "border-[#e8e8e8]" : "border-white/20"
        }`}
      >
        {/* Left */}
        <Link
          to="#"
          className="flex items-center gap-1.5 text-[11px] tracking-[1.5px] font-medium no-underline text-inherit hover:opacity-70 font-['Montserrat']"
        >
          <span>◎</span> Stores
        </Link>

        {/* Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link to="/" className="no-underline">
            <Logo dark={isWhite} />
          </Link>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">

          {/* ── Wishlist icon with count badge ── */}
          <button
            onClick={() => navigate("/wishlist")}
            className="relative bg-transparent border-none cursor-pointer text-inherit p-1 hover:opacity-60"
            title="Wishlist"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {/* ✅ Count badge — only shows when wishlist has items */}
            {wishlistCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center font-['Montserrat'] ${
                  isWhite ? "bg-[#1a1a1a] text-white" : "bg-white text-[#1a1a1a]"
                }`}
              >
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => !user ? navigate("/login") : setProfileOpen(!profileOpen)}
              className="bg-transparent border-none cursor-pointer text-inherit p-1 hover:opacity-60"
            >
              {user ? (
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-['Montserrat'] ${
                    isWhite ? "bg-[#1a1a1a] text-white" : "bg-white text-[#1a1a1a]"
                  }`}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </button>

            {user && profileOpen && (
              <div className="absolute right-0 top-full mt-3 w-52 bg-white border border-[#e8e8e8] shadow-lg z-50">
                <div className="px-5 py-4 border-b border-[#e8e8e8]">
                  <p className="text-[14px] font-semibold text-[#1a1a1a] truncate font-['Cormorant_Garamond']">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-[#6b6b6b] tracking-wide truncate mt-0.5 font-['Montserrat']">
                    {user.email}
                  </p>
                </div>
                <div className="py-2">
                  {[
                    { to: "/wishlist",     label: "My Wishlist" },
                    { to: "/orders",     label: "My orders" },
                    { to: "/editprofile",  label: "Edit Profile" },
                  ].map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setProfileOpen(false)}
                      className="no-underline flex items-center px-5 py-2.5 text-[11px] tracking-[1px] text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-[#faf8f5] transition-all font-['Montserrat']"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-[#e8e8e8] py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-5 py-2.5 text-[11px] tracking-[1px] text-red-400 hover:text-red-600 hover:bg-red-50 transition-all bg-transparent border-none cursor-pointer font-['Montserrat']"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={() => navigate("/cart")}
            className="relative bg-transparent border-none cursor-pointer text-inherit p-1 hover:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartItems.length > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center font-['Montserrat'] ${
                  isWhite ? "bg-[#1a1a1a] text-white" : "bg-white text-[#1a1a1a]"
                }`}
              >
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex justify-center gap-10 px-12 py-3">
        {/* NEW — hardcoded first */}
        <div className="relative group" onMouseEnter={() => setActiveMenu(null)}>
          <Link
            to="/"
            className="no-underline text-inherit text-[11px] tracking-[2px] font-medium pb-1 relative inline-block font-['Montserrat']"
          >
            NEW
            <span className="absolute bottom-0 left-0 right-0 h-px bg-current transition-transform duration-300 scale-x-0 group-hover:scale-x-100" />
          </Link>
        </div>

        {/* Dynamic main categories */}
        {navItems.map((cat) => (
          <div
            key={cat._id}
            className="relative group"
            onMouseEnter={() => setActiveMenu(cat._id)}
          >
            <Link
              to={getCatPath(cat.name)}
              className="no-underline text-inherit text-[11px] tracking-[2px] font-medium pb-1 relative inline-block font-['Montserrat']"
            >
              {cat.name.toUpperCase()}
              <span
                className={`absolute bottom-0 left-0 right-0 h-px bg-current transition-transform duration-300 ${
                  activeMenu === cat._id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          </div>
        ))}
      </div>

      {/* MegaMenu */}
      {activeMenu && (
        <MegaMenu activeMenu={activeMenu} allCategories={navItems} />
      )}
    </nav>
  );
}

export default Navbar;