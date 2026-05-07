import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

// ── Validation ────────────────────────────────────────────────────────────────
const validate = (form, variants) => {
  const e = {};
  if (!form.name.trim())                e.name         = "Product name is required";
  else if (form.name.trim().length < 3) e.name         = "Name must be at least 3 characters";
  if (!form.mainCategory)               e.mainCategory = "Please select a main category";
  variants.forEach((v, vIdx) => {
    if (!v.color.trim()) e[`variant_color_${vIdx}`] = "Color name is required";
    v.sizes.forEach((s, sIdx) => {
      if (!s.size.trim())
        e[`variant_${vIdx}_size_${sIdx}`] = "Size is required";
      if (!s.sellingPrice || Number(s.sellingPrice) <= 0)
        e[`variant_${vIdx}_price_${sIdx}`] = "Enter a valid selling price";
      if (s.originalPrice && Number(s.originalPrice) <= Number(s.sellingPrice))
        e[`variant_${vIdx}_origprice_${sIdx}`] = "Original price must be greater than selling price";
    });
  });
  return e;
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

const calcDiscount = (selling, original) => {
  const s = Number(selling), o = Number(original);
  if (!s || !o || o <= s) return "";
  return Math.round(((o - s) / o) * 100);
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const resolveId = (val) => {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object") return val._id ?? val.id ?? null;
  return null;
};

// ── CascadingCategory ─────────────────────────────────────────────────────────
const CascadingCategory = ({ categories, values, touched, errors, onChange, onBlur }) => {
  const mainCats  = categories.filter((c) => c.level===1||c.level==="1"||c.level==="Main"||c.level==="main"||(!c.parent&&!c.parentId&&!c.parentCategory));
  const childCats = categories.filter((c) => { const pid=resolveId(c.parent??c.parentId??c.parentCategory); return (c.level===2||c.level==="2"||c.level==="Child"||c.level==="child")&&pid===values.mainCategory; });
  const subCats   = categories.filter((c) => { const pid=resolveId(c.parent??c.parentId??c.parentCategory); return (c.level===3||c.level==="3"||c.level==="Sub"||c.level==="sub")&&pid===values.childCategory; });

  const selectStyle = {
    ...S.input(false), cursor: "pointer",
    appearance: "none", WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b5a3e' strokeWidth='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "32px",
  };

  const handleMain  = (id) => { onChange({ mainCategory: id, childCategory: "", subCategory: "" }); onBlur("mainCategory"); };
  const handleChild = (id) => onChange({ ...values, childCategory: id, subCategory: "" });
  const handleSub   = (id) => onChange({ ...values, subCategory: id });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div>
        <Label>Main Category *</Label>
        <select value={values.mainCategory} onChange={(e)=>handleMain(e.target.value)} style={{ ...selectStyle, border:`1px solid ${touched.mainCategory&&errors.mainCategory?"#c0392b":"rgba(200,169,110,0.2)"}` }} onFocus={e=>e.target.style.borderColor="#c8a96e"} onBlur={e=>e.target.style.borderColor=touched.mainCategory&&errors.mainCategory?"#c0392b":"rgba(200,169,110,0.2)"}>
          <option value="" style={{ background:"#1a1a1a" }}>— Select main category —</option>
          {mainCats.map((c)=><option key={c._id} value={c._id} style={{ background:"#1a1a1a" }}>{c.name}</option>)}
        </select>
        <FieldError msg={touched.mainCategory ? errors.mainCategory : ""} />
      </div>
      {values.mainCategory && (
        <div>
          <Label>Child Category</Label>
          <select value={values.childCategory} onChange={(e)=>handleChild(e.target.value)} disabled={childCats.length===0} style={{ ...selectStyle, opacity:childCats.length===0?0.5:1 }} onFocus={e=>e.target.style.borderColor="#c8a96e"} onBlur={e=>e.target.style.borderColor="rgba(200,169,110,0.2)"}>
            <option value="" style={{ background:"#1a1a1a" }}>{childCats.length===0?"No child categories available":"— Select child category (optional) —"}</option>
            {childCats.map((c)=><option key={c._id} value={c._id} style={{ background:"#1a1a1a" }}>{c.name}</option>)}
          </select>
          <FieldError msg="" />
        </div>
      )}
      {values.childCategory && subCats.length>0 && (
        <div>
          <Label>Sub Category</Label>
          <select value={values.subCategory} onChange={(e)=>handleSub(e.target.value)} style={selectStyle} onFocus={e=>e.target.style.borderColor="#c8a96e"} onBlur={e=>e.target.style.borderColor="rgba(200,169,110,0.2)"}>
            <option value="" style={{ background:"#1a1a1a" }}>— Select sub category (optional) —</option>
            {subCats.map((c)=><option key={c._id} value={c._id} style={{ background:"#1a1a1a" }}>{c.name}</option>)}
          </select>
          <FieldError msg="" />
        </div>
      )}
      <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"10px", color:"#3d2f1a" }}>Child and sub-category are optional — select for more specific classification</p>
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
      if (field==="sellingPrice"||field==="originalPrice") updated.discount = calcDiscount(field==="sellingPrice"?value:s.sellingPrice, field==="originalPrice"?value:s.originalPrice);
      return updated;
    });
    onUpdate(vIdx, { ...variant, sizes });
  };
  const addSize    = () => onUpdate(vIdx, { ...variant, sizes: [...variant.sizes, { size:"", sellingPrice:"", originalPrice:"", discount:"" }] });
  const removeSize = (sIdx) => { if (variant.sizes.length===1) return; onUpdate(vIdx, { ...variant, sizes: variant.sizes.filter((_,i)=>i!==sIdx) }); };

  return (
    <div style={{ border:"1px solid rgba(200,169,110,0.15)", borderRadius:"8px", padding:"16px", marginBottom:"12px", background:"rgba(255,255,255,0.015)" }}>
      {/* Color header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", flex:1 }}>
          <div style={{ width:"36px", height:"36px", borderRadius:"6px", border:"2px solid rgba(200,169,110,0.3)", overflow:"hidden", flexShrink:0, cursor:"pointer", position:"relative" }}>
            <input type="color" value={variant.colorHex||"#000000"} onChange={(e)=>updateColor("colorHex",e.target.value)} style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0, cursor:"pointer" }} />
            <div style={{ width:"100%", height:"100%", backgroundColor:variant.colorHex||"#000000" }} />
          </div>
          <div style={{ flex:1 }}>
            <input type="text" value={variant.color} onChange={(e)=>updateColor("color",e.target.value)} placeholder="Color name (e.g. Midnight Black)" style={S.input(errors[`variant_color_${vIdx}`])} onFocus={e=>e.target.style.borderColor="#c8a96e"} onBlur={e=>e.target.style.borderColor=errors[`variant_color_${vIdx}`]?"#c0392b":"rgba(200,169,110,0.2)"} />
            <FieldError msg={errors[`variant_color_${vIdx}`]} />
          </div>
        </div>
        <button onClick={()=>onRemove(vIdx)} style={{ marginLeft:"12px", padding:"8px", borderRadius:"6px", border:"1px solid rgba(200,169,110,0.12)", background:"transparent", color:"#6b5a3e", cursor:"pointer", transition:"all 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.color="#c0392b";e.currentTarget.style.borderColor="rgba(192,57,43,0.3)";}} onMouseLeave={e=>{e.currentTarget.style.color="#6b5a3e";e.currentTarget.style.borderColor="rgba(200,169,110,0.12)";}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      {/* Size/Price Table */}
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["SIZE","SELLING ₹ *","ORIGINAL ₹","DISCOUNT",""].map((h)=>(
                <th key={h} style={{ fontFamily:"Montserrat,sans-serif", fontSize:"8px", letterSpacing:"2px", color:"#6b5a3e", textTransform:"uppercase", textAlign:"left", paddingBottom:"8px", paddingRight:"8px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variant.sizes.map((s,sIdx)=>(
              <tr key={sIdx}>
                <td style={{ paddingRight:"8px" }}><input type="text" placeholder="M" value={s.size} onChange={(e)=>updateSize(sIdx,"size",e.target.value)} style={{ ...S.input(errors[`variant_${vIdx}_size_${sIdx}`]), width:"80px" }} onFocus={e=>e.target.style.borderColor="#c8a96e"} onBlur={e=>e.target.style.borderColor=errors[`variant_${vIdx}_size_${sIdx}`]?"#c0392b":"rgba(200,169,110,0.2)"} /><FieldError msg={errors[`variant_${vIdx}_size_${sIdx}`]} /></td>
                <td style={{ paddingRight:"8px" }}><input type="number" placeholder="600" min="1" value={s.sellingPrice} onChange={(e)=>updateSize(sIdx,"sellingPrice",e.target.value)} onKeyDown={(e)=>["-","+","e"].includes(e.key)&&e.preventDefault()} style={{ ...S.input(errors[`variant_${vIdx}_price_${sIdx}`]), width:"100px" }} onFocus={e=>e.target.style.borderColor="#c8a96e"} onBlur={e=>e.target.style.borderColor=errors[`variant_${vIdx}_price_${sIdx}`]?"#c0392b":"rgba(200,169,110,0.2)"} /><FieldError msg={errors[`variant_${vIdx}_price_${sIdx}`]} /></td>
                <td style={{ paddingRight:"8px" }}><input type="number" placeholder="1000" min="1" value={s.originalPrice} onChange={(e)=>updateSize(sIdx,"originalPrice",e.target.value)} onKeyDown={(e)=>["-","+","e"].includes(e.key)&&e.preventDefault()} style={{ ...S.input(errors[`variant_${vIdx}_origprice_${sIdx}`]), width:"100px" }} onFocus={e=>e.target.style.borderColor="#c8a96e"} onBlur={e=>e.target.style.borderColor=errors[`variant_${vIdx}_origprice_${sIdx}`]?"#c0392b":"rgba(200,169,110,0.2)"} /><FieldError msg={errors[`variant_${vIdx}_origprice_${sIdx}`]} /></td>
                <td style={{ paddingRight:"8px" }}>
                  <div style={{ position:"relative" }}>
                    <input readOnly value={s.discount?`${s.discount}%`:"Auto"} style={{ ...S.input(false), width:"90px", color:"#6b5a3e" }} />
                    {s.discount && <span style={{ position:"absolute", right:"6px", top:"50%", transform:"translateY(-50%)", background:"#c8a96e", color:"#1a1a1a", fontSize:"9px", fontWeight:700, padding:"2px 6px", borderRadius:"3px", fontFamily:"Montserrat,sans-serif" }}>{s.discount}% OFF</span>}
                  </div>
                  <FieldError msg="" />
                </td>
                <td>
                  <button onClick={()=>removeSize(sIdx)} disabled={variant.sizes.length===1} style={{ padding:"8px", background:"transparent", border:"none", color:"#6b5a3e", cursor:"pointer", opacity:variant.sizes.length===1?0.3:1, transition:"color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color="#c0392b"} onMouseLeave={e=>e.currentTarget.style.color="#6b5a3e"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <FieldError msg="" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addSize} style={{ background:"transparent", border:"none", color:"#c8a96e", fontFamily:"Montserrat,sans-serif", fontSize:"11px", letterSpacing:"1px", cursor:"pointer", display:"flex", alignItems:"center", gap:"4px", marginTop:"8px", padding:0, transition:"opacity 0.2s" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Add Size Row
      </button>

      {/* Images */}
      {variant.images.length>0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px", marginTop:"12px" }}>
          {variant.images.map((img,i)=>(
            <div key={i} className="img-thumb" style={{ position:"relative", aspectRatio:"1", borderRadius:"6px", overflow:"hidden", border:"1px solid rgba(200,169,110,0.2)" }}>
              <img src={img.preview||img.url||img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              {i===0 && <span style={{ position:"absolute", top:"4px", left:"4px", background:"#c8a96e", color:"#1a1a1a", fontSize:"8px", fontWeight:700, padding:"2px 6px", borderRadius:"3px", fontFamily:"Montserrat,sans-serif" }}>MAIN</span>}
              {img.isExisting && <span style={{ position:"absolute", top:"4px", right:"4px", background:"rgba(100,150,255,0.85)", color:"#fff", fontSize:"8px", fontWeight:700, padding:"2px 5px", borderRadius:"3px", fontFamily:"Montserrat,sans-serif" }}>SAVED</span>}
              <button onClick={()=>onRemoveImage(vIdx,i)} className="img-remove" style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity 0.2s", border:"none", color:"#fff", fontFamily:"Montserrat,sans-serif", fontSize:"10px", fontWeight:600, cursor:"pointer" }} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0"}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {variant.images.length<6 && (
        <>
          <button type="button" onClick={()=>fileRef.current.click()} style={{ width:"100%", border:"1px dashed rgba(200,169,110,0.3)", background:"transparent", color:"#6b5a3e", fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"1px", padding:"10px", borderRadius:"6px", cursor:"pointer", marginTop:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#c8a96e";e.currentTarget.style.color="#c8a96e";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(200,169,110,0.3)";e.currentTarget.style.color="#6b5a3e";}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add images for this color ({variant.images.length}/6)
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={(e)=>onAddImages(vIdx,e.target.files)} />
        </>
      )}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ ...S.card }}>
    <div style={{ height:"12px", width:"120px", background:"rgba(200,169,110,0.1)", borderRadius:"4px", marginBottom:"20px", animation:"pulse 1.5s infinite" }} />
    <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
      <div style={{ height:"40px", background:"rgba(200,169,110,0.06)", borderRadius:"6px", animation:"pulse 1.5s infinite" }} />
      <div style={{ height:"80px", background:"rgba(200,169,110,0.06)", borderRadius:"6px", animation:"pulse 1.5s infinite" }} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
        <div style={{ height:"40px", background:"rgba(200,169,110,0.06)", borderRadius:"6px", animation:"pulse 1.5s infinite" }} />
        <div style={{ height:"40px", background:"rgba(200,169,110,0.06)", borderRadius:"6px", animation:"pulse 1.5s infinite" }} />
      </div>
    </div>
  </div>
);

// ── buildCategoryValues ───────────────────────────────────────────────────────
const buildCategoryValues = (savedId, categories) => {
  if (!savedId) return { mainCategory:"", childCategory:"", subCategory:"" };
  const cat = categories.find((c)=>c._id===savedId);
  if (!cat) return { mainCategory:savedId, childCategory:"", subCategory:"" };
  const level = cat.level;
  if (level===1||level==="main") return { mainCategory:savedId, childCategory:"", subCategory:"" };
  if (level===2||level==="child") { const pid=resolveId(cat.parent??cat.parentId??cat.parentCategory)??""; return { mainCategory:pid, childCategory:savedId, subCategory:"" }; }
  if (level===3||level==="sub") { const pid=resolveId(cat.parent??cat.parentId??cat.parentCategory)??""; const parentCat=categories.find((c)=>c._id===pid); const gpid=parentCat?resolveId(parentCat.parent??parentCat.parentId??parentCat.parentCategory)??"":""; return { mainCategory:gpid, childCategory:pid, subCategory:savedId }; }
  return { mainCategory:savedId, childCategory:"", subCategory:"" };
};

// ── Main Component ────────────────────────────────────────────────────────────
function EditProduct() {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [categories,      setCategories]      = useState([]);
  const [form,            setForm]            = useState({ name:"", description:"", isActive:true });
  const [categoryValues,  setCategoryValues]  = useState({ mainCategory:"", childCategory:"", subCategory:"" });
  const [variants,        setVariants]        = useState([]);
  const [errors,          setErrors]          = useState({});
  const [touched,         setTouched]         = useState({});
  const [loading,         setLoading]         = useState(false);
  const [fetching,        setFetching]        = useState(true);
  const [fetchError,      setFetchError]      = useState("");
  const [toast,           setToast]           = useState(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([API.get(`/products/${id}`), API.get("/categories?limit=100")]);
        const p = prodRes.data.product, cats = catRes.data.categories || [];
        setCategories(cats);
        setForm({ name:p.name||"", description:p.description||"", isActive:p.isActive!==undefined?p.isActive:true });
        const savedCatId = resolveId(p.category)??"";
        setCategoryValues(buildCategoryValues(savedCatId, cats));

        if (p.variants&&p.variants.length>0) {
          setVariants(p.variants.map((v)=>({ color:v.color||v.colorName||"", colorHex:v.colorHex||"#000000", images:(v.images||[]).map((url)=>typeof url==="string"?{url,isExisting:true}:url), sizes:(v.sizes||[]).map((s)=>({ size:s.size||"", sellingPrice:s.sellingPrice||s.price||"", originalPrice:s.originalPrice||"", discount:s.discount||calcDiscount(s.sellingPrice||s.price,s.originalPrice) })) })));
        } else if (p.colorGroups&&p.colorGroups.length>0) {
          setVariants(p.colorGroups.map((g)=>({ color:g.colorName||"", colorHex:g.colorHex||"#000000", images:(g.images||[]).map((url)=>({url,isExisting:true})), sizes:[{ size:(p.sizes||[]).join(", ")||"", sellingPrice:p.price||"", originalPrice:p.originalPrice||"", discount:p.discount||"" }] })));
        } else {
          setVariants([{ color:"", colorHex:"#000000", images:(p.images||[]).map((url)=>({url,isExisting:true})), sizes:[{ size:"", sellingPrice:p.price||"", originalPrice:p.originalPrice||"", discount:p.discount||"" }] }]);
        }
      } catch { setFetchError("Failed to load product. Please try again."); }
      finally  { setFetching(false); }
    };
    load();
  }, [id]);

  const handle    = (e) => { const{name,value}=e.target; setForm((f)=>({...f,[name]:value})); setTouched((t)=>({...t,[name]:true})); setErrors((er)=>({...er,[name]:""})); };
  const handleBlur = (name) => { setTouched((t)=>({...t,[name]:true})); const errs=validate(form,variants); setErrors((er)=>({...er,[name]:errs[name]||""})); };
  const showToast  = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const updateVariant    = (vIdx,updated) => setVariants((prev)=>prev.map((v,i)=>i===vIdx?updated:v));
  const addVariant       = () => setVariants((prev)=>[...prev,{ color:"",colorHex:"#000000",images:[],sizes:[{size:"",sellingPrice:"",originalPrice:"",discount:""}] }]);
  const removeVariant    = (vIdx) => { if(variants.length===1)return; setVariants((prev)=>prev.filter((_,i)=>i!==vIdx)); };
  const handleAddImages  = (vIdx,files) => { const valid=Array.from(files).filter((f)=>f.type.startsWith("image/")); const previews=valid.map((file)=>({file,preview:URL.createObjectURL(file),isExisting:false})); setVariants((prev)=>prev.map((v,i)=>{ if(i!==vIdx)return v; const remaining=6-v.images.length; return{...v,images:[...v.images,...previews].slice(0,v.images.length+remaining)}; })); };
  const handleRemoveImage= (vIdx,imgIdx) => { setVariants((prev)=>prev.map((v,i)=>{ if(i!==vIdx)return v; const updated=[...v.images]; if(updated[imgIdx]?.preview)URL.revokeObjectURL(updated[imgIdx].preview); updated.splice(imgIdx,1); return{...v,images:updated}; })); };

  const handleSubmit = async () => {
    const combinedForm={...form,mainCategory:categoryValues.mainCategory};
    const errs=validate(combinedForm,variants);
    setErrors(errs); setTouched({name:true,mainCategory:true});
    if(Object.keys(errs).length){showToast("Please fix the errors above","error");return;}
    const resolvedCategory=categoryValues.subCategory||categoryValues.childCategory||categoryValues.mainCategory;
    setLoading(true);
    try {
      const processedVariants=await Promise.all(variants.map(async(variant)=>{
        const existingUrls=variant.images.filter((img)=>img.isExisting).map((img)=>img.url);
        const newImgs=variant.images.filter((img)=>img.file);
        let newUrls=[];
        if(newImgs.length>0){const formData=new FormData();newImgs.forEach((img)=>formData.append("images",img.file));const res=await API.post("/upload/products",formData);newUrls=res.data.urls;}
        return{ color:variant.color.trim(), colorHex:variant.colorHex, images:[...existingUrls,...newUrls], sizes:variant.sizes.map((s)=>({ size:s.size.trim(), sellingPrice:Number(s.sellingPrice), originalPrice:s.originalPrice?Number(s.originalPrice):undefined, discount:s.discount?Number(s.discount):undefined })) };
      }));
      await API.put(`/products/${id}`,{ name:form.name.trim(), description:form.description.trim(), category:resolvedCategory, variants:processedVariants, isActive:form.isActive });
      showToast("Product updated successfully!");
      setTimeout(()=>navigate("/product"),1500);
    } catch(err){showToast(err.response?.data?.message||"Failed to update product","error");}
    finally{setLoading(false);}
  };

  const sectionNum = (n) => (
    <div style={{ width:"22px", height:"22px", borderRadius:"4px", background:"linear-gradient(135deg,#c8a96e,#a07840)", display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1a1a", fontFamily:"Montserrat,sans-serif", fontSize:"10px", fontWeight:700, flexShrink:0 }}>{n}</div>
  );

  // ── Fetch error ───────────────────────────────────────────────────────────
  if (!fetching && fetchError) {
    return (
      <div style={{ minHeight:"100vh", background:"#111111", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
        <div style={{ ...S.card, maxWidth:"380px", width:"100%", textAlign:"center" }}>
          <div style={{ width:"52px", height:"52px", borderRadius:"10px", background:"rgba(192,57,43,0.1)", border:"1px solid rgba(192,57,43,0.25)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:"#f87171" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" /></svg>
          </div>
          <h3 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"22px", color:"var(--text-primary)", fontWeight:300, fontStyle:"italic"
, marginBottom:"8px" }}>Failed to Load</h3>
          <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"12px", color:"#6b5a3e", marginBottom:"20px" }}>{fetchError}</p>
          <div style={{ display:"flex", gap:"10px" }}>
            <button onClick={()=>navigate("/product")} style={{ flex:1, padding:"12px", borderRadius:"8px", border:"1px solid rgba(200,169,110,0.2)", background:"transparent", color:"#6b5a3e", fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", cursor:"pointer" }}>Go Back</button>
            <button onClick={()=>{setFetchError("");setFetching(true);}} style={{ flex:1, padding:"12px", borderRadius:"8px", border:"none", background:"linear-gradient(135deg,#c8a96e,#a07840)", color:"#1a1a1a", fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", fontWeight:700, cursor:"pointer" }}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "32px 24px" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder, textarea::placeholder { color:#3d2f1a; }
        select option { background:#1a1a1a; color:#fff; }
      `}</style>

      <div style={{ maxWidth:"680px", margin:"0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>
          <button onClick={()=>navigate("/product")} style={{ padding:"8px", borderRadius:"6px", border:"1px solid rgba(200,169,110,0.2)", background:"transparent", color:"#6b5a3e", cursor:"pointer", display:"flex", alignItems:"center", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#c8a96e";e.currentTarget.style.color="#c8a96e";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(200,169,110,0.2)";e.currentTarget.style.color="#6b5a3e";}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"28px", color:"var(--text-primary)", fontWeight:300, fontStyle:"italic"
, margin:0 }}>Edit Product</h1>
            <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"1px", color:"#6b5a3e", marginTop:"4px" }}>Update product details — changes save on submit</p>
          </div>
        </div>

        {fetching ? (
          <div><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
        ) : (
          <>
            {/* ── 1. Basic Info ── */}
            <div style={S.card}>
              <div style={{ height:"1px", background:"linear-gradient(90deg,#c8a96e00,#c8a96e88,#c8a96e00)", marginBottom:"20px" }} />
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
                {sectionNum(1)}
                <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"18px", color:"#fff", fontWeight:400, fontStyle:"italic", margin:0 }}>Basic Information</h2>
              </div>

              <div style={{ marginBottom:"16px" }}>
                <Label>Product Name *</Label>
                <input name="name" value={form.name} onChange={handle} onBlur={()=>handleBlur("name")} placeholder="e.g. Lotus Wax Candle" style={S.input(touched.name&&errors.name)} onFocus={e=>e.target.style.borderColor="#c8a96e"} onBlur_={()=>{}} />
                <FieldError msg={touched.name?errors.name:""} />
              </div>

              <div style={{ marginBottom:"16px" }}>
                <Label>Description</Label>
                <textarea name="description" value={form.description} onChange={handle} placeholder="Short product description for customers..." rows={3} style={{ ...S.input(false), resize:"none" }} onFocus={e=>e.target.style.borderColor="#c8a96e"} onBlur={e=>e.target.style.borderColor="rgba(200,169,110,0.2)"} />
                <FieldError msg="" />
              </div>

              <CascadingCategory categories={categories} values={categoryValues} touched={touched} errors={errors}
                onChange={(updated)=>{setCategoryValues(updated);setErrors((er)=>({...er,mainCategory:""}));}}
                onBlur={(field)=>setTouched((t)=>({...t,[field]:true}))}
              />
            </div>

            {/* ── 2. Colors, Sizes & Pricing ── */}
            <div style={S.card}>
              <div style={{ height:"1px", background:"linear-gradient(90deg,#c8a96e00,#c8a96e88,#c8a96e00)", marginBottom:"20px" }} />
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  {sectionNum(2)}
                  <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"18px", color:"#fff", fontWeight:400, fontStyle:"italic", margin:0 }}>Colors, Sizes & Pricing</h2>
                </div>
                <button onClick={addVariant} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 14px", borderRadius:"6px", background:"rgba(200,169,110,0.15)", border:"1px solid rgba(200,169,110,0.3)", color:"#c8a96e", fontFamily:"Montserrat,sans-serif", fontSize:"10px", letterSpacing:"1px", cursor:"pointer", transition:"all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(200,169,110,0.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(200,169,110,0.15)"}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add Color
                </button>
              </div>
              <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"10px", color:"#3d2f1a", marginBottom:"16px" }}>Each color has its own images and size-specific pricing. SAVED = existing images.</p>

              {variants.map((variant,vIdx)=>(
                <VariantBlock key={vIdx} variant={variant} vIdx={vIdx} onUpdate={updateVariant} onRemove={removeVariant} onAddImages={handleAddImages} onRemoveImage={handleRemoveImage} errors={errors} />
              ))}
            </div>

            {/* ── 3. Settings ── */}
            <div style={S.card}>
              <div style={{ height:"1px", background:"linear-gradient(90deg,#c8a96e00,#c8a96e88,#c8a96e00)", marginBottom:"20px" }} />
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
                {sectionNum(3)}
                <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"18px", color:"#fff", fontWeight:400, fontStyle:"italic", margin:0 }}>Settings</h2>
              </div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"12px", color:"var(--text-primary)", fontWeight:500
, margin:"0 0 2px" }}>{form.isActive?"Active":"Inactive"}</p>
                  <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"10px", color:"#6b5a3e", margin:0 }}>{form.isActive?"Visible on storefront":"Hidden from storefront"}</p>
                </div>
                <div onClick={()=>setForm((f)=>({...f,isActive:!f.isActive}))} style={{ width:"44px", height:"24px", borderRadius:"12px", background:form.isActive?"#c8a96e":"rgba(255,255,255,0.1)", position:"relative", cursor:"pointer", transition:"background 0.3s" }}>
                  <div style={{ position:"absolute", top:"4px", width:"16px", height:"16px", background:"#fff", borderRadius:"50%", transition:"left 0.3s", left:form.isActive?"24px":"4px", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }} />
                </div>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div style={{ display:"flex", gap:"12px", paddingBottom:"32px" }}>
              <button onClick={()=>navigate("/product")} style={{ flex:1, padding:"14px", borderRadius:"8px", border:"1px solid rgba(200,169,110,0.2)", background:"transparent", color:"#6b5a3e", fontFamily:"Montserrat,sans-serif", fontSize:"11px", letterSpacing:"2px", textTransform:"uppercase", cursor:"pointer", transition:"all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.borderColor="#c8a96e"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(200,169,110,0.2)"}>Cancel</button>
              <button onClick={handleSubmit} disabled={loading} style={{ flex:1, padding:"14px", borderRadius:"8px", border:"none", background:"linear-gradient(135deg,#c8a96e,#a07840)", color:"#1a1a1a", fontFamily:"Montserrat,sans-serif", fontSize:"11px", letterSpacing:"2px", textTransform:"uppercase", fontWeight:700, cursor:"pointer", opacity:loading?0.6:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", transition:"opacity 0.2s" }}>
                {loading
                  ? <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ animation:"spin 1s linear infinite" }}><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity:0.25 }} /><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" style={{ opacity:0.75 }} /></svg>Updating...</>
                  : "Update Product"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position:"fixed", bottom:"24px", right:"24px", padding:"14px 20px", borderRadius:"8px", background:toast.type==="error"?"#c0392b":"#c8a96e", color:toast.type==="error"?"#fff":"#1a1a1a", fontFamily:"Montserrat,sans-serif", fontSize:"11px", letterSpacing:"1px", fontWeight:600, zIndex:50, display:"flex", alignItems:"center", gap:"8px", boxShadow:"0 8px 30px rgba(0,0,0,0.4)", animation:"fadeIn 0.2s ease" }}>
          {toast.type==="error"?"✕":"✓"} {toast.msg}
        </div>
      )}
    </div>
  );
}

export default EditProduct;