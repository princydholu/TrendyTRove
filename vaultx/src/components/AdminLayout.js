import { useState } from "react";
import { useSelector } from "react-redux";
import { selectIsDark } from "../redux/themeSlice";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

function AdminLayout({ children }) {
  const isDark = useSelector(selectIsDark);
  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem("sidebarCollapsed") === "true"
  );

  const handleSetCollapsed = (value) => {
    setCollapsed(value);
    localStorage.setItem("sidebarCollapsed", value);
  };

  const bg = isDark ? "#111111" : "#f5f5f0";

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-300"
      style={{ background: bg }}>
      <AdminSidebar collapsed={collapsed} setCollapsed={handleSetCollapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader collapsed={collapsed} setCollapsed={handleSetCollapsed} />
        <main className="flex-1 overflow-y-auto transition-colors duration-300"
          style={{ background: bg }}>
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.3), transparent)" }} />
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;