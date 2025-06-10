import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Customer-specific Pages and Components
import CustomerLayout from './components/CustomerLayout'; 
import { CartProvider } from './context/CartContext'; // Import the new CartProvider

import Login from "./pages/Login"; // Assuming Login.jsx in pages folder
import Register from "./pages/Register"; // Assuming Register.jsx in pages folder
import Navbar from "./components/Navbar"; // Customer Navbar
import Home from "./pages/Home"; // Customer Home page
import Dashboard from "./pages/Dasboard"; // Customer Dashboard (path from user was ./pages/Dasboard)
import PrivateRoute from "./components/PrivateRoute"; // Customer PrivateRoute
import VerifyEmail from "./pages/verify-email"; // Assuming verify-email.jsx in pages folder
import Orders from "./pages/Orders"; // Assuming Orders.jsx in pages folder
import Profile from "./pages/Profile"; // Assuming Profile.jsx in pages folder
import Inventory from "./pages/Inventory"; // Assuming Inventory.jsx in pages folder
import ProductsPage from './pages/ProductsPage'; 
import ProductDetailPage from './pages/ProductDetailPage'; 
import CartPage from './pages/CartPage';

// Admin Auth Context Provider
import { AdminAuthProvider } from "./context/AdminAuthContext";

// Admin Components
import AdminLayout from "./components/admin/AdminLayout";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
// Use the AdminPrivateRoute path as specified in your combined imports
import AdminPrivateRoute from "./components/admin/AdminPrivateRoute";

// Company Admin Pages
import CompanyListPage from "./pages/admin/company/CompanyListPage";
import AddCompanyPage from "./pages/admin/company/AddCompanyPage";
import EditCompanyPage from "./pages/admin/company/EditCompanyPage";
import ViewCompanyPage from "./pages/admin/company/ViewCompanyPage";

// Product Admin Pages (Placeholders - you'll create these next if needed)
import ManageProductsPage from "./pages/admin/products/ManageProducts";
import AllProductsPage from "./pages/admin/products/AllProductsPage";
import AddProductToCompanyPage from "./pages/admin/products/AddProductToCompanyPage";
import EditProductInCompanyPage from "./pages/admin/products/EditProductInCompanyPage";
import UserListPage from "./pages/admin/user/UserListPage";
import ViewUserPage from "./pages/admin/user/ViewUserPage";

function App() {
  return (
    <Router>
      <AdminAuthProvider>
        {" "}
  <CartProvider>
        <Routes>
    {/* --- Customer Routes wrapped in the new Layout --- */}
                    <Route element={<CustomerLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:productId" element={<ProductDetailPage />} /> 
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/cart" element={<CartPage />} />
                        
                        {/* Customer Private Routes */}
                        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                        <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
                        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    </Route>

                    {/* --- Standalone Customer Routes (No Navbar/Banner) --- */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminPrivateRoute>{" "}<AdminLayout />{" "}</AdminPrivateRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />

            <Route path="companies" element={<CompanyListPage />} />
            <Route path="companies/add" element={<AddCompanyPage />} />
            <Route path="companies/edit/:companyId" element={<EditCompanyPage />} />
            <Route path="companies/:companyId" element={<ViewCompanyPage />} />
            {/* Placeholder for Product Management within a Company */}
            <Route path="companies/:companyId/products/add" element={<AddProductToCompanyPage />} />
            <Route path="companies/:companyId/products/edit/:productId" element={<EditProductInCompanyPage />} />
            <Route path="companies/:companyId/products" element={<ManageProductsPage />} />
            <Route path="products" element={<AllProductsPage />} />
            <Route path="users" element={<UserListPage />} />
            <Route path="users/:userId" element={<ViewUserPage />} />
            {/* ... other protected admin routes would go here inside AdminLayout's Outlet ... */}
          </Route>
          {/* Fallback for unmatched admin routes (optional but good practice) */}
          <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
          {/* Optional: General 404 Not Found Page for unmatched routes */}
          {/* <Route path="*" element={<div><h1>404 Not Found</h1><Link to="/">Go Home</Link></div>} /> */}
        </Routes>
        </CartProvider>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;



