import "./i18n";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { GoogleOAuthProvider } from "@react-oauth/google"; // ✅ add this
import App from "./App";
import "./index.css";

const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.classList.add(savedTheme);

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="802655306002-i5filfj0murrtv4mvbtpqlmnj5vrl0ch.apps.googleusercontent.com">
    <Provider store={store}>
      <App />
    </Provider>
  </GoogleOAuthProvider>
);