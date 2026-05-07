import { createSlice } from "@reduxjs/toolkit";

// ✅ Load saved user on page refresh
const savedUser = JSON.parse(localStorage.getItem("trendytroveUser"));

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: savedUser || null,
    isLoggedIn: !!savedUser,
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      localStorage.setItem("trendytroveUser", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      localStorage.removeItem("trendytroveUser");
      localStorage.removeItem("trendytroveToken"); // ✅ clear token too
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;