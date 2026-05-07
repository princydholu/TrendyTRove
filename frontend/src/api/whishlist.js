import API from "./axios";

// Get wishlist
export const getWishlistAPI = () => API.get("/wishlist");

// Add to wishlist
export const addToWishlistAPI = (productId) =>
  API.post("/wishlist", { productId });

// Remove from wishlist
export const removeFromWishlistAPI = (productId) =>
  API.delete(`/wishlist/${productId}`);

// Clear wishlist
export const clearWishlistAPI = () =>
  API.delete("/wishlist");