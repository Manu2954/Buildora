import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-100 shadow">
      <h1 className="text-xl font-bold">Buildora</h1>
      <div className="space-x-4">
        <Link to="/" className="text-blue-500 hover:underline">Home</Link>
        <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
        <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;
