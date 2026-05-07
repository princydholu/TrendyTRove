// ============================================================
// AdminProducts.jsx  — TrendyTrove dark/gold theme
// ============================================================
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const getDisplayPrice = (product) => { if (product.variants?.length > 0) { const p = product.variants[0]?.sizes?.[0]?.sellingPrice; if (p) return Number(p); } if (product.price) return Number(product.price); return null; };
const getThumbImage  = (product) => { if (product.variants?.length > 0) { const img = product.variants[0]?.images?.[0]; if (img) return typeof img === "string" ? img : img.url; } if (product.colorGroups?.length > 0) return product.colorGroups[0]?.images?.[0] || null; if (product.images?.length > 0) return product.images[0]; return null; };

const validateSearch = (value) => {
  if (value.length > 100)         return "Search query is too long (max 100 characters).";
  if (value.trim().length === 1)  return "Enter at least 2 characters to search.";
  if (/[<>{}[\]\\]/.test(value))  return "Search contains invalid characters.";
  return "";
};

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [search, setSearch]             = useState("");
  const [searchError, setSearchError]   = useState("");
  const [searchTouched, setSearchTouched] = useState(false);
  const [toast, setToast]               = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchProducts = useCallback(async () => { setLoading(true); try { const res = await API.get("/products/admin/all"); setProducts(res.data.products || []); } catch { showToast("Failed to load products", "error"); } finally { setLoading(false); } }, []);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [search, pageSize, statusFilter]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const handleDelete = async () => { try { await API.delete(`/products/${deleteTarget._id}`); showToast("Product deleted!"); setDeleteTarget(null); fetchProducts(); } catch (err) { showToast(err.response?.data?.message || "Delete failed", "error"); } };

  const filtered = !searchError ? products.filter((p) => {
    const ms = p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.name?.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "All" ? true : statusFilter === "Active" ? p.isActive : !p.isActive;
    return ms && mf;
  }) : products;

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push("..."); acc.push(p); return acc; }, []);

  const S = { label: { fontFamily: "Montserrat, sans-serif", fontSize: "8px", letterSpacing: "2px", color: "#3d2f1a", textTransform: "uppercase", fontWeight: 700 } };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "3px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "6px" }}>ADMIN / PRODUCTS</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "32px", color: "var(--text-primary)", fontWeight: 300, fontStyle: "italic", margin: 0 }}>All Products</h1>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", color: "var(--text-faint)", marginTop: "4px" }}>{products.length} total products</p>
        </div>
        <button onClick={() => navigate("/product/add")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "6px", border: "none", background: "linear-gradient(135deg, #c8a96e, #a07840)", color: "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, cursor: "pointer" }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: "200px", maxWidth: "320px" }}>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: searchError ? "#c0392b" : "#6b5a3e" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={(e) => { setSearch(e.target.value); if (searchTouched) setSearchError(validateSearch(e.target.value)); }} onBlur={() => { setSearchTouched(true); setSearchError(validateSearch(search)); }} placeholder="Search by name or category..." maxLength={101}
              style={{ width: "100%", background: searchError ? "rgba(192,57,43,0.05)" : "rgba(255,255,255,0.04)", border: `1px solid ${searchError ? "#c0392b" : "rgba(200,169,110,0.2)"}`, borderRadius: "6px", paddingLeft: "36px", paddingRight: search ? "32px" : "14px", paddingTop: "10px", paddingBottom: "10px", color: searchError ? "#c0392b" : "#fff", fontSize: "12px", outline: "none", fontFamily: "Montserrat, sans-serif", boxSizing: "border-box" }}
              onFocus={e => { if (!searchError) e.target.style.borderColor = "#c8a96e"; }} onBlur_={() => {}} />
            {search && <button onClick={() => { setSearch(""); setSearchError(""); setSearchTouched(false); }} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: "14px" }}>✕</button>}
          </div>
          {searchError && <p style={{ color: "#c0392b", fontSize: "11px", marginTop: "4px", fontFamily: "Montserrat, sans-serif" }}>⚠ {searchError}</p>}
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", background: "var(--bg-input)", border: "1px solid rgba(200,169,110,0.2)", borderRadius: "6px", padding: "4px" }}>
          {["All", "Active", "Inactive"].map((tab) => (
            <button key={tab} onClick={() => { setStatusFilter(tab); setPage(1); }} style={{ padding: "6px 14px", borderRadius: "4px", border: "none", background: statusFilter === tab ? "#c8a96e" : "transparent", color: statusFilter === tab ? "#1a1a1a" : "#6b5a3e", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>{tab}</button>
          ))}
        </div>

        {/* Rows */}
        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ background: "var(--bg-input)", border: "1px solid rgba(200,169,110,0.2)", borderRadius: "6px", padding: "10px 12px", color: "#c8a96e", fontSize: "11px", outline: "none", fontFamily: "Montserrat, sans-serif", cursor: "pointer" }}>
          {[5, 10, 15, 20, 50].map(n => <option key={n} value={n} style={{ background: "var(--bg-card)" }}>{n} rows</option>)}
        </select>
        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", color: "#3d2f1a", alignSelf: "center", marginLeft: "auto" }}>{filtered.length} entries</span>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 60px 80px 130px", padding: "12px 24px", borderBottom: "1px solid rgba(200,169,110,0.1)", background: "rgba(200,169,110,0.04)" }}>
          {["PRODUCT", "CATEGORY", "PRICE", "IMG", "STATUS", "ACTIONS"].map(h => <span key={h} style={S.label}>{h}</span>)}
        </div>

       {loading ? (
  <>
    {[...Array(5)].map((_, i) => (
      <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 60px 80px 130px", padding: "14px 24px", borderBottom: "1px solid rgba(200,169,110,0.07)", alignItems: "center", gap: "12px" }}>
        {/* Product */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "rgba(200,169,110,0.1)", animation: "pulse 1.5s ease-in-out infinite", flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ height: "12px", width: "120px", borderRadius: "4px", background: "rgba(200,169,110,0.1)", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: "10px", width: "80px", borderRadius: "4px", background: "rgba(200,169,110,0.07)", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        </div>
        {/* Category */}
        <div style={{ height: "12px", width: "70px", borderRadius: "4px", background: "rgba(200,169,110,0.08)", animation: "pulse 1.5s ease-in-out infinite" }} />
        {/* Price */}
        <div style={{ height: "12px", width: "50px", borderRadius: "4px", background: "rgba(200,169,110,0.08)", animation: "pulse 1.5s ease-in-out infinite" }} />
        {/* Image */}
        <div style={{ width: "32px", height: "32px", borderRadius: "4px", background: "rgba(200,169,110,0.08)", animation: "pulse 1.5s ease-in-out infinite" }} />
        {/* Status */}
        <div style={{ height: "12px", width: "45px", borderRadius: "4px", background: "rgba(200,169,110,0.08)", animation: "pulse 1.5s ease-in-out infinite" }} />
        {/* Actions */}
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ height: "28px", width: "52px", borderRadius: "4px", background: "rgba(200,169,110,0.1)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: "28px", width: "32px", borderRadius: "4px", background: "rgba(192,57,43,0.08)", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
      </div>
    ))}
  </>
        ) : paginated.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", color: "#3d2f1a", fontStyle: "italic" }}>{search.trim() ? `No results for "${search}"` : "No products found"}</p>
            {!search.trim() && <button onClick={() => navigate("/product/add")} style={{ marginTop: "12px", background: "transparent", border: "none", color: "#c8a96e", fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "1px", cursor: "pointer", textDecoration: "underline" }}>+ Add your first product</button>}
          </div>
        ) : paginated.map((product, i) => {
          const price = getDisplayPrice(product);
          const thumb = getThumbImage(product);
          return (
            <div key={product._id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 60px 80px 130px", padding: "14px 24px", borderBottom: i < paginated.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none", alignItems: "center", gap: "12px", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(200,169,110,0.03)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c8a96e", fontFamily: "'Cormorant Garamond', serif", fontSize: "14px", fontWeight: 600, flexShrink: 0 }}>{product.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "var(--text-primary)", fontWeight: 500, margin: 0 }}>{product.name}</p>
                  {product.description && <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", color: "#3d2f1a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>{product.description}</p>}
                </div>
              </div>
              <div>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", color: "var(--text-faint)", margin: 0 }}>{product.category?.name || "—"}</p>
                {product.subCategory?.name && <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", color: "#3d2f1a", margin: 0 }}>{product.subCategory.name}</p>}
              </div>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "#c8a96e", fontWeight: 600 }}>{price != null ? `₹${price.toLocaleString("en-IN")}` : "—"}</span>
              <div>{thumb ? <img src={thumb} alt={product.name} style={{ width: "32px", height: "32px", objectFit: "cover", borderRadius: "4px", border: "1px solid rgba(200,169,110,0.2)" }} /> : <span style={{ color: "#3d2f1a", fontSize: "11px" }}>—</span>}</div>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1px", fontWeight: 600, color: product.isActive ? "#4ade80" : "#c0392b" }}>{product.isActive ? "Active" : "Inactive"}</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => navigate(`/product/edit/${product._id}`)} style={{ padding: "5px 10px", borderRadius: "4px", background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.2)", color: "#c8a96e", fontFamily: "Montserrat, sans-serif", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(200,169,110,0.2)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(200,169,110,0.1)"}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(product)} style={{ padding: "5px 8px", borderRadius: "4px", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)", color: "#c0392b", cursor: "pointer", display: "flex", alignItems: "center" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(192,57,43,0.2)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(192,57,43,0.1)"}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderTop: "1px solid rgba(200,169,110,0.1)", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", color: "#3d2f1a" }}>Showing <span style={{ color: "#c8a96e" }}>{(page - 1) * pageSize + 1}</span> to <span style={{ color: "#c8a96e" }}>{Math.min(page * pageSize, filtered.length)}</span> of <span style={{ color: "#c8a96e" }}>{filtered.length}</span> products</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid rgba(200,169,110,0.2)", background: "transparent", color: "var(--text-faint)", fontFamily: "Montserrat, sans-serif", fontSize: "11px", cursor: "pointer", opacity: page === 1 ? 0.3 : 1 }}>← Prev</button>
              {pageNums.map((p, i) => p === "..." ? <span key={`d${i}`} style={{ color: "var(--text-faint)", fontSize: "11px" }}>…</span> : (
                <button key={p} onClick={() => setPage(p)} style={{ width: "30px", height: "30px", borderRadius: "4px", border: `1px solid ${page === p ? "#c8a96e" : "rgba(200,169,110,0.2)"}`, background: page === p ? "#c8a96e" : "transparent", color: page === p ? "#1a1a1a" : "#6b5a3e", fontFamily: "Montserrat, sans-serif", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages || totalPages === 0} style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid rgba(200,169,110,0.2)", background: "transparent", color: "var(--text-faint)", fontFamily: "Montserrat, sans-serif", fontSize: "11px", cursor: "pointer", opacity: page === totalPages || totalPages === 0 ? 0.3 : 1 }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ width: "100%", maxWidth: "380px", background: "var(--bg-card)", border: "1px solid rgba(200,169,110,0.25)", borderRadius: "12px", padding: "28px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <svg className="w-5 h-5" style={{ color: "#c0392b" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", color: "var(--text-primary)", fontWeight: 400, fontStyle: "italic", marginBottom: "8px" }}>Delete Product</h3>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "var(--text-faint)", lineHeight: 1.7, marginBottom: "24px" }}>Are you sure you want to delete <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{deleteTarget.name}</span>? This cannot be undone.</p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: "11px", borderRadius: "6px", border: "1px solid rgba(200,169,110,0.2)", background: "transparent", color: "var(--text-faint)", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: "11px", borderRadius: "6px", border: "none", background: "#c0392b", color: "var(--text-primary)", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{ position: "fixed", bottom: "24px", right: "24px", padding: "14px 20px", borderRadius: "8px", background: toast.type === "error" ? "#c0392b" : "#c8a96e", color: toast.type === "error" ? "#fff" : "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "1px", fontWeight: 600, zIndex: 50, display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}>{toast.type === "error" ? "✕" : "✓"} {toast.msg}</div>}
    </div>
  );
}

export { AdminProducts };
export default AdminProducts;