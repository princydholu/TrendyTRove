import "./i18n";
import AdminLayout from "./components/AdminLayout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import AdminCategories from "./pages/AdminCategories";
import Product from "./pages/product";
import AddProduct from "./pages/Addproduct";
import EditProduct from "./pages/Editproduct";
import Orders from "./pages/orders";
import Reviews from "./pages/Reviews";

function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "admin") return <Navigate to="/login" />;
  
  return children;
}

const Protected = ({ children }) => (
  <ProtectedRoute>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <BrowserRouter basename="/admin" >
    
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard"    element={<Protected><Dashboard /></Protected>} />
        <Route path="/edit-profile" element={<Protected><EditProfile /></Protected>} />
        <Route path="/users"        element={<Protected><Users /></Protected>} />
        <Route path="/users/add"    element={<Protected><AddUser /></Protected>} />
        <Route path="/categories"   element={<Protected><AdminCategories /></Protected>} />
        <Route path="/product"             element={<Protected><Product /></Protected>} />
        <Route path="/product/add"         element={<Protected><AddProduct /></Protected>} />
        <Route path="/product/edit/:id"    element={<Protected><EditProduct /></Protected>} />  
        <Route path="/orders"       element={<Protected><Orders /></Protected>} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/reviews" element={<Protected><Reviews /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;