import { createSlice } from "@reduxjs/toolkit";

const applyTheme = (isDark) => {
  if (isDark) {
    document.body.classList.remove("light");
  } else {
    document.body.classList.add("light");
  }
};

const isDarkDefault = localStorage.getItem("vaultxTheme") !== "light";
applyTheme(isDarkDefault);

const themeSlice = createSlice({
  name: "theme",
  initialState: { isDark: isDarkDefault },
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      localStorage.setItem("vaultxTheme", state.isDark ? "dark" : "light");
      applyTheme(state.isDark);
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export const selectIsDark = (state) => state.theme.isDark;
export default themeSlice.reducer;