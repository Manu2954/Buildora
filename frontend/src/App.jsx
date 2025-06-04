import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dasboard';
import PrivateRoute from './components/PrivateRoute';
import VerifyEmail from './pages/verify-email';

function App() {
  return (
    <BrowserRouter>
    <Navbar/>
       <Routes>
        <Route path="/" element = {<Home/>} />
          <Route path="/verify" element={<VerifyEmail />} />
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register />} />
         <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>
       </Routes>
     </BrowserRouter>
    // <div className="min-h-screen flex items-center justify-center bg-gray-100 text-3xl font-bold">
    //   👷 Buildora is styled with Tailwind
    // </div>
  );
};

export default App;