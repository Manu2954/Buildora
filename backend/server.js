const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db'); 


const authRoutes = require('./auth/auth.routes');
const adminRoutes = require('./routes/AdminRoutes');
const userRoutes = require('./routes/userAdminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes')
const orderRoutes = require('./routes/orderRoutes'); 
const storefrontRoutes = require('./routes/storefrontRoutes');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use('/images', express.static('public/images'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/dashboard', dashboardRoutes); 
app.use('/api/storefront', storefrontRoutes); 
app.use('/api/orders', orderRoutes); 

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // --- THIS IS THE CRITICAL STEP ---
        // Connect to the database FIRST.
        await connectDB();
        console.log('MongoDB Connected...');

        // Only after a successful DB connection, start the Express server.
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1); // Exit process with failure
    }
};

// --- Start the Server ---
startServer();


// Optional: Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    // server.close(() => process.exit(1));
});