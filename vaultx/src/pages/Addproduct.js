import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

// ── Validation ────────────────────────────────────────────────────────────────
const validate = (form, variants) => {
  const e = {};
  if (!form.name.trim())                e.name        = "Product name is required";
  else if (form.name.trim().length < 3) e.name        = "Name must be at least 3 characters";
  if (!form.mainCategory)               e.mainCategory = "Please select a main category";
  variants.forEach((v, vIdx) => {
    if (!v.color.trim()) e[`variant_color_${vIdx}`] = "Color name is required";
    v.sizes.forEach((s, sIdx) => {
      if (!s.size.trim())                                                       e[`variant_${vIdx}_size_${sIdx}`]     = "Size is required";
      if (!s.sellingPrice || Number(s.sellingPrice) <= 0)                       e[`variant_${vIdx}_price_${sIdx}`]    = "Enter a valid selling price";
      if (s.originalPrice && Number(s.originalPrice) <= Number(s.sellingPrice)) e[`variant_${vIdx}_origprice_${sIdx}`] = "Original price must be greater than selling price";
    });
  });
  return e;
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const S = {
  input: (err) => ({
    width: "100%",
    background: "var(--bg-input)",
    border: `1px solid ${err ? "#c0392b" : "var(--border-input)"}`,
    borderRadius: "6px", padding: "10px 14px",
    color: "var(--text-primary)",
    fontSize: "13px", outline: "none",
    fontFamily: "Montserrat, sans-serif",
    transition: "border-color 0.2s",
  }),
  label: {
    display: "block", fontFamily: "Montserrat, sans-serif",
    fontSize: "9px", letterSpacing: "2px",
    color: "var(--text-muted)", textTransform: "uppercase",
    marginBottom: "6px", fontWeight: 600
  },
  card: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "12px", padding: "24px", marginBottom: "16px"
  },
  err: {
    color: "#c0392b", fontSize: "11px", marginTop: "4px",
    fontFamily: "Montserrat, sans-serif", minHeight: "16px",
    display: "flex", alignItems: "center", gap: "4px"
  },
};

const FieldError = ({ msg }) => <p style={S.err}>{msg && <><span>⚠</span>{msg}</>}</p>;
const Label = ({ children }) => <label style={S.label}>{children}</label>;

const calcDiscount = (selling, original) => {
  const s = Number(selling), o = Number(original);
  if (!s || !o || o <= s) return "";
  return Math.round(((o - s) / o) * 100);
};

// ── CascadingCategory ─────────────────────────────────────────────────────────
const resolveId = (val) => { if (!val) return null; if (typeof val === "string") return val; if (typeof val === "object") return val._id ?? val.id ?? null; return null; };

const CascadingCategory = ({ categories, values, touched, errors, onChange, onBlur }) => {
  const mainCats  = categories.filter((c) => c.level === 1 || c.level === "1" || c.level === "Main" || c.level === "main" || (!c.parent && !c.parentId && !c.parentCategory));
  const childCats = categories.filter((c) => { const pid = resolveId(c.parent ?? c.parentId ?? c.parentCategory); return (c.level === 2 || c.level === "2" || c.level === "Child" || c.level === "child") && pid === values.mainCategory; });
  const subCats   = categories.filter((c) => { const pid = resolveId(c.parent ?? c.parentId ?? c.parentCategory); return (c.level === 3 || c.level === "3" || c.level === "Sub" || c.level === "sub") && pid === values.childCategory; });

  const handleMain  = (id) => { onChange({ mainCategory: id, childCategory: "", subCategory: "" }); onBlur("mainCategory"); };
  const handleChild = (id) => onChange({ ...values, childCategory: id, subCategory: "" });
  const handleSub   = (id) => onChange({ ...values, subCategory: id });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div>
        <Label>Main Category *</Label>
        <select value={values.mainCategory} onChange={(e) => handleMain(e.target.value)} style={{ ...S.input(touched.mainCategory && errors.mainCategory), cursor: "pointer" }}>
          <option value="" style={{ background: "var(--bg-card)" }}>— Select main category —</option>
          {mainCats.map((c) => <option key={c._id} value={c._id} style={{ background: "var(--bg-card)" }}>{c.name}</option>)}
        </select>
        <FieldError msg={touched.mainCategory ? errors.mainCategory : ""} />
      </div>
      {values.mainCategory && (
        <div>
          <Label>Child Category</Label>
          <select value={values.childCategory} onChange={(e) => handleChild(e.target.value)} disabled={childCats.length === 0} style={{ ...S.input(false), cursor: "pointer", opacity: childCats.length === 0 ? 0.5 : 1 }}>
            <option value="" style={{ background: "var(--bg-card)" }}>{childCats.length === 0 ? "No sub-categories available" : "— Select child category (optional) —"}</option>
            {childCats.map((c) => <option key={c._id} value={c._id} style={{ background: "var(--bg-card)" }}>{c.name}</option>)}
          </select>
          <FieldError msg="" />
        </div>
      )}
      {values.childCategory && subCats.length > 0 && (
        <div>
          <Label>Sub Category</Label>
          <select value={values.subCategory} onChange={(e) => handleSub(e.target.value)} style={{ ...S.input(false), cursor: "pointer" }}>
            <option value="" style={{ background: "var(--bg-card)" }}>— Select sub category (optional) —</option>
            {subCats.map((c) => <option key={c._id} value={c._id} style={{ background: "var(--bg-card)" }}>{c.name}</option>)}
          </select>
          <FieldError msg="" />
        </div>
      )}
      <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", color: "#3d2f1a" }}>Child and sub-category are optional</p>
    </div>
  );
};

// ── VariantBlock ──────────────────────────────────────────────────────────────
const VariantBlock = ({ variant, vIdx, onUpdate, onRemove, onAddImages, onRemoveImage, errors }) => {
  const fileRef = useRef();
  const updateColor = (field, value) => onUpdate(vIdx, { ...variant, [field]: value });
  const updateSize  = (sIdx, field, value) => {
    const sizes = variant.sizes.map((s, i) => {
      if (i !== sIdx) return s;
      const updated = { ...s, [field]: value };
      if (field === "sellingPrice" || field === "originalPrice") updated.discount = calcDiscount(field === "sellingPrice" ? value : s.sellingPrice, field === "originalPrice" ? value : s.originalPrice);
      return updated;
    });
    onUpdate(vIdx, { ...variant, sizes });
  };
  const addSize    = () => onUpdate(vIdx, { ...variant, sizes: [...variant.sizes, { size: "", sellingPrice: "", originalPrice: "", discount: "" }] });
  const removeSize = (sIdx) => { if (variant.sizes.length === 1) return; onUpdate(vIdx, { ...variant, sizes: variant.sizes.filter((_, i) => i !== sIdx) }); };

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
      {/* Color header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "6px", border: "2px solid rgba(200,169,110,0.3)", overflow: "hidden", flexShrink: 0, cursor: "pointer", position: "relative" }}>
            <input type="color" value={variant.colorHex || "#000000"} onChange={(e) => updateColor("colorHex", e.target.value)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
            <div style={{ width: "100%", height: "100%", backgroundColor: variant.colorHex || "#000000" }} />
          </div>
          <div style={{ flex: 1 }}>
            <input type="text" value={variant.color} onChange={(e) => updateColor("color", e.target.value)} placeholder="Color name (e.g. Midnight Black)" style={S.input(errors[`variant_color_${vIdx}`])} onFocus={e => e.target.style.borderColor = "#c8a96e"} onBlur={e => e.target.style.borderColor = errors[`variant_color_${vIdx}`] ? "#c0392b" : "rgba(200,169,110,0.2)"} />
            <FieldError msg={errors[`variant_color_${vIdx}`]} />
          </div>
        </div>
        <button onClick={() => onRemove(vIdx)} style={{ marginLeft: "12px", padding: "8px", borderRadius: "6px", background: "transparent", border: "none", color: "var(--text-faint)", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.color = "#c0392b"} onMouseLeave={e => e.currentTarget.style.color = "#6b5a3e"}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      {/* Size/Price Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["SIZE", "SELLING ₹ *", "ORIGINAL ₹", "DISCOUNT", ""].map((h) => (
                <th key={h} style={{ fontFamily: "Montserrat, sans-serif", fontSize: "8px", letterSpacing: "2px", color: "var(--text-faint)", textTransform: "uppercase", textAlign: "left", paddingBottom: "8px", paddingRight: "8px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variant.sizes.map((s, sIdx) => (
              <tr key={sIdx}>
                <td style={{ paddingRight: "8px" }}><input type="text" placeholder="M" value={s.size} onChange={(e) => updateSize(sIdx, "size", e.target.value)} style={{ ...S.input(errors[`variant_${vIdx}_size_${sIdx}`]), width: "80px" }} /><FieldError msg={errors[`variant_${vIdx}_size_${sIdx}`]} /></td>
                <td style={{ paddingRight: "8px" }}><input type="number" placeholder="0" min="1" value={s.sellingPrice} onChange={(e) => updateSize(sIdx, "sellingPrice", e.target.value)} onKeyDown={(e) => ["-", "+", "e"].includes(e.key) && e.preventDefault()} style={{ ...S.input(errors[`variant_${vIdx}_price_${sIdx}`]), width: "100px" }} /><FieldError msg={errors[`variant_${vIdx}_price_${sIdx}`]} /></td>
                <td style={{ paddingRight: "8px" }}><input type="number" placeholder="0" min="1" value={s.originalPrice} onChange={(e) => updateSize(sIdx, "originalPrice", e.target.value)} onKeyDown={(e) => ["-", "+", "e"].includes(e.key) && e.preventDefault()} style={{ ...S.input(errors[`variant_${vIdx}_origprice_${sIdx}`]), width: "100px" }} /><FieldError msg={errors[`variant_${vIdx}_origprice_${sIdx}`]} /></td>
                <td style={{ paddingRight: "8px" }}>
                  <div style={{ position: "relative" }}>
                    <input readOnly value={s.discount ? `${s.discount}%` : "Auto"} style={{ ...S.input(false), width: "90px", color: "var(--text-faint)" }} />
                    {s.discount && <span style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", background: "#c8a96e", color: "#1a1a1a", fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px", fontFamily: "Montserrat, sans-serif" }}>{s.discount}% OFF</span>}
                  </div>
                  <FieldError msg="" />
                </td>
                <td>
                  <button onClick={() => removeSize(sIdx)} disabled={variant.sizes.length === 1} style={{ padding: "8px", background: "transparent", border: "none", color: "var(--text-faint)", cursor: "pointer", opacity: variant.sizes.length === 1 ? 0.3 : 1 }} onMouseEnter={e => e.currentTarget.style.color = "#c0392b"} onMouseLeave={e => e.currentTarget.style.color = "#6b5a3e"}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <FieldError msg="" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addSize} style={{ background: "transparent", border: "none", color: "#c8a96e", fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "1px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Add Size Row
      </button>

      {/* Images */}
      {variant.images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "12px" }}>
          {variant.images.map((img, i) => (
            <div key={i} className="group relative aspect-square rounded overflow-hidden" style={{ border: "1px solid rgba(200,169,110,0.2)" }}>
              <img src={img.preview || img.url || img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {i === 0 && <span style={{ position: "absolute", top: "4px", left: "4px", background: "#c8a96e", color: "#1a1a1a", fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px", fontFamily: "Montserrat, sans-serif" }}>MAIN</span>}
              <button onClick={() => onRemoveImage(vIdx, i)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-semibold">Remove</button>
            </div>
          ))}
        </div>
      )}

      {variant.images.length < 6 && (
        <>
          <button type="button" onClick={() => fileRef.current.click()} style={{ width: "100%", border: "1px dashed rgba(200,169,110,0.3)", background: "transparent", color: "var(--text-faint)", fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "1px", padding: "10px", borderRadius: "6px", cursor: "pointer", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8a96e"; e.currentTarget.style.color = "#c8a96e"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(200,169,110,0.3)"; e.currentTarget.style.color = "#6b5a3e"; }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add images for this color ({variant.images.length}/6)
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onAddImages(vIdx, e.target.files)} />
        </>
      )}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
function AddProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm]             = useState({ name: "", description: "", isActive: true });
  const [categoryValues, setCategoryValues] = useState({ mainCategory: "", childCategory: "", subCategory: "" });
  const [variants, setVariants]     = useState([{ color: "", colorHex: "#000000", images: [], sizes: [{ size: "", sellingPrice: "", originalPrice: "", discount: "" }] }]);
  const [errors, setErrors]         = useState({});
  const [touched, setTouched]       = useState({});
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);

  useEffect(() => { API.get("/categories?limit=100").then((res) => setCategories(res.data.categories || [])).catch(() => {}); }, []);

  const handle    = (e) => { const { name, value } = e.target; setForm((f) => ({ ...f, [name]: value })); setTouched((t) => ({ ...t, [name]: true })); setErrors((er) => ({ ...er, [name]: "" })); };
  const handleBlur = (name) => { setTouched((t) => ({ ...t, [name]: true })); const errs = validate(form, variants); setErrors((er) => ({ ...er, [name]: errs[name] || "" })); };
  const showToast  = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const updateVariant    = (vIdx, updated) => setVariants((prev) => prev.map((v, i) => (i === vIdx ? updated : v)));
  const addVariant       = () => setVariants((prev) => [...prev, { color: "", colorHex: "#000000", images: [], sizes: [{ size: "", sellingPrice: "", originalPrice: "", discount: "" }] }]);
  const removeVariant    = (vIdx) => { if (variants.length === 1) return; setVariants((prev) => prev.filter((_, i) => i !== vIdx)); };
  const handleAddImages  = (vIdx, files) => { const valid = Array.from(files).filter((f) => f.type.startsWith("image/")); const previews = valid.map((file) => ({ file, preview: URL.createObjectURL(file) })); setVariants((prev) => prev.map((v, i) => { if (i !== vIdx) return v; const remaining = 6 - v.images.length; return { ...v, images: [...v.images, ...previews].slice(0, v.images.length + remaining) }; })); };
  const handleRemoveImage = (vIdx, imgIdx) => { setVariants((prev) => prev.map((v, i) => { if (i !== vIdx) return v; const updated = [...v.images]; if (updated[imgIdx]?.preview) URL.revokeObjectURL(updated[imgIdx].preview); updated.splice(imgIdx, 1); return { ...v, images: updated }; })); };

  const handleSubmit = async () => {
    const combinedForm = { ...form, mainCategory: categoryValues.mainCategory };
    const errs = validate(combinedForm, variants);
    setErrors(errs); setTouched({ name: true, mainCategory: true });
    if (Object.keys(errs).length) { showToast("Please fix the errors above", "error"); return; }
    const resolvedCategory = categoryValues.subCategory || categoryValues.childCategory || categoryValues.mainCategory;
    setLoading(true);
    try {
      const processedVariants = await Promise.all(variants.map(async (variant) => {
        let imageUrls = [];
        const newImgs = variant.images.filter((img) => img.file);
        if (newImgs.length > 0) { const formData = new FormData(); newImgs.forEach((img) => formData.append("images", img.file)); const res = await API.post("/upload/products", formData); imageUrls = res.data.urls; }
        return { color: variant.color.trim(), colorHex: variant.colorHex, images: imageUrls, sizes: variant.sizes.map((s) => ({ size: s.size.trim(), sellingPrice: Number(s.sellingPrice), originalPrice: s.originalPrice ? Number(s.originalPrice) : undefined, discount: s.discount ? Number(s.discount) : undefined })) };
      }));
      await API.post("/products", { name: form.name.trim(), description: form.description.trim(), category: resolvedCategory, variants: processedVariants, isActive: form.isActive });
      showToast("Product created successfully!");
      setTimeout(() => navigate("/product"), 1500);
    } catch (err) { showToast(err.response?.data?.message || "Failed to create product", "error"); }
    finally { setLoading(false); }
  };

  const sectionNum = (n) => (
    <div style={{ width: "22px", height: "22px", borderRadius: "4px", background: "linear-gradient(135deg, #c8a96e, #a07840)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "10px", fontWeight: 700, flexShrink: 0 }}>{n}</div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "32px 16px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <button onClick={() => navigate("/product")} style={{ padding: "8px", borderRadius: "6px", border: "1px solid rgba(200,169,110,0.2)", background: "transparent", color: "var(--text-faint)", cursor: "pointer", display: "flex", alignItems: "center" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8a96e"; e.currentTarget.style.color = "#c8a96e"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(200,169,110,0.2)"; e.currentTarget.style.color = "#6b5a3e"; }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", color: "var(--text-primary)", fontWeight: 300, fontStyle: "italic", margin: 0 }}>Add New Product</h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1px", color: "var(--text-faint)", marginTop: "4px" }}>Fill in all required fields marked with *</p>
          </div>
        </div>

        {/* 1. Basic Info */}
        <div style={S.card}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            {sectionNum(1)}
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", color: "var(--text-primary)", fontWeight: 400, fontStyle: "italic", margin: 0 }}>Basic Information</h2>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <Label>Product Name *</Label>
            <input name="name" value={form.name} onChange={handle} onBlur={() => handleBlur("name")} placeholder="e.g. Lotus Wax Candle" style={S.input(touched.name && errors.name)} onFocus={e => e.target.style.borderColor = "#c8a96e"} onBlur_={() => {}} />
            <FieldError msg={touched.name ? errors.name : ""} />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <Label>Description</Label>
            <textarea name="description" value={form.description} onChange={handle} placeholder="Short product description..." rows={3} style={{ ...S.input(false), resize: "none" }} onFocus={e => e.target.style.borderColor = "#c8a96e"} onBlur={e => e.target.style.borderColor = "rgba(200,169,110,0.2)"} />
            <FieldError msg="" />
          </div>
          <CascadingCategory categories={categories} values={categoryValues} touched={touched} errors={errors}
            onChange={(updated) => { setCategoryValues(updated); setErrors((er) => ({ ...er, mainCategory: "" })); }}
            onBlur={(field) => setTouched((t) => ({ ...t, [field]: true }))} />
        </div>

        {/* 2. Variants */}
        <div style={S.card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {sectionNum(2)}
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", color: "var(--text-primary)", fontWeight: 400, fontStyle: "italic", margin: 0 }}>Colors, Sizes & Pricing</h2>
            </div>
            <button onClick={addVariant} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "6px", background: "rgba(200,169,110,0.15)", border: "1px solid rgba(200,169,110,0.3)", color: "#c8a96e", fontFamily: "Montserrat, sans-serif", fontSize: "10px", letterSpacing: "1px", cursor: "pointer" }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Color
            </button>
          </div>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", color: "#3d2f1a", marginBottom: "16px" }}>Each color has its own images and size-specific pricing</p>
          {variants.map((variant, vIdx) => (
            <VariantBlock key={vIdx} variant={variant} vIdx={vIdx} onUpdate={updateVariant} onRemove={removeVariant} onAddImages={handleAddImages} onRemoveImage={handleRemoveImage} errors={errors} />
          ))}
        </div>

        {/* 3. Settings */}
        <div style={S.card}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            {sectionNum(3)}
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", color: "var(--text-primary)", fontWeight: 400, fontStyle: "italic", margin: 0 }}>Settings</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>{form.isActive ? "Active" : "Inactive"}</p>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "10px", color: "var(--text-faint)", marginTop: "2px" }}>{form.isActive ? "Visible on storefront" : "Hidden from storefront"}</p>
            </div>
            <div onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))} style={{ width: "44px", height: "24px", borderRadius: "12px", background: form.isActive ? "#c8a96e" : "rgba(255,255,255,0.1)", position: "relative", cursor: "pointer", transition: "background 0.3s" }}>
              <div style={{ position: "absolute", top: "4px", width: "16px", height: "16px", background: "#fff", borderRadius: "50%", transition: "left 0.3s", left: form.isActive ? "24px" : "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", paddingBottom: "32px" }}>
          <button onClick={() => navigate("/product")} style={{ flex: 1, padding: "14px", borderRadius: "8px", border: "1px solid rgba(200,169,110,0.2)", background: "transparent", color: "var(--text-faint)", fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#c8a96e"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,169,110,0.2)"}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: "14px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #c8a96e, #a07840)", color: "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {loading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Creating...</> : "Add Product"}
          </button>
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", padding: "14px 20px", borderRadius: "8px", background: toast.type === "error" ? "#c0392b" : "#c8a96e", color: toast.type === "error" ? "#fff" : "#1a1a1a", fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "1px", fontWeight: 600, zIndex: 50, display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}>
          {toast.type === "error" ? "✕" : "✓"} {toast.msg}
        </div>
      )}
    </div>
  );
}

export default AddProduct;