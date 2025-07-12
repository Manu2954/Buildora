// src/components/DashboardLayout.jsx
// import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
