import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Customer-specific Pages and Components
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
// import AddProductToCompanyPage from './pages/admin/product/AddProductToCompanyPage';
// import EditProductInCompanyPage from './pages/admin/product/EditProductInCompanyPage';

function App() {
  return (
    <Router>
      <AdminAuthProvider> {/* Context available to all routes */}
        {/* The customer Navbar component. 
            Consider using a CustomerLayout component to wrap customer routes 
            that need this Navbar for better structure.
            For now, including it as per common simple setups or per page.
        */}
        {/* <Navbar /> */} {/* If Navbar is global, place it here. Or handle in specific routes/layouts. */}
        
        <Routes>
          {/* Customer Facing Routes */}
          {/* Example: Wrap Home and VerifyEmail with Navbar. Login/Register usually don't have the main Navbar. */}
          <Route path="/" element={<><Navbar /><Home /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<><Navbar /><VerifyEmail /></>} /> {/* Corrected path from user's /verify */}

          {/* Customer Private Routes */}
          {/* These routes use the customer-specific PrivateRoute. */}
          {/* They also might need the customer Navbar. */}
          <Route path="/dashboard" element={<PrivateRoute><Navbar /><Dashboard /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Navbar /><Orders /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Navbar /><Inventory /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Navbar /><Profile /></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          <Route 
            path="/admin" 
            element={
              <AdminPrivateRoute> {/* This is the admin-specific PrivateRoute */}
                <AdminLayout /> {/* AdminLayout contains its own Navbar/Sidebar and an Outlet */}
              </AdminPrivateRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            
            <Route path="companies" element={<CompanyListPage />} />
            <Route path="companies/add" element={<AddCompanyPage />} />
            <Route path="companies/edit/:companyId" element={<EditCompanyPage />} />
            <Route path="companies/:companyId" element={<ViewCompanyPage />} />

            {/* Placeholder for Product Management within a Company */}
            {/* <Route path="companies/:companyId/products/add" element={<AddProductToCompanyPage />} /> */}
            {/* <Route path="companies/:companyId/products/edit/:productId" element={<EditProductInCompanyPage />} /> */}
            
            {/* ... other protected admin routes would go here inside AdminLayout's Outlet ... */}
          </Route>

          {/* Fallback for unmatched admin routes (optional but good practice) */}
          <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Optional: General 404 Not Found Page for unmatched routes */}
          {/* <Route path="*" element={<div><h1>404 Not Found</h1><Link to="/">Go Home</Link></div>} /> */}

        </Routes>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;
