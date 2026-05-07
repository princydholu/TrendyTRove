import { createSlice } from "@reduxjs/toolkit";

//  Use admin-specific key
const savedUser = JSON.parse(localStorage.getItem("adminUser") || "null");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: savedUser || null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("adminUser", JSON.stringify(action.payload)); 
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("adminUser", JSON.stringify(state.user)); 
    },

    logout: (state) => {
      state.user = null;
      localStorage.removeItem("adminUser");   
      localStorage.removeItem("adminToken");  
    },
  },
});

export const { loginSuccess, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;