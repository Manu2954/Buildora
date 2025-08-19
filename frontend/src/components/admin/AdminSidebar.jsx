// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { LayoutDashboard, Briefcase, Users, ShoppingBag, Settings, Building } from 'lucide-react'; // Using lucide-react for icons

// const AdminSidebar = ({ isOpen, toggleSidebar }) => {
//     const commonLinkClasses = "flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-150";
//     const activeLinkClasses = "bg-indigo-100 text-indigo-700 font-semibold";

//     const navItems = [
//         { to: "/admin/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
//         { to: "/admin/companies", icon: <Building size={20} />, label: "Companies" },
//         // { to: "/admin/products", icon: <ShoppingBag size={20} />, label: "Products" }, // Future: All products view
//         // { to: "/admin/users", icon: <Users size={20} />, label: "Users" }, // If managing customers/dealers
//         // { to: "/admin/orders", icon: <Briefcase size={20} />, label: "Orders" },
//         // { to: "/admin/settings", icon: <Settings size={20} />, label: "Settings" },
//     ];

//     return (
//         <>
//             {/* Overlay for mobile */}
//             {isOpen && (
//                 <div
//                     className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
//                     onClick={toggleSidebar}
//                 ></div>
//             )}

//             <aside
//                 className={`fixed inset-y-0 left-0 z-30 flex-shrink-0 w-64 overflow-y-auto bg-white border-r transform ${
//                     isOpen ? 'translate-x-0' : '-translate-x-full'
//                 } lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-200 ease-in-out`}
//             >
//                 <div className="p-4">
//                     <NavLink to="/admin/dashboard" className="flex items-center justify-center mb-6">
//                         {/* You can add a logo here */}
//                         <span className="ml-2 text-2xl font-bold text-indigo-600">Buildora</span>
//                     </NavLink>
//                     <nav className="space-y-2">
//                         {navItems.map(item => (
//                              <NavLink
//                                 key={item.to}
//                                 to={item.to}
//                                 className={({ isActive }) =>
//                                     `${commonLinkClasses} ${isActive ? activeLinkClasses : ''}`
//                                 }
//                                 onClick={() => { if (isOpen && window.innerWidth < 1024) toggleSidebar(); }} // Close sidebar on mobile nav
//                             >
//                                 {item.icon && <span className="mr-3">{item.icon}</span>}
//                                 {item.label}
//                             </NavLink>
//                         ))}
//                     </nav>
//                 </div>
//             </aside>
//         </>
//     );
// };

// export default AdminSidebar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building, ShoppingBag, Upload, Image, Megaphone, PhoneCall } from 'lucide-react';
import Logo from '../Logo';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
    const commonLinkClasses = "flex items-center px-4 py-3 text-text rounded-lg hover:bg-primary/10 hover:text-primary transition-colors duration-150";
    const activeLinkClasses = "bg-primary/20 text-primary font-semibold";

    const navItems = [
        { to: "/admin/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
        { to: "/admin/companies", icon: <Building size={20} />, label: "Companies" },
        { to: "/admin/products", icon: <ShoppingBag size={20} />, label: "Products" },
          { to: "/admin/bulk-upload", icon: <Upload size={20} />, label: "Bulk Upload" },
        { to: "/admin/users", icon: <Users size={20} />, label: "Users" },
        { to: "/admin/image-library", icon: <Image size={20} />, label: "Image Library" }, // New Link
        { to: "/admin/orders", icon: <ShoppingBag size={20} />, label: "Orders" },
        { to: "/admin/advertisements", icon: <Megaphone size={20} />, label: "Ads Management" }, // New Link
        { to: "/admin/leads", icon: <PhoneCall size={20} />, label: "Leads" },

        
        // { to: "/admin/orders", icon: <Briefcase size={20} />, label: "Orders" },
        // { to: "/admin/settings", icon: <Settings size={20} />, label: "Settings" },
    ];

    return (
        <>
            {/* Overlay for all devices when sidebar is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black opacity-50"
                    onClick={toggleSidebar}
                ></div>
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto bg-white border-r transform ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-200 ease-in-out`}
            >
                <div className="p-4">
                    <NavLink to="/admin/dashboard" className="flex items-center justify-center mb-6">
                        <Logo variant="full" size="large" showText={true} textClassName="text-2xl font-bold text-primary" />
                    </NavLink>
                    <nav className="space-y-2">
                        {navItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `${commonLinkClasses} ${isActive ? activeLinkClasses : ''}`
                                }
                                onClick={toggleSidebar} // Always toggle, no screen size check
                            >
                                {item.icon && <span className="mr-3">{item.icon}</span>}
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
