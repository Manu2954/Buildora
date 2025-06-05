// src/components/Sidebar.jsx
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-md hidden md:block">
      {/* <div className="p-4 font-bold text-lg text-blue-600">Buildora</div> */}

      {/* <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden p-2"
      >
        <MenuIcon />
      </button> */}

      <nav className="flex flex-col gap-2 p-4">
        <Link to="/dashboard" className="text-gray-700 hover:text-blue-500">
          Dashboard
        </Link>
        <Link to="/orders" className="text-gray-700 hover:text-blue-500">
          Orders
        </Link>
        {/* <Link to="/inventory" className="text-gray-700 hover:text-blue-500">
          Inventory
        </Link> */}
        <Link to="/profile" className="text-gray-700 hover:text-blue-500">
          Profile
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
