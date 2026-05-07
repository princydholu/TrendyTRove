import { createSlice } from "@reduxjs/toolkit";

const savedUser = JSON.parse(localStorage.getItem("trendytroveUser"));

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: savedUser || null,
  },
  reducers: {
    //  Login / Signup — save user to Redux + localStorage
    loginSuccess: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("trendytroveUser", JSON.stringify(action.payload));
    },

    //  Update profile — update Redux + localStorage
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("trendytroveUser", JSON.stringify(state.user));
    },

    //  Logout — clear Redux + localStorage
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("trendytroveUser"); 
      localStorage.removeItem("trendytroveToken"); 
    },
  },
});

export const { loginSuccess, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;