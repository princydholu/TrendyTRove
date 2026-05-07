import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

// Fetch all public products
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await API.get("/products", { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch products");
    }
  }
);

// Fetch single product
export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`/products/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch product");
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    product: null,
    loading: false,
    error: null,
    total: 0,
  },
  reducers: {
    clearProduct: (state) => { state.product = null; },
  },
  extraReducers: (builder) => {
    builder
      // All products
      .addCase(fetchProducts.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = action.payload.products || [];
        state.total   = action.payload.total    || 0;
      })
      .addCase(fetchProducts.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

      // Single product
      .addCase(fetchProductById.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload.product || action.payload;
      })
      .addCase(fetchProductById.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;