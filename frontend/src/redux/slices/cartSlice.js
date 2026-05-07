import { createSlice } from "@reduxjs/toolkit";

const savedCart = (() => {
  try {
    return JSON.parse(localStorage.getItem("trendytroveCart")) || [];
  } catch {
    return [];
  }
})();

// Uses _id + variantId + size + color — all four must match to be "same item"
const isSameItem = (a, b) =>
  String(a._id || a.product) === String(b._id || b.product) &&
  String(a.variantId  || "") === String(b.variantId  || "") &&
  String(a.size  || "").toLowerCase() === String(b.size  || "").toLowerCase() &&
  String(a.color || "").toLowerCase() === String(b.color || "").toLowerCase();

const save = (items) =>
  localStorage.setItem("trendytroveCart", JSON.stringify(items));

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: savedCart,
    loading: false,
  },
  reducers: {

    addToCart: (state, action) => {
      const payload = action.payload;
      const existing = state.items.find((i) => isSameItem(i, payload));

      if (existing) {
        // already in cart — just bump quantity by how many were requested
        existing.quantity += payload.quantity || 1;
      } else {
        state.items.push({
          ...payload,
          product:  payload._id,
          variantId: payload.variantId || "",
          price:    payload.price || payload.sellingPrice || 0,
          quantity: payload.quantity || 1,
        });
      }
      save(state.items);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => !isSameItem(i, action.payload));
      save(state.items);
    },

    updateQuantity: (state, action) => {
      const { quantity } = action.payload;

      if (quantity <= 0) {
        state.items = state.items.filter((i) => !isSameItem(i, action.payload));
      } else {
        const item = state.items.find((i) => isSameItem(i, action.payload));
        if (item) item.quantity = quantity;
      }
      save(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("trendytroveCart");
    },

    setCartFromBackend: (state, action) => {
      state.items = action.payload;
      save(state.items);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCartFromBackend,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;

// ─── Total unique line-items (for badge number) ───────────────────────────────
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + (i.quantity || 1), 0);

// ─── Grand total price ────────────────────────────────────────────────────────
export const selectCartTotal = (state) =>
  state.cart.items.reduce(
    (sum, i) => sum + (Number(i.price || i.sellingPrice) || 0) * (i.quantity || 1),
    0
  );

export default cartSlice.reducer;