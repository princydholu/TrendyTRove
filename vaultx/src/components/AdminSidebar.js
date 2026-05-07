import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectIsDark } from "../redux/themeSlice";

const navItems = [
  {
    label: "Dashboard", path: "/dashboard",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    label: "Users", path: "/users",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    label: "Categories", path: "/categories",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  },
  {
    label: "Products", path: "/product",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>,
  },
  {
    label: "Orders", path: "/orders",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
  },
];

function AdminSidebar({ collapsed, setCollapsed }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { t }     = useTranslation();
  const isDark    = useSelector(selectIsDark);
  const [hovered, setHovered] = useState(false);

  const isOpen = !collapsed || hovered;

  const isActive = (itemPath) => {
    if (itemPath === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(itemPath);
  };

  // ── Theme colors ──
  const sidebarBg   = isDark
    ? "linear-gradient(180deg, #1a1a1a 0%, #2c2416 100%)"
    : "linear-gradient(180deg, #faf8f5 0%, #f0ece4 100%)";
  const textMuted   = isDark ? "#6b5a3e" : "#8b7355";
  const textFaint   = isDark ? "#3d2f1a" : "#b0926a";
  const borderColor = isDark ? "rgba(200,169,110,0.2)" : "rgba(200,169,110,0.35)";
  const hoverBg     = isDark ? "rgba(200,169,110,0.08)" : "rgba(200,169,110,0.12)";

  return (
    <aside
      onMouseEnter={() => collapsed && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: sidebarBg }}
      className={`
        h-screen flex flex-col shrink-0
        transition-[width,background] duration-300 ease-in-out
        border-r overflow-hidden z-40
        ${isOpen ? "w-56" : "w-16"}
      `}
      style={{ background: sidebarBg, borderColor }}
    >
      {/* ── Logo ── */}
      <div
        className={`flex items-center gap-3 px-3 py-5 border-b ${isOpen ? "justify-start" : "justify-center"}`}
        style={{ borderColor }}
      >
        <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded"
          style={{ background: "linear-gradient(135deg, #c8a96e, #a07840)" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "15px", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.5px" }}>
            TT
          </span>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "w-32 opacity-100" : "w-0 opacity-0"}`}>
          <div className="whitespace-nowrap flex flex-col leading-tight">
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "16px", fontWeight: 600, color: "#c8a96e", letterSpacing: "1px" }}>
              TrendyTrove
            </span>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "8px", letterSpacing: "3px", color: textMuted, textTransform: "uppercase" }}>
              Admin Panel
            </span>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 py-5 flex flex-col gap-0.5 px-2">
        {isOpen && (
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "8px", letterSpacing: "3px", color: textMuted, textTransform: "uppercase", padding: "0 12px 10px" }}>
            Navigation
          </p>
        )}
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <div key={item.path} className="relative group">
              <button
                onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 w-full text-left ${active ? "text-[#1a1a1a]" : ""}`}
                style={{
                  color: active ? "#1a1a1a" : textMuted,
                  background: active ? "linear-gradient(90deg, #c8a96e, #a07840)" : "",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = "#c8a96e"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = ""; e.currentTarget.style.color = textMuted; } }}
              >
                <span>{item.icon}</span>
                <span
                  style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "1.5px", fontWeight: 600, textTransform: "uppercase" }}
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "w-32 opacity-100" : "w-0 opacity-0"}`}
                >
                  {t(item.label)}
                </span>
              </button>

              {collapsed && !hovered && (
                <span
                  className="absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-lg z-50"
                  style={{ background: "#c8a96e", color: "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1px" }}
                >
                  {t(item.label)}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="border-t px-3 py-4" style={{ borderColor }}>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "8px", letterSpacing: "2px", color: textFaint, textAlign: isOpen ? "left" : "center" }}>
          {isOpen ? "© 2025 TrendyTrove" : "TT"}
        </p>
      </div>
    </aside>
  );
}

export default AdminSidebar;