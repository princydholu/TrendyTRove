import { useState, useEffect, useCallback } from "react";
import API from "../api/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const LEVEL_LABEL = { 1: "Main", 2: "Child", 3: "Sub" };
const LEVEL_COLOR = {
  1: { background: "linear-gradient(135deg, #c8a96e, #a07840)", color: "#1a1a1a" },
  2: { background: "rgba(200,169,110,0.15)", color: "#c8a96e", border: "1px solid rgba(200,169,110,0.3)" },
  3: { background: "rgba(255,255,255,0.05)", color: "var(--text-faint)", border: "1px solid rgba(255,255,255,0.1)" },
};
const empty = { name: "", parentId: "", level: 1, image: "", isActive: true };

// ─── Validation ───────────────────────────────────────────────────────────────
const validateField = (field, value, form = {}) => {
  switch (field) {
    case "name":
      if (!value.trim()) return "Category name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      if (value.trim().length > 50) return "Name must be under 50 characters";
      return "";
    case "parentId":
      if (form.level > 1 && !value) return "Please select a parent category";
      return "";
    default:
      return "";
  }
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const PlusIcon    = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const EditIcon    = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon   = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon  = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--text-faint)" }}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const CloseIcon   = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const ChevronLeft  = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const ChevronRight = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;

// shared input style
const inputCls = (hasErr) => ({
  width: "100%",
  background: "var(--bg-input)",
  border: `1px solid ${hasErr ? "#c0392b" : "rgba(200,169,110,0.2)"}`,
  borderRadius: "6px",
  padding: "10px 14px",
  color: "var(--text-primary)",
  fontSize: "13px",
  outline: "none",
  fontFamily: "Montserrat, sans-serif",
  transition: "border-color 0.2s",
});

const labelStyle = {
  display: "block",
  fontFamily: "Montserrat, sans-serif",
  fontSize: "9px",
  letterSpacing: "2px",
  color: "var(--text-faint)",
  textTransform: "uppercase",
  marginBottom: "6px",
  fontWeight: 600,
};

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid rgba(200,169,110,0.25)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(200,169,110,0.15)" }}>
          <div>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "8px", letterSpacing: "3px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "4px" }}>{subtitle}</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", color: "var(--text-primary)", fontWeight: 400, fontStyle: "italic" }}>{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center transition-all"
            style={{ background: "rgba(200,169,110,0.1)", color: "var(--text-faint)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#c8a96e"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#6b5a3e"; }}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

// ─── CategoryForm ─────────────────────────────────────────────────────────────
function CategoryForm({ initial, allCategories, onSubmit, loading }) {
  const [form, setForm]       = useState(initial);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (touched[name]) setErrors((prev) => ({ ...prev, [name]: validateField(name, value, updated) }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field] || "", form) }));
  };

  const handleLevelChange = (e) => {
    const level = Number(e.target.value);
    const updated = { ...form, level, parentId: "" };
    setForm(updated);
    if (touched.parentId) setErrors((prev) => ({ ...prev, parentId: validateField("parentId", "", updated) }));
  };

  const validateAll = () => {
    const fields = ["name", "parentId"];
    const newErrors = {};
    const newTouched = {};
    fields.forEach((f) => { newErrors[f] = validateField(f, form[f] || "", form); newTouched[f] = true; });
    setErrors(newErrors);
    setTouched(newTouched);
    return Object.values(newErrors).every((e) => !e);
  };

  const handleSubmit = () => {
    if (!validateAll()) return;
    onSubmit({ ...form, name: form.name.trim() });
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Name */}
      <div>
        <label style={labelStyle}>Category Name <span style={{ color: "#c0392b" }}>*</span></label>
        <input name="name" value={form.name} onChange={handleChange} onBlur={() => handleBlur("name")} placeholder="e.g. Wall Décor" style={inputCls(touched.name && errors.name)}
          onFocus={e => e.target.style.borderColor = "#c8a96e"} onBlur_={(e) => e.target.style.borderColor = "rgba(200,169,110,0.2)"} />
        {touched.name && errors.name && <p style={{ color: "#c0392b", fontSize: "11px", marginTop: "4px", fontFamily: "Montserrat, sans-serif" }}>⚠ {errors.name}</p>}
      </div>

      {/* Level */}
      <div>
        <label style={labelStyle}>Level</label>
        <select name="level" value={form.level} onChange={handleLevelChange} style={{ ...inputCls(false), cursor: "pointer" }}>
          <option value={1} style={{ background: "var(--bg-card)" }}>1 — Main (e.g. Home Decor)</option>
          <option value={2} style={{ background: "var(--bg-card)" }}>2 — Child (e.g. Wall Decor)</option>
          <option value={3} style={{ background: "var(--bg-card)" }}>3 — Sub (e.g. Wall Art)</option>
        </select>
      </div>

      {/* Parent */}
      {form.level > 1 && (
        <div>
          <label style={labelStyle}>Parent Category <span style={{ color: "#c0392b" }}>*</span></label>
          <select name="parentId" value={form.parentId} onChange={handleChange} onBlur={() => handleBlur("parentId")} style={{ ...inputCls(touched.parentId && errors.parentId), cursor: "pointer" }}>
            <option value="" style={{ background: "var(--bg-card)" }}>— Select parent —</option>
            {allCategories.filter((c) => c.level === form.level - 1).map((c) => (
              <option key={c._id} value={c._id} style={{ background: "var(--bg-card)" }}>{c.name}</option>
            ))}
          </select>
          {touched.parentId && errors.parentId && <p style={{ color: "#c0392b", fontSize: "11px", marginTop: "4px", fontFamily: "Montserrat, sans-serif" }}>⚠ {errors.parentId}</p>}
        </div>
      )}

      {/* Image */}
      <div>
        <label style={labelStyle}>Image</label>
        {form.image && (
          <div className="relative w-20 h-20 mb-3 rounded overflow-hidden" style={{ border: "1px solid rgba(200,169,110,0.3)" }}>
            <img src={form.image} alt="preview" className="w-full h-full object-cover" />
            <button onClick={() => setForm((f) => ({ ...f, image: "" }))} className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: "#c0392b" }}>✕</button>
          </div>
        )}
        <input name="image" value={form.image} onChange={handleChange} placeholder="https://... (paste image URL)" style={{ ...inputCls(false), marginBottom: "8px" }} />
        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px" style={{ background: "rgba(200,169,110,0.15)" }} />
          <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", color: "var(--text-faint)", letterSpacing: "2px" }}>OR</span>
          <div className="flex-1 h-px" style={{ background: "rgba(200,169,110,0.15)" }} />
        </div>
        <label className="flex items-center justify-center gap-2 w-full py-3 rounded cursor-pointer transition-all"
          style={{ border: "1px dashed rgba(200,169,110,0.3)", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1px", color: "var(--text-faint)" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8a96e"; e.currentTarget.style.color = "#c8a96e"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(200,169,110,0.3)"; e.currentTarget.style.color = "#6b5a3e"; }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Browse & Upload Image
          <input type="file" accept="image/*" className="hidden"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              try {
                const data = new FormData();
                data.append("images", file);
                const res = await API.post("/upload/products", data, { headers: { "Content-Type": "multipart/form-data" } });
                setForm((f) => ({ ...f, image: res.data.urls[0] }));
              } catch {
                setForm((f) => ({ ...f, image: URL.createObjectURL(file) }));
              }
            }}
          />
        </label>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3 py-1 cursor-pointer" onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}>
        <div className="w-10 h-5 rounded-full relative transition-all duration-300" style={{ background: form.isActive ? "#c8a96e" : "rgba(255,255,255,0.1)" }}>
          <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300" style={{ left: form.isActive ? "20px" : "2px" }} />
        </div>
        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", color: "var(--text-faint)", letterSpacing: "0.5px" }}>
          {form.isActive ? "Active — visible on site" : "Inactive — hidden from site"}
        </span>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-2 py-3 rounded font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(135deg, #c8a96e, #a07840)", color: "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase" }}
      >
        {loading ? "Saving..." : "Save Category"}
      </button>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }
  const btnBase = { width: "32px", height: "32px", borderRadius: "4px", fontSize: "12px", fontFamily: "Montserrat, sans-serif", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", cursor: "pointer", border: "1px solid rgba(200,169,110,0.2)", background: "transparent", color: "var(--text-faint)" };

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button onClick={() => onPage(page - 1)} disabled={page === 1} style={{ ...btnBase, opacity: page === 1 ? 0.3 : 1 }}><ChevronLeft /></button>
      {pages.map((p, i) =>
        p === "..." ? <span key={`dots-${i}`} style={{ width: "32px", textAlign: "center", fontSize: "12px", color: "var(--text-faint)" }}>…</span> : (
          <button key={p} onClick={() => onPage(p)} style={{ ...btnBase, background: p === page ? "#c8a96e" : "transparent", color: p === page ? "#1a1a1a" : "#6b5a3e", borderColor: p === page ? "#c8a96e" : "rgba(200,169,110,0.2)" }}>{p}</button>
        )
      )}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages} style={{ ...btnBase, opacity: page === totalPages ? 0.3 : 1 }}><ChevronRight /></button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function AdminCategories() {
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [modal,       setModal]       = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [search,      setSearch]      = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [toast,       setToast]       = useState(null);
  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(10);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/categories?limit=100");
      setCategories(res.data.categories || []);
    } catch {
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { setPage(1); }, [search, filterLevel]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd    = async (form) => { setFormLoading(true); try { await API.post("/categories", form); showToast("Category created!"); setModal(null); fetchCategories(); } catch (err) { showToast(err.response?.data?.message || "Create failed", "error"); } finally { setFormLoading(false); } };
  const handleEdit   = async (form) => { setFormLoading(true); try { await API.put(`/categories/${selected._id}`, form); showToast("Category updated!"); setModal(null); fetchCategories(); } catch (err) { showToast(err.response?.data?.message || "Update failed", "error"); } finally { setFormLoading(false); } };
  const handleDelete = async ()     => { try { await API.delete(`/categories/${selected._id}`); showToast("Category deleted!"); setModal(null); fetchCategories(); } catch (err) { showToast(err.response?.data?.message || "Delete failed", "error"); } };

  const filtered   = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) && (filterLevel === "all" || String(c.level) === filterLevel));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  const parentName = (parentId) => categories.find((c) => c._id === parentId)?.name || "—";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "32px 24px" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "3px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "6px" }}>
            ADMIN / CATEGORIES
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "32px", color: "var(--text-primary)", fontWeight: 300, fontStyle: "italic" }}>
            All Categories
          </h1>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", color: "var(--text-faint)", marginTop: "4px" }}>
            {categories.length} total categories
          </p>
        </div>
        <button
          onClick={() => { setSelected(null); setModal("add"); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded transition-all duration-200"
          style={{ background: "linear-gradient(135deg, #c8a96e, #a07840)", color: "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", fontWeight: 700, textTransform: "uppercase" }}
        >
          <PlusIcon /> Add Category
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            style={{ ...inputCls(false), paddingLeft: "38px" }}
            onFocus={e => e.target.style.borderColor = "#c8a96e"}
            onBlur={e => e.target.style.borderColor = "rgba(200,169,110,0.2)"}
          />
        </div>

        {/* Level filters */}
        <div className="flex gap-2">
          {[["all", "All"], ["1", "Main"], ["2", "Child"], ["3", "Sub"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterLevel(val)}
              className="px-4 py-2 rounded transition-all duration-200"
              style={{
                fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600,
                background: filterLevel === val ? "#c8a96e" : "transparent",
                color: filterLevel === val ? "#1a1a1a" : "#6b5a3e",
                border: `1px solid ${filterLevel === val ? "#c8a96e" : "rgba(200,169,110,0.2)"}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Page size */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded" style={{ border: "1px solid rgba(200,169,110,0.2)", background: "transparent" }}>
          <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "2px", color: "var(--text-faint)", textTransform: "uppercase" }}>Rows:</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            style={{ background: "transparent", color: "#c8a96e", border: "none", outline: "none", cursor: "pointer", fontFamily: "Montserrat, sans-serif", fontSize: "12px" }}>
            {[5, 10, 15, 20, 50].map((num) => <option key={num} value={num} style={{ background: "var(--bg-card)" }}>{num}</option>)}
          </select>
        </div>

        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", color: "#3d2f1a", marginLeft: "auto" }}>{filtered.length} entries</span>
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

        {/* Head */}
        <div className="grid grid-cols-[2fr_80px_1.5fr_60px_80px_120px] px-6 py-3" style={{ borderBottom: "1px solid rgba(200,169,110,0.1)", background: "rgba(200,169,110,0.04)" }}>
          {["CATEGORY", "LEVEL", "PARENT", "IMAGE", "STATUS", "ACTIONS"].map((h) => (
            <span key={h} style={{ fontFamily: "Montserrat, sans-serif", fontSize: "8px", letterSpacing: "2px", color: "#3d2f1a", textTransform: "uppercase", fontWeight: 700 }}>{h}</span>
          ))}
        </div>

        {/* Body */}
        {loading ? (
  <>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="grid grid-cols-[2fr_80px_1.5fr_60px_80px_120px] px-6 py-4 items-center"
        style={{ borderBottom: "1px solid rgba(200,169,110,0.07)" }}>
        {/* Name */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded animate-pulse" style={{ background: "rgba(200,169,110,0.1)" }} />
          <div className="h-3 w-32 rounded animate-pulse" style={{ background: "rgba(200,169,110,0.1)" }} />
        </div>
        {/* Level */}
        <div className="h-5 w-12 rounded animate-pulse" style={{ background: "rgba(200,169,110,0.1)" }} />
        {/* Parent */}
        <div className="h-3 w-20 rounded animate-pulse" style={{ background: "rgba(200,169,110,0.08)" }} />
        {/* Image */}
        <div className="w-8 h-8 rounded animate-pulse" style={{ background: "rgba(200,169,110,0.08)" }} />
        {/* Status */}
        <div className="h-3 w-12 rounded animate-pulse" style={{ background: "rgba(200,169,110,0.08)" }} />
        {/* Actions */}
        <div className="flex gap-2">
          <div className="h-7 w-14 rounded animate-pulse" style={{ background: "rgba(200,169,110,0.1)" }} />
          <div className="h-7 w-8 rounded animate-pulse" style={{ background: "rgba(192,57,43,0.1)" }} />
        </div>
      </div>
    ))}
  </>
) : paginated.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", color: "#3d2f1a", fontStyle: "italic" }}>No categories found</p>
          </div>
        ) : (
          paginated.map((cat, i) => (
            <div
              key={cat._id}
              className="grid grid-cols-[2fr_80px_1.5fr_60px_80px_120px] px-6 py-4 items-center transition-colors"
              style={{ borderBottom: i < paginated.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(200,169,110,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {/* Name */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.2)" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "14px", color: "#c8a96e", fontWeight: 600 }}>{cat.name.charAt(0).toUpperCase()}</span>
                </div>
                <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>{cat.name}</span>
              </div>

              {/* Level */}
              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded text-center w-fit"
                style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "1px", fontWeight: 700, textTransform: "uppercase", ...LEVEL_COLOR[cat.level] }}>
                {LEVEL_LABEL[cat.level]}
              </span>

              {/* Parent */}
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", color: "#3d2f1a" }} className="truncate">
                {cat.parentId ? parentName(cat.parentId) : "—"}
              </span>

              {/* Image */}
              <div>
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-8 h-8 object-cover rounded" style={{ border: "1px solid rgba(200,169,110,0.3)" }} />
                ) : (
                  <span style={{ color: "#3d2f1a", fontSize: "11px" }}>—</span>
                )}
              </div>

              {/* Status */}
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1px", fontWeight: 600, color: cat.isActive ? "#4ade80" : "#c0392b" }}>
                {cat.isActive ? "Active" : "Inactive"}
              </span>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setSelected(cat); setModal("edit"); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all"
                  style={{ background: "rgba(200,169,110,0.1)", color: "#c8a96e", border: "1px solid rgba(200,169,110,0.2)", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1px" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(200,169,110,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(200,169,110,0.1)"}
                >
                  <EditIcon /> Edit
                </button>
                <button
                  onClick={() => { setSelected(cat); setModal("delete"); }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all"
                  style={{ background: "rgba(192,57,43,0.1)", color: "#c0392b", border: "1px solid rgba(192,57,43,0.2)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(192,57,43,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(192,57,43,0.1)"}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4" style={{ borderTop: "1px solid rgba(200,169,110,0.1)" }}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", color: "#3d2f1a" }}>
              Showing <span style={{ color: "#c8a96e" }}>{(page - 1) * pageSize + 1}</span> to{" "}
              <span style={{ color: "#c8a96e" }}>{Math.min(page * pageSize, filtered.length)}</span> of{" "}
              <span style={{ color: "#c8a96e" }}>{filtered.length}</span> categories
            </p>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </div>
        )}
      </div>

      {/* ── Add Modal ── */}
      {modal === "add" && (
        <Modal title="New Category" subtitle="ADD CATEGORY" onClose={() => setModal(null)}>
          <CategoryForm initial={empty} allCategories={categories} onSubmit={handleAdd} loading={formLoading} />
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {modal === "edit" && selected && (
        <Modal title={`Edit — ${selected.name}`} subtitle="EDIT CATEGORY" onClose={() => setModal(null)}>
          <CategoryForm
            initial={{ name: selected.name, parentId: selected.parentId || "", level: selected.level, image: selected.image || "", isActive: selected.isActive }}
            allCategories={categories} onSubmit={handleEdit} loading={formLoading}
          />
        </Modal>
      )}

      {/* ── Delete Modal ── */}
      {modal === "delete" && selected && (
        <Modal title="Delete Category" subtitle="CONFIRM ACTION" onClose={() => setModal(null)}>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "var(--text-faint)", lineHeight: 1.7, marginBottom: "24px" }}>
            Are you sure you want to delete{" "}
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>"{selected.name}"</span>?{" "}
            This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded transition-all"
              style={{ border: "1px solid rgba(200,169,110,0.2)", color: "var(--text-faint)", background: "transparent", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#c8a96e"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,169,110,0.2)"}
            >
              Cancel
            </button>
            <button onClick={handleDelete} className="flex-1 py-2.5 rounded transition-all"
              style={{ background: "#c0392b", color: "var(--text-primary)", border: "none", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}
              onMouseEnter={e => e.currentTarget.style.background = "#a93226"}
              onMouseLeave={e => e.currentTarget.style.background = "#c0392b"}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3.5 rounded text-sm font-semibold shadow-2xl z-50 flex items-center gap-2"
          style={{ background: toast.type === "error" ? "#c0392b" : "#c8a96e", color: toast.type === "error" ? "#fff" : "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "1px" }}>
          {toast.type === "error" ? "✕" : "✓"} {toast.msg}
        </div>
      )}
    </div>
  );
}

export default AdminCategories;