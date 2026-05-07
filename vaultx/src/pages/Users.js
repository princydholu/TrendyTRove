import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const validate = (field, value) => {
  switch (field) {
    case "name":  if (!value.trim()) return "Full name is required"; if (value.trim().length < 2) return "Name must be at least 2 characters"; return "";
    case "email": if (!value.trim()) return "Email is required"; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address"; return "";
    default: return "";
  }
};

const FieldError = ({ msg }) => msg ? <p style={{ color: "#c0392b", fontSize: "11px", marginTop: "4px", fontFamily: "Montserrat, sans-serif", display: "flex", alignItems: "center", gap: "4px" }}><span>⚠</span>{msg}</p> : null;

const SkeletonRow = () => (
  <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 100px 100px", padding: "16px 24px", borderBottom: "1px solid rgba(200,169,110,0.07)", alignItems: "center", gap: "16px" }}>
    {[120, 160, 60, 80].map((w, i) => <div key={i} style={{ height: "12px", width: `${w}px`, background: "rgba(200,169,110,0.08)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />)}
  </div>
);

const S = {
  input: (err) => ({ width: "100%", background: "var(--bg-input)", border: `1px solid ${err ? "#c0392b" : "rgba(200,169,110,0.2)"}`, borderRadius: "6px", padding: "10px 14px", color: "var(--text-primary)", fontSize: "13px", outline: "none", fontFamily: "Montserrat, sans-serif", transition: "border-color 0.2s", boxSizing: "border-box" }),
  label: { display: "block", fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "2px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "6px", fontWeight: 600 },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" },
  modalBox: { width: "100%", maxWidth: "420px", background: "var(--bg-card)", border: "1px solid rgba(200,169,110,0.25)", borderRadius: "12px", padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" },
};

function Users() {
  const navigate = useNavigate();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState("");
  const [draftSort, setDraftSort]   = useState("");
  const [sortOrder, setSortOrder]   = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [editUser, setEditUser]     = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [editTouched, setEditTouched] = useState({});
  const [editSaveError, setEditSaveError] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving]         = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try { const { data } = await API.get("/users?limit=100"); setUsers(data.users); }
    catch { setError("Failed to load users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openEditModal = (user) => { setEditUser({ ...user }); setEditErrors({}); setEditTouched({}); setEditSaveError(""); };
  const handleEditFieldChange = (field, value) => { setEditUser((prev) => ({ ...prev, [field]: value })); setEditTouched((prev) => ({ ...prev, [field]: true })); setEditErrors((prev) => ({ ...prev, [field]: validate(field, value) })); };
  const handleEditBlur = (field) => { setEditTouched((prev) => ({ ...prev, [field]: true })); setEditErrors((prev) => ({ ...prev, [field]: validate(field, editUser?.[field] || "") })); };
  const validateEditAll = () => { const fields = ["name", "email"]; const errors = {}, touched = {}; fields.forEach((f) => { errors[f] = validate(f, editUser?.[f] || ""); touched[f] = true; }); setEditErrors(errors); setEditTouched(touched); return Object.values(errors).every((e) => !e); };
  const handleEditSave = async () => {
    if (!validateEditAll()) return;
    setSaving(true); setEditSaveError("");
    try {
      const { data } = await API.put(`/users/${editUser._id || editUser.id}`, { name: editUser.name, email: editUser.email, role: editUser.role });
      setUsers(users.map((u) => (u._id || u.id) === (editUser._id || editUser.id) ? data.user || editUser : u));
      setEditUser(null);
    } catch (err) { setEditSaveError(err.response?.data?.message || "Failed to update user."); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    try { await API.delete(`/users/${id}`); setUsers(users.filter((u) => (u._id || u.id) !== id)); setDeleteModal(null); }
    catch { alert("Delete failed!"); }
  };
  const getInitials = (name) => { if (!name) return "?"; return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(); };

  let filtered = users.filter((u) => {
    const mH = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const mF = u.name?.toLowerCase().includes(filterSearch.toLowerCase()) || u.email?.toLowerCase().includes(filterSearch.toLowerCase());
    return mH && mF;
  });
  if (sortOrder === "az") filtered = [...filtered].sort((a, b) => a.name?.localeCompare(b.name));
  else if (sortOrder === "za") filtered = [...filtered].sort((a, b) => b.name?.localeCompare(a.name));

  const activeFilters = [filterSearch, sortOrder].filter(Boolean).length;
  const totalPages    = Math.ceil(filtered.length / rowsPerPage);
  const paginated     = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push("..."); acc.push(p); return acc; }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "32px 24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "3px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "6px" }}>ADMIN / USERS</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "32px", color: "var(--text-primary)", fontWeight: 300, fontStyle: "italic", margin: 0 }}>All Users</h1>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", color: "var(--text-faint)", marginTop: "4px" }}>{users.length} total users</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "var(--text-faint)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ background: "var(--bg-input)", border: "1px solid rgba(200,169,110,0.2)", borderRadius: "6px", paddingLeft: "36px", paddingRight: search ? "32px" : "14px", paddingTop: "10px", paddingBottom: "10px", color: "var(--text-primary)", fontSize: "12px", outline: "none", fontFamily: "Montserrat, sans-serif", width: "200px" }}
              onFocus={e => e.target.style.borderColor = "#c8a96e"} onBlur={e => e.target.style.borderColor = "rgba(200,169,110,0.2)"} />
            {search && <button onClick={() => { setSearch(""); setCurrentPage(1); }} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: "14px" }}>✕</button>}
          </div>
          {/* Add User */}
          <button onClick={() => navigate("/users/add")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "6px", border: "none", background: "linear-gradient(135deg, #c8a96e, #a07840)", color: "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, cursor: "pointer" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add User
          </button>
          {/* Filter */}
          <button onClick={() => setFilterOpen(true)} style={{ position: "relative", display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "6px", border: "1px solid rgba(200,169,110,0.2)", background: "transparent", color: "var(--text-faint)", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1px", cursor: "pointer", textTransform: "uppercase" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#c8a96e"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,169,110,0.2)"}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
            Filter
            {activeFilters > 0 && <span style={{ position: "absolute", top: "-6px", right: "-6px", width: "16px", height: "16px", background: "#c8a96e", color: "#1a1a1a", fontSize: "9px", fontWeight: 700, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Montserrat, sans-serif" }}>{activeFilters}</span>}
          </button>
          {/* Rows */}
          <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ background: "var(--bg-input)", border: "1px solid rgba(200,169,110,0.2)", borderRadius: "6px", padding: "10px 12px", color: "#c8a96e", fontSize: "12px", outline: "none", fontFamily: "Montserrat, sans-serif", cursor: "pointer" }}>
            {[5, 10, 20, 30, 50].map(n => <option key={n} value={n} style={{ background: "var(--bg-card)" }}>{n} rows</option>)}
          </select>
        </div>
      </div>

      {error && <p style={{ color: "#c0392b", fontFamily: "Montserrat, sans-serif", fontSize: "12px", marginBottom: "16px" }}>{error}</p>}

      {/* Table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
        {/* Head */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 100px 100px", padding: "12px 24px", borderBottom: "1px solid rgba(200,169,110,0.1)", background: "rgba(200,169,110,0.04)" }}>
          {["USER", "EMAIL", "ROLE", "ACTIONS"].map(h => (
            <span key={h} style={{ fontFamily: "Montserrat, sans-serif", fontSize: "8px", letterSpacing: "2px", color: "#3d2f1a", textTransform: "uppercase", fontWeight: 700 }}>{h}</span>
          ))}
        </div>

        {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />) :
         paginated.length === 0 ? (
           <div style={{ textAlign: "center", padding: "64px 24px" }}>
             <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", color: "#3d2f1a", fontStyle: "italic" }}>No users found</p>
           </div>
         ) : paginated.map((user, i) => (
          <div key={user._id || user.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 100px 100px", padding: "16px 24px", borderBottom: i < paginated.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none", alignItems: "center", gap: "16px", transition: "background 0.2s", cursor: "default" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(200,169,110,0.03)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #c8a96e, #a07840)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1a1a", fontWeight: 700, fontSize: "12px", fontFamily: "Montserrat, sans-serif", flexShrink: 0 }}>{getInitials(user.name)}</div>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>{user.name}</span>
            </div>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", color: "var(--text-faint)" }}>{user.email}</span>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "4px", fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "1px", fontWeight: 700, textTransform: "uppercase", background: user.role === "admin" ? "rgba(200,169,110,0.15)" : "rgba(255,255,255,0.05)", color: user.role === "admin" ? "#c8a96e" : "#6b5a3e", border: `1px solid ${user.role === "admin" ? "rgba(200,169,110,0.3)" : "rgba(255,255,255,0.1)"}`, width: "fit-content" }}>{user.role || "user"}</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => openEditModal(user)} style={{ padding: "6px 12px", borderRadius: "4px", background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.2)", color: "#c8a96e", fontFamily: "Montserrat, sans-serif", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(200,169,110,0.2)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(200,169,110,0.1)"}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit
              </button>
              <button onClick={() => setDeleteModal(user)} style={{ padding: "6px 10px", borderRadius: "4px", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)", color: "#c0392b", cursor: "pointer", display: "flex", alignItems: "center" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(192,57,43,0.2)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(192,57,43,0.1)"}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderTop: "1px solid rgba(200,169,110,0.1)", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", color: "#3d2f1a" }}>
              Showing <span style={{ color: "#c8a96e" }}>{(currentPage - 1) * rowsPerPage + 1}</span> to <span style={{ color: "#c8a96e" }}>{Math.min(currentPage * rowsPerPage, filtered.length)}</span> of <span style={{ color: "#c8a96e" }}>{filtered.length}</span> users
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid rgba(200,169,110,0.2)", background: "transparent", color: "var(--text-faint)", fontFamily: "Montserrat, sans-serif", fontSize: "11px", cursor: "pointer", opacity: currentPage === 1 ? 0.3 : 1 }}>← Prev</button>
              {pageNums.map((p, i) => p === "..." ? <span key={`d${i}`} style={{ color: "var(--text-faint)", fontSize: "11px" }}>…</span> : (
                <button key={p} onClick={() => setCurrentPage(p)} style={{ width: "30px", height: "30px", borderRadius: "4px", border: `1px solid ${currentPage === p ? "#c8a96e" : "rgba(200,169,110,0.2)"}`, background: currentPage === p ? "#c8a96e" : "transparent", color: currentPage === p ? "#1a1a1a" : "#6b5a3e", fontFamily: "Montserrat, sans-serif", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>{p}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid rgba(200,169,110,0.2)", background: "transparent", color: "var(--text-faint)", fontFamily: "Montserrat, sans-serif", fontSize: "11px", cursor: "pointer", opacity: currentPage === totalPages || totalPages === 0 ? 0.3 : 1 }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div style={S.modal}>
          <div style={S.modalBox}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", letterSpacing: "3px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "6px" }}>EDIT USER</p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", color: "var(--text-primary)", fontWeight: 400, fontStyle: "italic", marginBottom: "20px" }}>Edit User</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid rgba(200,169,110,0.1)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #c8a96e, #a07840)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1a1a", fontWeight: 700, fontSize: "13px", fontFamily: "Montserrat, sans-serif" }}>{getInitials(editUser.name)}</div>
              <div>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>{editUser.name}</p>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", color: "var(--text-faint)" }}>{editUser.email}</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[{ key: "name", label: "Full Name", type: "text" }, { key: "email", label: "Email", type: "email" }].map(({ key, label, type }) => (
                <div key={key}>
                  <label style={S.label}>{label} <span style={{ color: "#c0392b" }}>*</span></label>
                  <input type={type} value={editUser[key] || ""} onChange={e => handleEditFieldChange(key, e.target.value)} onBlur={() => handleEditBlur(key)} style={S.input(editTouched[key] && editErrors[key])} onFocus={e => e.target.style.borderColor = "#c8a96e"} />
                  {editTouched[key] && <FieldError msg={editErrors[key]} />}
                </div>
              ))}
              <div>
                <label style={S.label}>Role <span style={{ color: "#c0392b" }}>*</span></label>
                <select value={editUser.role || "user"} onChange={e => handleEditFieldChange("role", e.target.value)} style={{ ...S.input(false), cursor: "pointer" }}>
                  <option value="user" style={{ background: "var(--bg-card)" }}>user</option>
                  <option value="admin" style={{ background: "var(--bg-card)" }}>admin</option>
                </select>
              </div>
              {editSaveError && <div style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", color: "#c0392b", fontFamily: "Montserrat, sans-serif", fontSize: "11px", padding: "10px 14px", borderRadius: "6px" }}>{editSaveError}</div>}
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={() => setEditUser(null)} style={{ flex: 1, padding: "11px", borderRadius: "6px", border: "1px solid rgba(200,169,110,0.2)", background: "transparent", color: "var(--text-faint)", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleEditSave} disabled={saving} style={{ flex: 1, padding: "11px", borderRadius: "6px", border: "none", background: "linear-gradient(135deg, #c8a96e, #a07840)", color: "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : "Update"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div style={S.modal}>
          <div style={{ ...S.modalBox, maxWidth: "380px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <svg className="w-5 h-5" style={{ color: "#c0392b" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", color: "var(--text-primary)", fontWeight: 400, fontStyle: "italic", marginBottom: "8px" }}>Delete User</h3>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "var(--text-faint)", lineHeight: 1.7, marginBottom: "24px" }}>Are you sure you want to delete <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{deleteModal.name}</span>? This cannot be undone.</p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: "11px", borderRadius: "6px", border: "1px solid rgba(200,169,110,0.2)", background: "transparent", color: "var(--text-faint)", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteModal._id || deleteModal.id)} style={{ flex: 1, padding: "11px", borderRadius: "6px", border: "none", background: "#c0392b", color: "var(--text-primary)", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Drawer Overlay */}
      {filterOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 40 }} onClick={() => setFilterOpen(false)} />}

      {/* Filter Drawer */}
      <div style={{ position: "fixed", top: 0, right: 0, height: "100%", width: "300px", background: "var(--bg-card)", borderLeft: "1px solid rgba(200,169,110,0.2)", zIndex: 50, display: "flex", flexDirection: "column", transform: filterOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(200,169,110,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", color: "var(--text-primary)", fontWeight: 400, fontStyle: "italic", margin: 0 }}>Filters</h3>
            {activeFilters > 0 && <span style={{ background: "#c8a96e", color: "#1a1a1a", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", fontFamily: "Montserrat, sans-serif" }}>{activeFilters}</span>}
          </div>
          <button onClick={() => setFilterOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ marginBottom: "24px" }}>
            <label style={S.label}>Search</label>
            <input type="text" placeholder="Search in filter..." value={draftSearch} onChange={e => setDraftSearch(e.target.value)} style={S.input(false)} onFocus={e => e.target.style.borderColor = "#c8a96e"} onBlur={e => e.target.style.borderColor = "rgba(200,169,110,0.2)"} />
          </div>
          <div>
            <label style={S.label}>Sort by Name</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[["az", "A → Z"], ["za", "Z → A"]].map(([val, lbl]) => (
                <button key={val} onClick={() => setDraftSort(draftSort === val ? "" : val)} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: `1px solid ${draftSort === val ? "#c8a96e" : "rgba(200,169,110,0.2)"}`, background: draftSort === val ? "rgba(200,169,110,0.15)" : "transparent", color: draftSort === val ? "#c8a96e" : "#6b5a3e", fontFamily: "Montserrat, sans-serif", fontSize: "11px", cursor: "pointer", fontWeight: 600 }}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(200,169,110,0.1)", display: "flex", gap: "10px" }}>
          <button onClick={() => { setDraftSearch(""); setDraftSort(""); setFilterSearch(""); setSortOrder(""); setCurrentPage(1); setFilterOpen(false); }} style={{ flex: 1, padding: "11px", borderRadius: "6px", border: "1px solid rgba(200,169,110,0.2)", background: "transparent", color: "var(--text-faint)", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer" }}>Reset</button>
          <button onClick={() => { setFilterSearch(draftSearch); setSortOrder(draftSort); setCurrentPage(1); setFilterOpen(false); }} style={{ flex: 1, padding: "11px", borderRadius: "6px", border: "none", background: "linear-gradient(135deg, #c8a96e, #a07840)", color: "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 700, cursor: "pointer" }}>Apply</button>
        </div>
      </div>
    </div>
  );
}

export default Users;