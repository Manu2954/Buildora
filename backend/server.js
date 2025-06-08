const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./auth/auth.routes');
const adminRoutes = require('./routes/AdminRoutes');
const userRoutes = require('./routes/userAdminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes')

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use('/images', express.static('public/images'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/dashboard', dashboardRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
