import { useState, useEffect } from "react";
import API from "../api/axios";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  // ── Fetch ──
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/reviews/admin/all");
      setReviews(data.reviews || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  // ── Delete ──
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await API.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch { alert("Delete failed!"); }
  };

  // ── Filter ──
  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.user?.name?.toLowerCase().includes(q)  ||
      r.product?.name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q)
    );
  });

  // ── Star ──
  const Stars = ({ rating }) => (
    <div className="flex">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} style={{ width:"14px", height:"14px", color: s <= rating ? "#c8a96e" : "#2a2a2a" }}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-page)", padding:"32px 24px" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom:"32px" }}>
          <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"9px", letterSpacing:"3px", color:"#6b5a3e", textTransform:"uppercase", marginBottom:"8px" }}>Admin / Reviews</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"36px", color:"var(--text-primary)", fontWeight:300, fontStyle:"italic", margin:"0 0 4px" }}>
            Customer Reviews
          </h1>
          <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"10px", color:"#3d2f1a" }}>
            {reviews.length} total reviews
          </p>
        </div>

        {/* Search + Refresh */}
        <div style={{ display:"flex", gap:"10px", marginBottom:"24px" }}>
          <div style={{ position:"relative", flex:1, maxWidth:"300px" }}>
            <input
              type="text"
              placeholder="Search by user, product, comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width:"100%", background:"var(--bg-input)", border:"1px solid rgba(200,169,110,0.2)", borderRadius:"6px", padding:"10px 14px", color:"var(--text-primary)", fontSize:"12px", outline:"none", fontFamily:"Montserrat,sans-serif", boxSizing:"border-box" }}
            />
          </div>
          <button onClick={fetchReviews}
            style={{ padding:"10px 16px", borderRadius:"6px", border:"1px solid rgba(200,169,110,0.2)", background:"transparent", color:"#6b5a3e", cursor:"pointer", fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"1px" }}>
            Refresh
          </button>
        </div>

        {/* Table */}
        <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"12px", overflow:"hidden" }}>
          <div style={{ height:"2px", background:"linear-gradient(90deg,#c8a96e22,#c8a96e88,#c8a96e22)" }} />
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"700px" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(200,169,110,0.12)" }}>
                  {["User","Product","Rating","Comment","Date","Action"].map((h, i) => (
                    <th key={h} style={{ padding:"14px 16px", fontFamily:"Montserrat,sans-serif", fontSize:"8px", letterSpacing:"2px", color:"#6b5a3e", textTransform:"uppercase", textAlign: i === 5 ? "right" : "left" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom:"1px solid rgba(200,169,110,0.08)" }}>
                      {[150,120,80,200,80,60].map((w, j) => (
                        <td key={j} style={{ padding:"14px 16px" }}>
                          <div style={{ height:"10px", width:`${w}px`, background:"rgba(200,169,110,0.08)", borderRadius:"4px" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding:"60px 0", textAlign:"center", fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"18px", color:"#6b5a3e", fontStyle:"italic" }}>
                      No reviews found
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r._id} style={{ borderBottom: i === filtered.length-1 ? "none" : "1px solid rgba(200,169,110,0.07)" }}>
                      {/* User */}
                      <td style={{ padding:"14px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#c8a96e,#a07840)", display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1a1a", fontSize:"10px", fontWeight:700, fontFamily:"Montserrat,sans-serif", flexShrink:0 }}>
                            {r.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"11px", color:"var(--text-primary)", margin:0 }}>{r.user?.name}</p>
                            <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"9px", color:"#6b5a3e", margin:0 }}>{r.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Product */}
                      <td style={{ padding:"14px 16px" }}>
                        <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"11px", color:"var(--text-primary)", margin:0 }}>{r.product?.name || "—"}</p>
                      </td>
                      {/* Rating */}
                      <td style={{ padding:"14px 16px" }}>
                        <Stars rating={r.rating} />
                        <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"9px", color:"#6b5a3e", marginTop:"2px" }}>{r.rating}/5</p>
                      </td>
                      {/* Comment */}
                      <td style={{ padding:"14px 16px", maxWidth:"250px" }}>
                        <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"11px", color:"var(--text-primary)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {r.comment}
                        </p>
                      </td>
                      {/* Date */}
                      <td style={{ padding:"14px 16px" }}>
                        <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"10px", color:"#6b5a3e", margin:0 }}>
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                        </p>
                      </td>
                      {/* Delete */}
                      <td style={{ padding:"14px 16px", textAlign:"right" }}>
                        <button onClick={() => handleDelete(r._id)}
                          style={{ padding:"7px", borderRadius:"6px", border:"1px solid rgba(220,80,80,0.2)", background:"transparent", color:"#f87171", cursor:"pointer", display:"flex", alignItems:"center", marginLeft:"auto" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reviews;