import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import Layout from "./layout/Layout";
import New from "./pages/new";
import Walldecore from "./pages/walldecore";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CategoryPage from "./pages/CategoryPage";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import EditProfile from "./pages/EditProfile";
import Wishlist from "./pages/Wishlist";
import MyOrders from "./pages/Myorders";

// ── Auto scroll to top on every route change ──────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
   return (
    <Router>
      <ScrollToTop />
      <Routes>
           {/*  These OUTSIDE Layout - nginx handles them */}
        <Route path="/admin" element={null} />
        <Route path="/admin/*" element={null} />
        <Route path="/vaultx" element={null} />
        <Route path="/vaultx/*" element={null} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<New />} />
          <Route path="new" element={<New />} />
          <Route path="homedecore/wall-decor" element={<Walldecore />} />
          <Route path="login" element={<Login />} />
          <Route path="editprofile" element={<EditProfile />} />
          <Route path="signup" element={<Signup />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path=":category/:subcategory" element={<CategoryPage />} />
          <Route path=":category" element={<CategoryPage />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;