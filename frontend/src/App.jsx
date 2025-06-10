import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Context Providers ---
import { AdminAuthProvider as AdminAuthProvider } from "./context/AdminAuthContext";
import { AuthProvider as CustomerAuthProvider } from "./context/AuthContext";
import { CartProvider } from './context/CartContext';

// --- Layouts ---
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from "./components/admin/AdminLayout";

// --- Route Protectors ---
import PrivateRoute from "./components/PrivateRoute"; // The NEW customer private route
import AdminPrivateRoute from "./components/admin/AdminPrivateRoute";

// --- Customer Pages ---
import Home from "./pages/Home";
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dasboard";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

// --- Admin Pages ---
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import CompanyListPage from "./pages/admin/company/CompanyListPage";
import AddCompanyPage from "./pages/admin/company/AddCompanyPage";
import EditCompanyPage from "./pages/admin/company/EditCompanyPage";
import ViewCompanyPage from "./pages/admin/company/ViewCompanyPage";
import AddProductToCompanyPage from './pages/admin/products/AddProductToCompanyPage';
import EditProductInCompanyPage from './pages/admin/products/EditProductInCompanyPage';
import UserListPage from './pages/admin/user/UserListPage';
import ViewUserPage from './pages/admin/user/ViewUserPage';


function App() {
    return (
        <CustomerAuthProvider>
            <AdminAuthProvider>
                <CartProvider>
                    <Router>
                        <Routes>
                            {/* --- Public Customer Routes --- */}
                            <Route element={<CustomerLayout />}>
                                <Route path="/" element={<Home />} />
                                <Route path="/products" element={<ProductsPage />} />
                                <Route path="/products/:productId" element={<ProductDetailPage />} />
                                <Route path="/cart" element={<CartPage />} />
                            </Route>

                            {/* --- Standalone Routes (No Main Layout) --- */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                             <Route path="/order/:orderId/success" element={<OrderSuccessPage />} />

                            {/* --- Protected Customer Routes --- */}
                            {/* This grouping ensures all these routes use the new, robust PrivateRoute */}
                            <Route element={<PrivateRoute><CustomerLayout /></PrivateRoute>}>
                                <Route path="dashboard" element={<Dashboard />} />
                                <Route path="profile" element={<Profile />} />
                                <Route path="profile/orders" element={<Orders />} />
                                <Route path="checkout" element={<CheckoutPage />} />
                            </Route>
                            
                            {/* --- Admin Routes --- */}
                            <Route path="/admin/login" element={<AdminLoginPage />} />
                            <Route path="/admin" element={<AdminPrivateRoute><AdminLayout /></AdminPrivateRoute>}>
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="dashboard" element={<AdminDashboardPage />} />
                                <Route path="companies" element={<CompanyListPage />} />
                                <Route path="companies/add" element={<AddCompanyPage />} />
                                <Route path="companies/edit/:companyId" element={<EditCompanyPage />} />
                                <Route path="companies/:companyId" element={<ViewCompanyPage />} />
                                <Route path="companies/:companyId/products/add" element={<AddProductToCompanyPage />} />
                                <Route path="companies/:companyId/products/edit/:productId" element={<EditProductInCompanyPage />} />
                                <Route path="users" element={<UserListPage />} />
                                <Route path="users/:userId" element={<ViewUserPage />} />
                            </Route>

                        </Routes>
                    </Router>
                </CartProvider>
            </AdminAuthProvider>
        </CustomerAuthProvider>
    );
}

export default App;
