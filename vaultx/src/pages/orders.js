import { useState, useEffect } from "react";
import API from "../api/axios";

// ── Validation ────────────────────────────────────────────────────────────────
const validate = (field, value) => {
  switch (field) {
    case "orderStatus":   if (!value) return "Order status is required"; return "";
    case "paymentStatus": if (!value) return "Payment status is required"; return "";
    default: return "";
  }
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const S = {
  input: (err) => ({
    width: "100%", background: "var(--bg-input)",
    border: `1px solid ${err ? "#c0392b" : "rgba(200,169,110,0.2)"}`,
    borderRadius: "6px", padding: "10px 14px", color: "var(--text-primary)",
    fontSize: "13px", outline: "none", fontFamily: "Montserrat, sans-serif",
    transition: "border-color 0.2s", boxSizing: "border-box",
  }),
  label: {
    display: "block", fontFamily: "Montserrat, sans-serif", fontSize: "9px",
    letterSpacing: "2px", color: "var(--text-faint)", textTransform: "uppercase",
    marginBottom: "6px", fontWeight: 600,
  },
  card: {
    background: "var(--bg-card)", border: "1px solid var(--border)",
    borderRadius: "12px", padding: "24px", marginBottom: "16px",
  },
  err: {
    color: "#c0392b", fontSize: "11px", marginTop: "4px",
    fontFamily: "Montserrat, sans-serif", minHeight: "16px",
    display: "flex", alignItems: "center", gap: "4px",
  },
};

const FieldError = ({ msg }) => <p style={S.err}>{msg && <><span>⚠</span>{msg}</>}</p>;
const Label = ({ children }) => <label style={S.label}>{children}</label>;

// ── Skeleton Row ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr style={{ borderBottom: "1px solid rgba(200,169,110,0.08)" }}>
    {[80, 120, 100, 70, 80, 70, 80, 70].map((w, i) => (
      <td key={i} style={{ padding: "14px 16px" }}>
        <div style={{ height: "10px", width: `${w}px`, background: "rgba(200,169,110,0.08)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
      </td>
    ))}
  </tr>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon }) => (
  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
    <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#c8a96e" }}>
      {icon}
    </div>
    <div>
      <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "8px", letterSpacing: "2px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "4px" }}>{label}</p>
      <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", color: "var(--text-primary)", fontWeight: 600, margin: "0 0 2px" }}>{value}</p>
      {sub && <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "9px", color: "#3d2f1a" }}>{sub}</p>}
    </div>
  </div>
);

// ── Status Badge ──────────────────────────────────────────────────────────────
const orderStatusColors = {
  Processing: { bg: "rgba(100,150,255,0.1)", color: "#7aa0ff", border: "rgba(100,150,255,0.25)" },
  Shipped:    { bg: "rgba(180,120,255,0.1)", color: "#c084fc", border: "rgba(180,120,255,0.25)" },
  Delivered:  { bg: "rgba(100,200,140,0.1)", color: "#6ee7a0", border: "rgba(100,200,140,0.25)" },
  Cancelled:  { bg: "rgba(220,80,80,0.1)",   color: "#f87171", border: "rgba(220,80,80,0.25)"  },
};
const paymentStatusColors = {
  Paid:    { bg: "rgba(100,200,140,0.1)", color: "#6ee7a0", border: "rgba(100,200,140,0.25)" },
  paid:    { bg: "rgba(100,200,140,0.1)", color: "#6ee7a0", border: "rgba(100,200,140,0.25)" },
  Pending: { bg: "rgba(250,190,80,0.1)",  color: "#fbbf24", border: "rgba(250,190,80,0.25)"  },
  pending: { bg: "rgba(250,190,80,0.1)",  color: "#fbbf24", border: "rgba(250,190,80,0.25)"  },
  Failed:  { bg: "rgba(220,80,80,0.1)",   color: "#f87171", border: "rgba(220,80,80,0.25)"  },
  failed:  { bg: "rgba(220,80,80,0.1)",   color: "#f87171", border: "rgba(220,80,80,0.25)"  },
};

const Badge = ({ label, colorMap }) => {
  const c = colorMap[label] || { bg: "rgba(255,255,255,0.05)", color: "var(--text-faint)", border: "rgba(200,169,110,0.2)" };
  return (
    <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontFamily: "Montserrat, sans-serif", fontWeight: 700, letterSpacing: "0.5px", background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: "nowrap", textTransform: "capitalize" }}>
      {label}
    </span>
  );
};

// ── Icon Button ───────────────────────────────────────────────────────────────
const IconBtn = ({ onClick, title, hoverColor = "#c8a96e", children }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: "7px", borderRadius: "6px", border: `1px solid ${hov ? hoverColor + "44" : "rgba(200,169,110,0.12)"}`, background: hov ? hoverColor + "18" : "transparent", color: hov ? hoverColor : "#6b5a3e", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center" }}>
      {children}
    </button>
  );
};

function Orders() {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");

  // Filter drawer
  const [filterOpen,          setFilterOpen]          = useState(false);
  const [draftSearch,         setDraftSearch]         = useState("");
  const [draftOrderStatus,    setDraftOrderStatus]    = useState("");
  const [draftPaymentStatus,  setDraftPaymentStatus]  = useState("");
  const [draftSort,           setDraftSort]           = useState("");
  const [filterSearch,        setFilterSearch]        = useState("");
  const [filterOrderStatus,   setFilterOrderStatus]   = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [sortOrder,           setSortOrder]           = useState("");

  // Edit modal
  const [editOrder,     setEditOrder]     = useState(null);
  const [editErrors,    setEditErrors]    = useState({});
  const [editTouched,   setEditTouched]   = useState({});
  const [editSaveError, setEditSaveError] = useState("");
  const [saving,        setSaving]        = useState(false);

  // View / Delete modal
  const [viewOrder,   setViewOrder]   = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  // Pagination
  const [rowsPerPage,  setRowsPerPage]  = useState(10);
  const [currentPage,  setCurrentPage]  = useState(1);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await API.get("orders/admin/all");
      setOrders(data.orders || data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchOrders(); }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalRevenue = orders.filter((o) => ["paid","Paid"].includes(o.paymentStatus)).reduce((s,o) => s+(o.amount||o.total||0), 0);
  const pending   = orders.filter((o) => o.orderStatus === "Processing").length;
  const delivered = orders.filter((o) => o.orderStatus === "Delivered").length;
  const failed    = orders.filter((o) => ["failed","Failed"].includes(o.paymentStatus)).length;

  // ── Edit handlers ─────────────────────────────────────────────────────────
  const openEditModal = (order) => { setEditOrder({...order}); setEditErrors({}); setEditTouched({}); setEditSaveError(""); };
  const handleEditChange = (field, value) => { setEditOrder((p) => ({...p,[field]:value})); setEditTouched((p) => ({...p,[field]:true})); setEditErrors((p) => ({...p,[field]:validate(field,value)})); };
  const handleEditBlur   = (field) => { setEditTouched((p) => ({...p,[field]:true})); setEditErrors((p) => ({...p,[field]:validate(field, editOrder?.[field]||"")})); };
  const validateAll = () => {
    const fields = ["orderStatus","paymentStatus"]; const errors={}, touched={};
    fields.forEach((f) => { errors[f]=validate(f,editOrder?.[f]||""); touched[f]=true; });
    setEditErrors(errors); setEditTouched(touched);
    return Object.values(errors).every((e) => !e);
  };
  const handleEditSave = async () => {
    if (!validateAll()) return;
    setSaving(true); setEditSaveError("");
    try {
      await API.put(`/orders/admin/${editOrder._id}`, { orderStatus: editOrder.orderStatus, paymentStatus: editOrder.paymentStatus });
      setOrders((prev) => prev.map((o) => o._id===editOrder._id ? {...o, orderStatus:editOrder.orderStatus, paymentStatus:editOrder.paymentStatus} : o));
      setEditOrder(null);
    } catch (err) { setEditSaveError(err?.response?.data?.message || "Failed to update order."); }
    finally { setSaving(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try { await API.delete(`/orders/admin/${id}`); setOrders((prev) => prev.filter((o) => o._id!==id)); setDeleteModal(null); }
    catch { alert("Delete failed!"); }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate     = (iso) => iso ? new Date(iso).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
  const formatCurrency = (n)   => `₹${Number(n||0).toLocaleString("en-IN")}`;
  const getCustomerName  = (o) => o.customer?.name  || o.customerName  || "—";
  const getCustomerEmail = (o) => o.customer?.email || o.customerEmail || "—";

  // ── Filtering ─────────────────────────────────────────────────────────────
  let filtered = orders.filter((o) => {
    const q=search.toLowerCase(), fq=filterSearch.toLowerCase();
    const id=(o._id||"").toLowerCase(), nm=getCustomerName(o).toLowerCase(), em=getCustomerEmail(o).toLowerCase();
    return id.includes(q)||nm.includes(q)||em.includes(q)||id.includes(fq)||nm.includes(fq)||em.includes(fq)
      ? true
      : (id+nm+em).includes(q) && (id+nm+em).includes(fq) && (!filterOrderStatus||o.orderStatus===filterOrderStatus) && (!filterPaymentStatus||o.paymentStatus?.toLowerCase()===filterPaymentStatus.toLowerCase());
  });
  // fix the filter logic properly
  filtered = orders.filter((o) => {
    const q=search.toLowerCase(), fq=filterSearch.toLowerCase();
    const id=(o._id||"").toLowerCase(), nm=getCustomerName(o).toLowerCase(), em=getCustomerEmail(o).toLowerCase();
    const matchH = id.includes(q)||nm.includes(q)||em.includes(q);
    const matchF = id.includes(fq)||nm.includes(fq)||em.includes(fq);
    const matchOS = !filterOrderStatus||o.orderStatus===filterOrderStatus;
    const matchPS = !filterPaymentStatus||o.paymentStatus?.toLowerCase()===filterPaymentStatus.toLowerCase();
    return matchH&&matchF&&matchOS&&matchPS;
  });

  if (sortOrder==="newest") filtered=[...filtered].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  else if (sortOrder==="oldest") filtered=[...filtered].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  else if (sortOrder==="high")   filtered=[...filtered].sort((a,b)=>(b.amount||b.total||0)-(a.amount||a.total||0));
  else if (sortOrder==="low")    filtered=[...filtered].sort((a,b)=>(a.amount||a.total||0)-(b.amount||b.total||0));

  const activeFilters = [filterSearch,filterOrderStatus,filterPaymentStatus,sortOrder].filter(Boolean).length;
  const totalPages    = Math.ceil(filtered.length/rowsPerPage);
  const paginated     = filtered.slice((currentPage-1)*rowsPerPage, currentPage*rowsPerPage);

  const avatarLetter = (name) => name.split(" ").map((w)=>w[0]).join("").slice(0,2).toUpperCase();

  // ── Select style ──────────────────────────────────────────────────────────
  const selectStyle = {
    ...S.input(false),
    cursor: "pointer",
    appearance: "none", WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b5a3e' strokeWidth='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
    paddingRight: "32px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "32px 24px" }}>
      <style>{`
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .order-row:hover { background: var(--bg-card2) !important; }
  .filter-toggle:hover { border-color:#c8a96e !important; color:#c8a96e !important; }
  .pagination-btn:hover:not(:disabled) { border-color:rgba(200,169,110,0.4) !important; color:#c8a96e !important; }
  input::placeholder { color: var(--text-faint); }
  select option { background: var(--bg-card); color: var(--text-primary); }
`}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"32px", flexWrap:"wrap", gap:"16px" }}>
          <div>
            <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"9px", letterSpacing:"3px", color:"#6b5a3e", textTransform:"uppercase", marginBottom:"8px" }}>Admin / Orders</p>
            <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"36px", color:"var(--text-primary)", fontWeight:300, fontStyle:"italic", margin:"0 0 4px"
 }}>All Orders</h1>
            <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"10px", color:"#3d2f1a", letterSpacing:"1px" }}>{orders.length} total orders</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
            {/* Search */}
            <div style={{ position:"relative" }}>
              <svg style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"#6b5a3e", pointerEvents:"none" }} xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input type="text" placeholder="Search orders..." value={search}
                onChange={(e)=>{setSearch(e.target.value);setCurrentPage(1);}}
                style={{ ...S.input(false), width:"200px", paddingLeft:"36px", paddingRight: search?"32px":"14px" }}
                onFocus={e=>e.target.style.borderColor="#c8a96e"} onBlur={e=>e.target.style.borderColor="rgba(200,169,110,0.2)"}
              />
              {search && <button onClick={()=>{setSearch("");setCurrentPage(1);}} style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#6b5a3e", cursor:"pointer", fontSize:"12px" }}>✕</button>}
            </div>

            {/* Rows per page */}
            <select value={rowsPerPage} onChange={(e)=>{setRowsPerPage(Number(e.target.value));setCurrentPage(1);}} style={{ ...selectStyle, width:"80px" }}>
              {[5,10,20,50].map((n)=><option key={n} value={n}>{n}</option>)}
            </select>

            {/* Refresh */}
            <button onClick={fetchOrders} className="filter-toggle"
              style={{ padding:"10px 14px", borderRadius:"6px", border:"1px solid rgba(200,169,110,0.2)", background:"transparent", color:"#6b5a3e", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"1px", transition:"all 0.2s" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            {/* Filter */}
            <button onClick={()=>setFilterOpen(true)} className="filter-toggle"
              style={{ position:"relative", padding:"10px 16px", borderRadius:"6px", border:"1px solid rgba(200,169,110,0.2)", background:"transparent", color:"#6b5a3e", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"1px", transition:"all 0.2s" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filters
              {activeFilters>0 && <span style={{ position:"absolute", top:"-6px", right:"-6px", width:"16px", height:"16px", borderRadius:"50%", background:"#c8a96e", color:"#1a1a1a", fontSize:"9px", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Montserrat,sans-serif" }}>{activeFilters}</span>}
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"12px", marginBottom:"28px" }}>
          <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} sub="from paid orders"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard label="Total Orders" value={orders.length} sub="all time"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <StatCard label="Processing" value={pending} sub="awaiting action"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard label="Delivered" value={delivered} sub={`${failed} failed payments`}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          />
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ background:"rgba(192,57,43,0.1)", border:"1px solid rgba(192,57,43,0.3)", borderRadius:"8px", padding:"14px 18px", marginBottom:"20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <p style={{ color:"#f87171", fontFamily:"Montserrat,sans-serif", fontSize:"12px" }}>{error}</p>
            <button onClick={fetchOrders} style={{ color:"#f87171", background:"none", border:"none", fontFamily:"Montserrat,sans-serif", fontSize:"10px", cursor:"pointer", textDecoration:"underline" }}>Retry</button>
          </div>
        )}

        {/* ── Table ── */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)"
, borderRadius:"12px", overflow:"hidden" }}>
          {/* Divider line at top */}
          <div style={{ height:"2px", background:"linear-gradient(90deg,#c8a96e22,#c8a96e88,#c8a96e22)" }} />
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"700px" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(200,169,110,0.12)" }}>
                  {["Order ID","Customer","Items","Amount","Order Status","Payment","Date","Actions"].map((h,i) => (
                    <th key={h} style={{ padding:"14px 16px", fontFamily:"Montserrat,sans-serif", fontSize:"8px", letterSpacing:"2px", color:"#6b5a3e", textTransform:"uppercase", textAlign: i===7 ? "right" : "left", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({length:6}).map((_,i)=><SkeletonRow key={i}/>)
                  : paginated.map((order,i)=>(
                    <tr key={order._id} className="order-row"
                      style={{ borderBottom: i===paginated.length-1 ? "none" : "1px solid rgba(200,169,110,0.07)", transition:"background 0.15s" }}>
                      {/* Order ID */}
                      <td style={{ padding:"14px 16px" }}>
                        <span style={{ fontFamily:"'Courier New',monospace", fontSize:"11px", color:"#c8a96e", fontWeight:600 }}>
                          {(order.razorpayOrderId||order._id||"").slice(-10)}
                        </span>
                      </td>
                      {/* Customer */}
                      <td style={{ padding:"14px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                          <div style={{ width:"30px", height:"30px", borderRadius:"50%", background:"linear-gradient(135deg,#c8a96e,#a07840)", display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1a1a", fontFamily:"Montserrat,sans-serif", fontSize:"10px", fontWeight:700, flexShrink:0 }}>
                            {avatarLetter(getCustomerName(order))}
                          </div>
                          <div>
                            <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"11px", color:"var(--text-primary)", fontWeight:500
, margin:0 }}>{getCustomerName(order)}</p>
                            <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"9px", color:"#6b5a3e", margin:0 }}>{getCustomerEmail(order)}</p>
                          </div>
                        </div>
                      </td>
                      {/* Items */}
                      <td style={{ padding:"14px 16px" }}>
                        <span style={{ fontFamily:"Montserrat,sans-serif", fontSize:"11px", color:"#6b5a3e" }}>
                          {(order.items||[]).map((it)=>`${it.name} ×${it.quantity||it.qty||1}`).join(", ").slice(0,30)}{(order.items||[]).length>1?"...":""}
                        </span>
                        <span style={{ fontFamily:"Montserrat,sans-serif", fontSize:"9px", color:"#3d2f1a", display:"block", marginTop:"2px" }}>
                          {(order.items||[]).reduce((s,it)=>s+(it.quantity||it.qty||1),0)} item(s)
                        </span>
                      </td>
                      {/* Amount */}
                      <td style={{ padding:"14px 16px" }}>
                        <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"16px", color:"var(--text-primary)", fontWeight:600 }}>{formatCurrency(order.amount
||order.total)}</span>
                        <span style={{ fontFamily:"Montserrat,sans-serif", fontSize:"9px", color:"#3d2f1a", display:"block" }}>{order.paymentMethod||"Razorpay"}</span>
                      </td>
                      {/* Order Status */}
                      <td style={{ padding:"14px 16px" }}><Badge label={order.orderStatus} colorMap={orderStatusColors} /></td>
                      {/* Payment */}
                      <td style={{ padding:"14px 16px" }}><Badge label={order.paymentStatus} colorMap={paymentStatusColors} /></td>
                      {/* Date */}
                      <td style={{ padding:"14px 16px" }}>
                        <span style={{ fontFamily:"Montserrat,sans-serif", fontSize:"10px", color:"#6b5a3e" }}>{formatDate(order.createdAt)}</span>
                      </td>
                      {/* Actions */}
                      <td style={{ padding:"14px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:"6px" }}>
                          <IconBtn onClick={()=>setViewOrder(order)} title="View" hoverColor="#7aa0ff">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </IconBtn>
                          <IconBtn onClick={()=>openEditModal(order)} title="Edit Status" hoverColor="#c8a96e">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </IconBtn>
                          <IconBtn onClick={()=>setDeleteModal(order)} title="Delete" hoverColor="#f87171">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))
                }
                {!loading && filtered.length===0 && (
                  <tr><td colSpan={8} style={{ padding:"60px 0", textAlign:"center" }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"12px" }}>
                      <div style={{ width:"52px", height:"52px", borderRadius:"10px", background:"rgba(200,169,110,0.08)", border:"1px solid rgba(200,169,110,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:"#6b5a3e" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      </div>
                      <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"18px", color:"#6b5a3e", fontStyle:"italic" }}>No orders found</p>
                      <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"10px", color:"#3d2f1a" }}>Try adjusting your search or filters</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div style={{ borderTop:"1px solid rgba(200,169,110,0.12)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
            <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"10px", color:"#6b5a3e" }}>
              Showing <span style={{ color:"#c8a96e" }}>{filtered.length===0 ? 0 : (currentPage-1)*rowsPerPage+1}</span> – <span style={{ color:"#c8a96e" }}>{Math.min(currentPage*rowsPerPage,filtered.length)}</span> of <span style={{ color:"#c8a96e" }}>{filtered.length}</span> orders
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <button onClick={()=>setCurrentPage((p)=>Math.max(p-1,1))} disabled={currentPage===1} className="pagination-btn"
                style={{ padding:"6px 12px", borderRadius:"6px", border:"1px solid rgba(200,169,110,0.2)", background:"transparent", color:"#6b5a3e", cursor:"pointer", fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"1px", transition:"all 0.2s", opacity:currentPage===1?0.3:1 }}>← Prev</button>
              {Array.from({length:totalPages},(_,i)=>i+1)
                .filter((p)=>p===1||p===totalPages||Math.abs(p-currentPage)<=1)
                .reduce((acc,p,idx,arr)=>{if(idx>0&&p-arr[idx-1]>1)acc.push("...");acc.push(p);return acc;},[])
                .map((p,idx)=>p==="..."
                  ? <span key={`d${idx}`} style={{ color:"#3d2f1a", fontFamily:"Montserrat,sans-serif", fontSize:"10px", padding:"0 4px" }}>…</span>
                  : <button key={p} onClick={()=>setCurrentPage(p)}
                      style={{ width:"30px", height:"30px", borderRadius:"6px", border:"1px solid", borderColor:currentPage===p?"#c8a96e":"rgba(200,169,110,0.2)", background:currentPage===p?"rgba(200,169,110,0.15)":"transparent", color:currentPage===p?"#c8a96e":"#6b5a3e", fontFamily:"Montserrat,sans-serif", fontSize:"10px", cursor:"pointer", transition:"all 0.2s" }}>{p}</button>
                )}
              <button onClick={()=>setCurrentPage((p)=>Math.min(p+1,totalPages))} disabled={currentPage===totalPages||totalPages===0} className="pagination-btn"
                style={{ padding:"6px 12px", borderRadius:"6px", border:"1px solid rgba(200,169,110,0.2)", background:"transparent", color:"#6b5a3e", cursor:"pointer", fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"1px", transition:"all 0.2s", opacity:(currentPage===totalPages||totalPages===0)?0.3:1 }}>Next →</button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          EDIT MODAL
      ══════════════════════════════════════════════ */}
      {editOrder && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)"
, borderRadius:"16px", padding:"28px", width:"100%", maxWidth:"420px", boxShadow:"0 30px 80px rgba(0,0,0,0.6)", animation:"fadeIn 0.2s ease" }}>
            <div style={{ height:"2px", background:"linear-gradient(90deg,#c8a96e00,#c8a96e,#c8a96e00)", borderRadius:"2px", marginBottom:"24px" }} />
            <h3 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"22px", color:"var(--text-primary)", fontWeight:300, fontStyle:"italic"
, marginBottom:"4px" }}>Update Order</h3>
            <p style={{ fontFamily:"'Courier New',monospace", fontSize:"10px", color:"#6b5a3e", marginBottom:"20px" }}>{editOrder.razorpayOrderId||editOrder._id}</p>

            {/* Customer summary */}
            <div style={{ background:"rgba(200,169,110,0.05)", border:"1px solid rgba(200,169,110,0.12)", borderRadius:"8px", padding:"12px 14px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px" }}>
              <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"linear-gradient(135deg,#c8a96e,#a07840)", display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1a1a", fontFamily:"Montserrat,sans-serif", fontSize:"10px", fontWeight:700, flexShrink:0 }}>
                {avatarLetter(getCustomerName(editOrder))}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"11px", color:"var(--text-primary)", fontWeight:500
, margin:0 }}>{getCustomerName(editOrder)}</p>
                <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"9px", color:"#6b5a3e", margin:0 }}>{getCustomerEmail(editOrder)}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"18px", color:"#c8a96e", fontWeight:600, margin:0 }}>{formatCurrency(editOrder.amount||editOrder.total)}</p>
                <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"9px", color:"#3d2f1a", margin:0 }}>{editOrder.paymentMethod||"Razorpay"}</p>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {/* Order Status */}
              <div>
                <Label>Order Status *</Label>
                <select value={editOrder.orderStatus} onChange={(e)=>handleEditChange("orderStatus",e.target.value)} onBlur={()=>handleEditBlur("orderStatus")} style={{ ...selectStyle, border:`1px solid ${editTouched.orderStatus&&editErrors.orderStatus?"#c0392b":"rgba(200,169,110,0.2)"}` }}
                  onFocus={e=>e.target.style.borderColor="#c8a96e"} onBlur_={()=>{}}>
                  {["Processing","Shipped","Delivered","Cancelled"].map((s)=><option key={s} value={s}>{s}</option>)}
                </select>
                {editTouched.orderStatus && <FieldError msg={editErrors.orderStatus} />}
              </div>

              {/* Payment Status */}
              <div>
                <Label>Payment Status *</Label>
                <select value={editOrder.paymentStatus} onChange={(e)=>handleEditChange("paymentStatus",e.target.value)} onBlur={()=>handleEditBlur("paymentStatus")} style={{ ...selectStyle, border:`1px solid ${editTouched.paymentStatus&&editErrors.paymentStatus?"#c0392b":"rgba(200,169,110,0.2)"}` }}
                  onFocus={e=>e.target.style.borderColor="#c8a96e"} onBlur_={()=>{}}>
                  {["Pending","Paid","Failed"].map((s)=><option key={s} value={s}>{s}</option>)}
                </select>
                {editTouched.paymentStatus && <FieldError msg={editErrors.paymentStatus} />}
              </div>

              {/* Live preview */}
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ fontFamily:"Montserrat,sans-serif", fontSize:"9px", color:"#3d2f1a", letterSpacing:"1px" }}>PREVIEW</span>
                <Badge label={editOrder.orderStatus} colorMap={orderStatusColors} />
                <Badge label={editOrder.paymentStatus} colorMap={paymentStatusColors} />
              </div>

              {editSaveError && (
                <div style={{ background:"rgba(192,57,43,0.1)", border:"1px solid rgba(192,57,43,0.3)", borderRadius:"6px", padding:"10px 14px" }}>
                  <p style={{ color:"#f87171", fontFamily:"Montserrat,sans-serif", fontSize:"11px" }}>{editSaveError}</p>
                </div>
              )}
            </div>

            <div style={{ display:"flex", gap:"10px", marginTop:"24px" }}>
              <button onClick={()=>setEditOrder(null)}
                style={{ flex:1, padding:"12px", borderRadius:"8px", border:"1px solid rgba(200,169,110,0.2)", background:"transparent", color:"#6b5a3e", fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", cursor:"pointer", transition:"all 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#c8a96e"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(200,169,110,0.2)"}>Cancel</button>
              <button onClick={handleEditSave} disabled={saving}
                style={{ flex:1, padding:"12px", borderRadius:"8px", border:"none", background:"linear-gradient(135deg,#c8a96e,#a07840)", color:"#1a1a1a", fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", fontWeight:700, cursor:"pointer", opacity:saving?0.6:1, transition:"opacity 0.2s" }}>
                {saving ? "Saving..." : "Update Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          VIEW MODAL
      ══════════════════════════════════════════════ */}
      {viewOrder && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)"
, borderRadius:"16px", padding:"28px", width:"100%", maxWidth:"500px", boxShadow:"0 30px 80px rgba(0,0,0,0.6)", maxHeight:"90vh", overflowY:"auto", animation:"fadeIn 0.2s ease" }}>
            <div style={{ height:"2px", background:"linear-gradient(90deg,#c8a96e00,#c8a96e,#c8a96e00)", borderRadius:"2px", marginBottom:"24px" }} />
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"20px" }}>
              <div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"22px", color:"var(--text-primary)", fontWeight:300, fontStyle:"italic", margin:"0 0 4px"
 }}>Order Details</h3>
                <p style={{ fontFamily:"'Courier New',monospace", fontSize:"10px", color:"#6b5a3e", margin:0 }}>{viewOrder.razorpayOrderId||viewOrder._id}</p>
              </div>
              <button onClick={()=>setViewOrder(null)} style={{ background:"none", border:"1px solid rgba(200,169,110,0.2)", borderRadius:"6px", color:"#6b5a3e", cursor:"pointer", padding:"6px", transition:"all 0.2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#c8a96e";e.currentTarget.style.color="#c8a96e";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(200,169,110,0.2)";e.currentTarget.style.color="#6b5a3e";}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Customer */}
            <div style={{ background:"rgba(200,169,110,0.05)", border:"1px solid rgba(200,169,110,0.12)", borderRadius:"8px", padding:"12px 14px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" }}>
              <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"linear-gradient(135deg,#c8a96e,#a07840)", display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1a1a", fontFamily:"Montserrat,sans-serif", fontSize:"10px", fontWeight:700, flexShrink:0 }}>
                {avatarLetter(getCustomerName(viewOrder))}
              </div>
              <div>
                <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"12px", color:"var(--text-primary)", fontWeight:500
, margin:0 }}>{getCustomerName(viewOrder)}</p>
                <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"9px", color:"#6b5a3e", margin:0 }}>{getCustomerEmail(viewOrder)}</p>
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom:"16px" }}>
              <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"8px", letterSpacing:"2px", color:"#6b5a3e", textTransform:"uppercase", marginBottom:"8px" }}>Items Ordered</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {(viewOrder.items||[]).map((item,idx)=>(
                  <div key={idx} style={{ display:"flex", alignItems:"center", gap:"10px", background:"rgba(200,169,110,0.04)", border:"1px solid rgba(200,169,110,0.1)", borderRadius:"6px", padding:"10px 12px" }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ width:"36px", height:"36px", objectFit:"cover", borderRadius:"4px" }} />}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"11px", color:"var(--text-primary)", fontWeight:500
, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</p>
                      {(item.size||item.color) && <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"9px", color:"#6b5a3e", margin:0 }}>{[item.color,item.size].filter(Boolean).join(" · ")}</p>}
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"11px", color:"#c8a96e", fontWeight:600, margin:0 }}>×{item.quantity||item.qty||1}</p>
                      <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"9px", color:"#6b5a3e", margin:0 }}>{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            {viewOrder.address && (
              <div style={{ marginBottom:"16px" }}>
                <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"8px", letterSpacing:"2px", color:"#6b5a3e", textTransform:"uppercase", marginBottom:"8px" }}>Delivery Address</p>
                <div style={{ background:"rgba(200,169,110,0.04)", border:"1px solid rgba(200,169,110,0.1)", borderRadius:"6px", padding:"12px 14px", fontFamily:"Montserrat,sans-serif", fontSize:"11px", color:"#c0a882", lineHeight:"1.6" }}>
                  {typeof viewOrder.address==="string" ? viewOrder.address
                    : `${viewOrder.address.line1||""} ${viewOrder.address.line2||""} ${viewOrder.address.city||""} ${viewOrder.address.state||""} ${viewOrder.address.pincode||""}`.trim()}
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"16px" }}>
              {[
                { label:"Total Amount",   value:formatCurrency(viewOrder.amount||viewOrder.total) },
                { label:"Payment Method", value:viewOrder.paymentMethod||"Razorpay" },
                { label:"Order Date",     value:formatDate(viewOrder.createdAt) },
                { label:"Razorpay ID",    value:viewOrder.razorpayPaymentId?.slice(-8)||"—" },
              ].map(({label,value})=>(
                <div key={label} style={{ background:"rgba(200,169,110,0.04)", border:"1px solid rgba(200,169,110,0.1)", borderRadius:"6px", padding:"10px 12px" }}>
                  <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"8px", letterSpacing:"1.5px", color:"#6b5a3e", textTransform:"uppercase", marginBottom:"4px" }}>{label}</p>
                  <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"11px", color:"var(--text-primary)", fontWeight:500
, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"20px" }}>
              <Badge label={viewOrder.orderStatus} colorMap={orderStatusColors} />
              <Badge label={viewOrder.paymentStatus} colorMap={paymentStatusColors} />
            </div>

            <button onClick={()=>setViewOrder(null)}
              style={{ width:"100%", padding:"12px", borderRadius:"8px", border:"1px solid rgba(200,169,110,0.2)", background:"transparent", color:"#6b5a3e", fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", cursor:"pointer", transition:"all 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#c8a96e"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(200,169,110,0.2)"}>Close</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          DELETE MODAL
      ══════════════════════════════════════════════ */}
      {deleteModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
          <div style={{ background:"var(--bg-card)", border:"1px solid rgba(192,57,43,0.3)"
, borderRadius:"16px", padding:"28px", width:"100%", maxWidth:"360px", boxShadow:"0 30px 80px rgba(0,0,0,0.6)", animation:"fadeIn 0.2s ease" }}>
            <div style={{ width:"48px", height:"48px", borderRadius:"10px", background:"rgba(192,57,43,0.1)", border:"1px solid rgba(192,57,43,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#f87171", marginBottom:"16px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"20px", color:"var(--text-primary)", fontWeight:300, fontStyle:"italic"
, marginBottom:"8px" }}>Delete Order</h3>
            <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"11px", color:"#6b5a3e", marginBottom:"4px" }}>
              Delete order <span style={{ color:"#c8a96e", fontFamily:"'Courier New',monospace" }}>{(deleteModal.razorpayOrderId||deleteModal._id||"").slice(-10)}</span>?
            </p>
            <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"10px", color:"#3d2f1a", marginBottom:"24px" }}>This action cannot be undone.</p>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={()=>setDeleteModal(null)}
                style={{ flex:1, padding:"12px", borderRadius:"8px", border:"1px solid rgba(200,169,110,0.2)", background:"transparent", color:"#6b5a3e", fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", cursor:"pointer", transition:"all 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#c8a96e"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(200,169,110,0.2)"}>Cancel</button>
              <button onClick={()=>handleDelete(deleteModal._id)}
                style={{ flex:1, padding:"12px", borderRadius:"8px", border:"none", background:"rgba(192,57,43,0.8)", color:"#fff", fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", fontWeight:700, cursor:"pointer", transition:"background 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(192,57,43,1)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(192,57,43,0.8)"}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          FILTER DRAWER
      ══════════════════════════════════════════════ */}
      {filterOpen && <div onClick={()=>setFilterOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", zIndex:40 }} />}
      <div style={{ position:"fixed", top:0, right:0, height:"100%", width:"300px", background:"var(--bg-card)", borderLeft:"1px solid var(--border)", color:"var(--text-primary)", fontWeight:500


, zIndex:50, display:"flex", flexDirection:"column", transform:filterOpen?"translateX(0)":"translateX(100%)", transition:"transform 0.3s ease", boxShadow:"-20px 0 60px rgba(0,0,0,0.5)" }}>
        <div style={{ height:"2px", background:"linear-gradient(90deg,#c8a96e00,#c8a96e,#c8a96e00)" }} />
        <div style={{ padding:"24px 20px 16px", borderBottom:"1px solid rgba(200,169,110,0.1)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"20px", color:"var(--text-primary)", fontWeight:300, fontStyle:"italic"
, margin:0 }}>Filters</h3>
            {activeFilters>0 && <span style={{ background:"rgba(200,169,110,0.15)", border:"1px solid rgba(200,169,110,0.3)", color:"#c8a96e", fontFamily:"Montserrat,sans-serif", fontSize:"9px", letterSpacing:"1px", padding:"3px 8px", borderRadius:"20px", fontWeight:700 }}>{activeFilters} active</span>}
          </div>
          <button onClick={()=>setFilterOpen(false)} style={{ background:"none", border:"1px solid rgba(200,169,110,0.2)", borderRadius:"6px", color:"#6b5a3e", cursor:"pointer", padding:"6px", transition:"all 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor="#c8a96e";e.currentTarget.style.color="#c8a96e";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(200,169,110,0.2)";e.currentTarget.style.color="#6b5a3e";}}>✕</button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"20px" }}>
          {/* Search */}
          <div style={{ marginBottom:"20px" }}>
            <Label>Search</Label>
            <input type="text" placeholder="Order ID, customer..." value={draftSearch} onChange={(e)=>setDraftSearch(e.target.value)} style={S.input(false)} onFocus={e=>e.target.style.borderColor="#c8a96e"} onBlur={e=>e.target.style.borderColor="rgba(200,169,110,0.2)"} />
          </div>

          {/* Order Status */}
          <div style={{ marginBottom:"20px" }}>
            <Label>Order Status</Label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px" }}>
              {["Processing","Shipped","Delivered","Cancelled"].map((s)=>(
                <button key={s} onClick={()=>setDraftOrderStatus(draftOrderStatus===s?"":s)}
                  style={{ padding:"8px", borderRadius:"6px", border:`1px solid ${draftOrderStatus===s?"#c8a96e":"rgba(200,169,110,0.15)"}`, background:draftOrderStatus===s?"rgba(200,169,110,0.1)":"rgba(255,255,255,0.02)", color:draftOrderStatus===s?"#c8a96e":"#6b5a3e", fontFamily:"Montserrat,sans-serif", fontSize:"9px", letterSpacing:"1px", cursor:"pointer", transition:"all 0.2s" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div style={{ marginBottom:"20px" }}>
            <Label>Payment Status</Label>
            <div style={{ display:"flex", gap:"6px" }}>
              {["Paid","Pending","Failed"].map((s)=>(
                <button key={s} onClick={()=>setDraftPaymentStatus(draftPaymentStatus===s?"":s)}
                  style={{ flex:1, padding:"8px", borderRadius:"6px", border:`1px solid ${draftPaymentStatus===s?"#c8a96e":"rgba(200,169,110,0.15)"}`, background:draftPaymentStatus===s?"rgba(200,169,110,0.1)":"rgba(255,255,255,0.02)", color:draftPaymentStatus===s?"#c8a96e":"#6b5a3e", fontFamily:"Montserrat,sans-serif", fontSize:"9px", letterSpacing:"1px", cursor:"pointer", transition:"all 0.2s" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <Label>Sort By</Label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px" }}>
              {[["newest","Newest"],["oldest","Oldest"],["high","Price ↑"],["low","Price ↓"]].map(([val,label])=>(
                <button key={val} onClick={()=>setDraftSort(draftSort===val?"":val)}
                  style={{ padding:"8px", borderRadius:"6px", border:`1px solid ${draftSort===val?"#c8a96e":"rgba(200,169,110,0.15)"}`, background:draftSort===val?"rgba(200,169,110,0.1)":"rgba(255,255,255,0.02)", color:draftSort===val?"#c8a96e":"#6b5a3e", fontFamily:"Montserrat,sans-serif", fontSize:"9px", letterSpacing:"1px", cursor:"pointer", transition:"all 0.2s" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding:"16px 20px", borderTop:"1px solid rgba(200,169,110,0.1)", display:"flex", gap:"10px" }}>
          <button onClick={()=>{ setDraftSearch("");setDraftOrderStatus("");setDraftPaymentStatus("");setDraftSort("");setFilterSearch("");setFilterOrderStatus("");setFilterPaymentStatus("");setSortOrder("");setCurrentPage(1);setFilterOpen(false); }}
            style={{ flex:1, padding:"12px", borderRadius:"8px", border:"1px solid rgba(200,169,110,0.2)", background:"transparent", color:"#6b5a3e", fontFamily:"Montserrat,sans-serif", fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", cursor:"pointer", transition:"all 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#c8a96e"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(200,169,110,0.2)"}>Reset</button>
          <button onClick={()=>{ setFilterSearch(draftSearch);setFilterOrderStatus(draftOrderStatus);setFilterPaymentStatus(draftPaymentStatus);setSortOrder(draftSort);setCurrentPage(1);setFilterOpen(false); }}
            style={{ flex:1, padding:"12px", borderRadius:"8px", border:"none", background:"linear-gradient(135deg,#c8a96e,#a07840)", color:"#1a1a1a", fontFamily:"Montserrat,sans-serif", fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", fontWeight:700, cursor:"pointer" }}>Apply</button>
        </div>
      </div>
    </div>
  );
}

export default Orders;