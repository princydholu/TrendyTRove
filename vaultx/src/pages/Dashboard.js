import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import API from "../api/axios";

function Dashboard() {
  const user  = useSelector((state) => state.auth.user);
  const { t } = useTranslation();

  const [userCount,      setUserCount]      = useState(null);
  const [userLoading,    setUserLoading]    = useState(true);
  const [productCount,   setProductCount]   = useState(null);
  const [productLoading, setProductLoading] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const res = await API.get("/users?limit=100");
        const users = res.data.users ?? res.data.data ?? res.data ?? [];
        setUserCount(Array.isArray(users) ? users.length : 0);
      } catch {
        setUserCount("—");
      } finally {
        setUserLoading(false);
      }
    };
    fetchUserCount();
  }, []);

  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const res = await API.get("/products/admin/all");
        const products = res.data.products ?? res.data.data ?? res.data ?? [];
        setProductCount(Array.isArray(products) ? products.length : 0);
      } catch {
        setProductCount("—");
      } finally {
        setProductLoading(false);
      }
    };
    fetchProductCount();
  }, []);

  const stats = [
    {
      label: t("totalUsers"),
      value: userCount,
      loading: userLoading,
      note: "↑ 12% this week",
      noteColor: "#4ade80",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: t("totalProducts"),
      value: productCount,
      loading: productLoading,
      note: "↑ live count",
      noteColor: "#c8a96e",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        </svg>
      ),
    },
    {
      label: t("loggedInAs"),
      value: user?.name,
      sub: user?.email,
      loading: false,
      note: "Administrator",
      noteColor: "#c8a96e",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "32px 24px" }}>

      {/* ── Welcome Banner ── */}
      <div
        className="rounded-2xl p-8 mb-8 relative overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)"
 }}
      >
        {/* decorative circles */}
        <div className="absolute top-[-40px] right-[-40px] w-[180px] h-[180px] rounded-full border border-white opacity-[0.03]" />
        <div className="absolute bottom-[-60px] right-[100px] w-[150px] h-[150px] rounded-full border border-[#c8a96e] opacity-[0.06]" />

        <div className="relative z-10">
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "4px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "8px" }}>
            ✦ ADMIN DASHBOARD
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "36px", fontWeight: 300, color: "var(--text-primary)", fontStyle: "italic", marginBottom: "6px" }}>
            {t("welcome back")},{" "}
            <span style={{ color: "#c8a96e" }}>{user?.name}</span>
          </h1>
          <div style={{ width: "48px", height: "1px", background: "#c8a96e", opacity: 0.5, marginBottom: "10px" }} />
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "1px", color: "var(--text-faint)" }}>
            {t("overview")}
          </p>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-xl p-6 relative overflow-hidden"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            {/* top-right icon */}
            <div
              className="absolute top-4 right-4 w-9 h-9 rounded flex items-center justify-center"
              style={{ background: "rgba(200,169,110,0.1)", color: "#c8a96e" }}
            >
              {stat.icon}
            </div>

            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "3px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "12px" }}>
              {stat.label}
            </p>

            {stat.loading ? (
              <div className="w-16 h-9 rounded animate-pulse" style={{ background: "rgba(200,169,110,0.1)" }} />
            ) : (
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "38px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1 }}>
                {stat.value}
              </p>
            )}

            {stat.sub && (
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", color: "#3d2f1a", marginTop: "4px", letterSpacing: "0.5px" }} className="truncate">
                {stat.sub}
              </p>
            )}

            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", color: stat.noteColor, marginTop: "10px", letterSpacing: "0.5px" }}>
              {stat.note}
            </p>

            {/* bottom gold line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.3), transparent)" }} />
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div
        className="rounded-xl p-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "3px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "16px" }}>
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Add Product",  path: "/admin/product/add" },
            { label: "View Category", path: "/admin/categories" },
            { label: "View Orders",  path: "/admin/orders" },
            { label: "View Products",   path: "/admin/product" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.path}
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "10px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#c8a96e",
                border: "1px solid rgba(200,169,110,0.3)",
                padding: "8px 20px",
                borderRadius: "4px",
                textDecoration: "none",
                transition: "all 0.3s",
                display: "inline-block",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#c8a96e"; e.currentTarget.style.color = "#1a1a1a"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#c8a96e"; }}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;