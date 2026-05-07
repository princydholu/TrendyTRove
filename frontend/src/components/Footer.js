import { useNavigate } from "react-router-dom";
import Logo from "./Logo";

// ── ScrollToTop: call this inside any component to auto-scroll on route change
export function useScrollToTop() {
  // Not needed here — we handle it manually on click
}

function Footer() {
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#1a1a1a] text-white font-['Montserrat',sans-serif]">
      {/* Top Grid */}
      <div className="grid grid-cols-5 gap-12 px-20 py-16 border-b border-white/10">

        {/* Brand */}
        <div className="flex flex-col gap-3">
          <Logo dark={false} />
          <p className="text-[13px] text-[#888] italic font-['Cormorant_Garamond'] mt-2">
            Carry your world in style.
          </p>
          <div className="flex gap-4 mt-2">
            {["IG", "FB", "TW", "PIN"].map((s) => (
              <a key={s} href="/" className="text-[10px] tracking-[1.5px] font-semibold text-[#888] hover:text-white transition-colors no-underline">
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] tracking-[3px] font-semibold text-white uppercase mb-2">Shop</h4>
          {[
            ["New Arrivals",      "/"],
            ["Vintage Jewellery", "/vintage-jewellery"],
            ["Candle",            "/candle"],
            ["Lamps",             "/lamps"],
            ["Home Décor",        "/homedecore"],   // fixed path
          ].map(([label, path]) => (
            <button
              key={label}
              onClick={() => handleNav(path)}
              className="bg-transparent border-none p-0 text-left text-[12px] text-[#888] hover:text-white transition-colors w-fit cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Help */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] tracking-[3px] font-semibold text-white uppercase mb-2">Help</h4>
          {[
            ["Shipping & Returns", "/"],
            ["Order Status",       "/"],
            ["Size Guide",         "/"],
            ["Contact Us",         "/"],
            ["FAQs",               "/"],
          ].map(([label, path]) => (
            <button
              key={label}
              onClick={() => handleNav(path)}
              className="bg-transparent border-none p-0 text-left text-[12px] text-[#888] hover:text-white transition-colors w-fit cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Company */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] tracking-[3px] font-semibold text-white uppercase mb-2">Company</h4>
          {[
            ["About Us",      "/"],
            ["Careers",       "/"],
            ["Press",         "/"],
            ["Sustainability","/"],
            ["Store Locator", "/"],
          ].map(([label, path]) => (
            <button
              key={label}
              onClick={() => handleNav(path)}
              className="bg-transparent border-none p-0 text-left text-[12px] text-[#888] hover:text-white transition-colors w-fit cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] tracking-[3px] font-semibold text-white uppercase mb-2">Stay in the Loop</h4>
          <p className="text-[11px] text-[#888] leading-relaxed">
            Get 15% off your first order when you sign up.
          </p>
          <div className="flex border-b border-[#444] mt-2">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-transparent border-none outline-none text-white text-[11px] tracking-wide py-2 flex-1 placeholder-[#555]"
            />
            <button className="bg-transparent border-none text-white text-lg cursor-pointer px-2 hover:translate-x-1 transition-transform">
              →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="flex justify-between items-center px-20 py-6">
        <p className="text-[10px] text-[#555] tracking-wide">© 2025 TrendyTrove. All rights reserved.</p>
        <div className="flex gap-6">
          {["Privacy Policy", "Terms of Service", "Accessibility"].map((item) => (
            <button
              key={item}
              onClick={() => handleNav("/")}
              className="bg-transparent border-none p-0 text-[10px] text-[#555] hover:text-white transition-colors tracking-wide cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;