const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Node.js module for working with file paths
const cors = require('cors');
const connectDB = require('./config/db'); 


const authRoutes = require('./auth/auth.routes');
const adminRoutes = require('./routes/AdminRoutes');
const userRoutes = require('./routes/userAdminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes')
const orderRoutes = require('./routes/orderRoutes'); 
const storefrontRoutes = require('./routes/storefrontRoutes');
const adminOrderRoutes = require('./routes/adminOrderRoutes');
const searchLogRoutes = require('./routes/searchLogRoutes');
const bulkUploadRoutes = require('./routes/bulkUploadRoutes');
const companyRoutes = require('./routes/companyRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // Your new upload routes
const paymentRoutes = require('./routes/paymentRoutes');
const leadRoutes = require('./routes/leadRoutes');
const adminLeadRoutes = require('./routes/adminLeadRoutes');

const app = express();
app.use(express.json());
const corsOptions = {
    origin: [
        'http://localhost:3000', // For your local development
        'https://www.buildoraenterprise.com'
    ],
    credentials: true,
};
app.use(cors(corsOptions));

app.use('/images', express.static('public/images'));
app.use('/videos', express.static('public/videos'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/storefront', storefrontRoutes); 
app.use('/api/orders', orderRoutes); 
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/leads', leadRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/leads', adminLeadRoutes);
app.use('/api/logs/search', searchLogRoutes);
companyRoutes.use('/:companyId/products/bulk-upload', bulkUploadRoutes);
app.use('/api/admin/upload', uploadRoutes);


const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // --- THIS IS THE CRITICAL STEP ---
        // Connect to the database FIRST.
        console.log(process.env.NODE_ENV)
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
