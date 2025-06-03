import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
       <Routes>
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register />} />
       </Routes>
     </BrowserRouter>
    // <div className="min-h-screen flex items-center justify-center bg-gray-100 text-3xl font-bold">
    //   👷 Buildora is styled with Tailwind
    // </div>
  );
};

export default App;