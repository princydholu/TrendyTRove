import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { toggleTheme, selectIsDark } from "../redux/themeSlice";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "hi", label: "Hindi",   flag: "🇮🇳" },
  { code: "gu", label: "Gujarati",flag: "🇮🇳" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French",  flag: "🇫🇷" },
];

function AdminHeader({ collapsed, setCollapsed }) {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const isDark      = useSelector(selectIsDark);
  const user        = useSelector((state) => state.auth.user);
  const { t, i18n } = useTranslation();

  const [showProfile, setShowProfile] = useState(false);
  const [showLang,    setShowLang]    = useState(false);
  const [activeLang,  setActiveLang]  = useState(languages[0]);

  const profileRef = useRef(null);
  const langRef    = useRef(null);

  // ── Theme colors ──
  const headerBg    = isDark ? "#1a1a1a" : "#faf8f5";
  const dropdownBg  = isDark ? "#1a1a1a" : "#faf8f5";
  const borderColor = isDark ? "rgba(200,169,110,0.2)" : "rgba(200,169,110,0.35)";
  const textMuted   = isDark ? "#6b5a3e" : "#8b7355";
  const textFaint   = isDark ? "#3d2f1a" : "#b0926a";

  const getInitials = (name) => {
    if (!name) return "A";
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current    && !langRef.current.contains(e.target))    setShowLang(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => { dispatch(logout()); navigate("/login"); };
  const handleLangChange = (lang) => { setActiveLang(lang); setShowLang(false); i18n.changeLanguage(lang.code); };

  return (
    <header
      className="w-full h-16 flex items-center justify-between px-6 sticky top-0 z-50 border-b transition-colors duration-300"
      style={{ background: headerBg, borderColor }}
    >
      {/* ── Left ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex flex-col justify-center items-center gap-[5px] w-9 h-9 rounded transition-colors"
          style={{ color: textMuted }}
          onMouseEnter={e => e.currentTarget.style.color = "#c8a96e"}
          onMouseLeave={e => e.currentTarget.style.color = textMuted}
        >
          <span className="block h-[1.5px] w-5 bg-current rounded-full transition-all duration-300" />
          <span className={`block h-[1.5px] bg-current rounded-full transition-all duration-300 ${collapsed ? "w-3" : "w-5"}`} />
          <span className={`block h-[1.5px] bg-current rounded-full transition-all duration-300 ${collapsed ? "w-4" : "w-5"}`} />
        </button>
        <div className="hidden md:flex items-center gap-2">
          <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "3px", color: textFaint, textTransform: "uppercase" }}>TrendyTrove</span>
          <span style={{ color: textFaint }}>/</span>
          <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "3px", color: "#c8a96e", textTransform: "uppercase" }}>Admin</span>
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-3">

        {/* Language */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => { setShowLang(!showLang); setShowProfile(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors border"
            style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1px", color: textMuted, borderColor, background: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#c8a96e"; e.currentTarget.style.borderColor = "#c8a96e"; }}
            onMouseLeave={e => { e.currentTarget.style.color = textMuted; e.currentTarget.style.borderColor = borderColor; }}
          >
            🌐 {activeLang.flag} {activeLang.label}
          </button>
          {showLang && (
            <div className="absolute right-0 top-11 w-44 rounded overflow-hidden border z-50 shadow-2xl"
              style={{ background: dropdownBg, borderColor }}>
              {languages.map((lang) => (
                <button key={lang.code} onClick={() => handleLangChange(lang)}
                  className="w-full text-left px-4 py-2.5 flex gap-2 transition-colors"
                  style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "1px",
                    color: activeLang.code === lang.code ? "#c8a96e" : textMuted,
                    background: activeLang.code === lang.code ? "rgba(200,169,110,0.08)" : "transparent" }}
                  onMouseEnter={e => { if (activeLang.code !== lang.code) e.currentTarget.style.color = "#c8a96e"; }}
                  onMouseLeave={e => { if (activeLang.code !== lang.code) e.currentTarget.style.color = textMuted; }}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 🌙 Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300"
          style={{ borderColor, background: isDark ? "rgba(200,169,110,0.08)" : "rgba(200,169,110,0.15)", color: "#c8a96e" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#c8a96e"}
          onMouseLeave={e => e.currentTarget.style.borderColor = borderColor}
          title={isDark ? "Switch to Light" : "Switch to Dark"}
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>

        <div className="w-px h-5" style={{ background: borderColor }} />

        {/* View Store */}
        <button onClick={() => navigate("/")}
          className="px-3 py-1.5 rounded border transition-all duration-300"
          style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "2px", color: "#c8a96e", borderColor: "#c8a96e", background: "transparent", textTransform: "uppercase" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#c8a96e"; e.currentTarget.style.color = "#1a1a1a"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#c8a96e"; }}
        >
          View Store
        </button>

        <div className="w-px h-5" style={{ background: borderColor }} />

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowLang(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded transition-colors"
            onMouseEnter={e => e.currentTarget.style.background = "rgba(200,169,110,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div className="w-7 h-7 rounded flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #c8a96e, #a07840)" }}>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", fontWeight: 700, color: "#1a1a1a" }}>
                {getInitials(user?.name)}
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", fontWeight: 600, color: "#c8a96e", letterSpacing: "0.5px" }}>
                {user?.name || "Admin"}
              </span>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "8px", letterSpacing: "2px", color: textFaint, textTransform: "uppercase" }}>
                Administrator
              </span>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-56 rounded overflow-hidden border z-50 shadow-2xl"
              style={{ background: dropdownBg, borderColor }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(200,169,110,0.15)" }}>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "16px", color: "#c8a96e", fontStyle: "italic" }}>
                  {user?.name || "Admin"}
                </p>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1px", color: textFaint, marginTop: "2px" }}>
                  {user?.email || ""}
                </p>
              </div>
              <button onClick={() => { navigate("/editprofile"); setShowProfile(false); }}
                className="w-full text-left px-4 py-3 transition-colors border-b"
                style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1.5px", color: textMuted, textTransform: "uppercase", borderColor: "rgba(200,169,110,0.1)", background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#c8a96e"; e.currentTarget.style.background = "rgba(200,169,110,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = textMuted; e.currentTarget.style.background = "transparent"; }}
              >
                {t("editProfile")}
              </button>
              <button onClick={handleLogout}
                className="w-full text-left px-4 py-3 transition-colors"
                style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1.5px", color: "#8b3a3a", textTransform: "uppercase", background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#c0392b"; e.currentTarget.style.background = "rgba(192,57,43,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#8b3a3a"; e.currentTarget.style.background = "transparent"; }}
              >
                {t("logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;