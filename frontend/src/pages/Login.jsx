import { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('accessToken', res.data.accessToken);
      toast.success('Logged in!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto space-y-4">
      <input type="email" name="email" placeholder="Email" onChange={handleChange} className="input" />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} className="input" />
      <button type="submit" className="btn">Login</button>
    </form>
  );
};

export default Login;
