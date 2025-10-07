const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// const mongoSanitize = require('express-mongo-sanitize'); // REMOVED
const rateLimit = require('express-rate-limit');
const http = require('http');
const passport = require('passport');
require('dotenv').config();

// --- Import all necessary modules ---
const connectDB = require('./src/config/db');
const { initializeSocket } = require('./src/socket/socketHandler');
const { startCronJobs } = require('./src/services/cron.service');
const { errorHandler } = require('./src/middleware/error.middleware');
const authRoutes = require('./src/routes/auth.routes');
const deliveryRoutes = require('./src/routes/delivery.routes');
const adminRoutes = require('./src/routes/admin.routes');
const uploadRoutes = require('./src/routes/upload.routes');
const notificationRoutes = require('./src/routes/notification.routes');

// --- Initialize Express App ---
const app = express();
const server = http.createServer(app);

// --- Connect to Database & Initialize Services ---
connectDB();
initializeSocket(server);
startCronJobs();

// --- Setup Middleware ---
require('./src/config/passport')(passport); // Passport config
app.use(helmet()); // Basic security headers
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Body parser for JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Body parser for URL-encoded data
app.use(passport.initialize());
app.use('/uploads', express.static('uploads')); // Serve static files

// --- Rate Limiter ---
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// --- Application Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
// Note: Payment routes are commented out as they are in your original file
// app.use('/api/payments', paymentRoutes);

// --- Health Check and Final Error Handlers ---
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// 404 Handler for any routes not matched above
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler (must be the very last middleware)
app.use(errorHandler);

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

module.exports = app;

