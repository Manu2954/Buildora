import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Context Providers ---
import { AdminAuthProvider as AdminAuthProvider } from "./context/AdminAuthContext";
import { AuthProvider as CustomerAuthProvider } from "./context/AuthContext";
import { CartProvider } from './context/CartContext';

// --- Layouts ---
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from "./components/admin/AdminLayout";
import ProfileLayout from './components/ProfileLayout'; 

// --- Route Protectors ---
import PrivateRoute from "./components/PrivateRoute";
import AdminPrivateRoute from "./components/admin/AdminPrivateRoute";

// --- Customer Pages ---
import Home from "./pages/HomePage";
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dasboard";
import SecurityPage from "./pages/SecurityPage";
import VerifyEmail from './pages/verify-email';

import Profile from "./pages/ProfilePage";
import OrderDetailPage from './pages/OrderDetailPage'; 
import OrdersPage from './pages/OrdersPage';

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
import AdminOrdersPage from './pages/admin/order/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/order/AdminOrderDetailPage';
import BulkUploadPage from './pages/admin/products/BulkUploadPage';
import Products from './pages/admin/products/AllProductsPage';
import ImageLibraryPage from './pages/admin/products/ImageLibraryPage';
import { SiteProvider } from './context/SiteContext';
import AdManagementPage from './pages/admin/AdManagementPage';
import LeadListPage from './pages/admin/lead/LeadListPage';
import ViewLeadPage from './pages/admin/lead/ViewLeadPage';


function App() {
    return (
        <CustomerAuthProvider>
            <AdminAuthProvider>
                <SiteProvider>
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
                            <Route path="/verify" element={<VerifyEmail />} />

                            {/* --- Protected Customer Routes --- */}
                            {/* This grouping ensures all these routes use the new, robust PrivateRoute */}
                             <Route path="/account" element={<PrivateRoute><ProfileLayout /></PrivateRoute>}>
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="dashboard" element={<Dashboard />} />
                                <Route path="orders" element={<OrdersPage />} />
                                <Route path="profile" element={<Profile />} />
                                <Route path="security" element={<SecurityPage />} />
                                {/* Route for a single order detail page */}
                                <Route path="orders/:orderId" element={<OrderDetailPage />} />
                            </Route>
                               {/* Standalone protected routes */}
                            <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
                            <Route path="/order/:orderId/success" element={<OrderSuccessPage />} />
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
                                <Route path="orders" element={<AdminOrdersPage />} />
                                <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
                                <Route path="bulk-upload" element={<BulkUploadPage />} />
                                <Route path="products" element={<Products />} />
                                <Route path="image-library" element={<ImageLibraryPage />} />
                                <Route path="advertisements" element={<AdManagementPage />} /> {/* New Route */}
                                <Route path="leads" element={<LeadListPage />} />
                                <Route path="leads/:leadId" element={<ViewLeadPage />} />

                            </Route>

                        </Routes>
                    </Router>
                </CartProvider>
                </SiteProvider>
            </AdminAuthProvider>
        </CustomerAuthProvider>
    );
}

export default App;
