import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [], // full product objects populated from backend
  },
  reducers: {
    // Replace entire wishlist (called after backend fetch)
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
    // Optimistic add — adds product object locally
    addToWishlistLocal: (state, action) => {
      const exists = state.items.find((i) => i._id === action.payload._id);
      if (!exists) state.items.push(action.payload);
    },
    // Optimistic remove — removes by productId
    removeFromWishlistLocal: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
    },
    // Clear all
    clearWishlistLocal: (state) => {
      state.items = [];
    },
  },
});

export const {
  setWishlist,
  addToWishlistLocal,
  removeFromWishlistLocal,
  clearWishlistLocal,
} = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectIsWishlisted  = (productId) => (state) =>
  state.wishlist.items.some((i) => i._id === productId);

export default wishlistSlice.reducer;