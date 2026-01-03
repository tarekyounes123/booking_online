// Load environment variables FIRST
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { connectDB } = require('./config/db');
const { limiter, authLimiter, apiLimiter, securityMiddleware } = require('./middleware/security');
const { scheduleAppointmentReminders } = require('./utils/appointmentReminders');

// Connect to database
connectDB();

const app = express();

// Apply security middleware
app.use(securityMiddleware);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'http://localhost:3000'  // Fallback to localhost:3000 if FRONTEND_URL is not set
    : 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));

// Apply specific rate limiting to auth routes
app.use('/api/auth', authLimiter);

// Apply general rate limiting to other API routes
app.use('/api/', apiLimiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/services', require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/reviews', require('./routes/reviews')); // Add reviews routes
app.use('/api/promotions', require('./routes/promotions'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // In development, let React dev server handle frontend
  // This route is just a fallback
  app.get('/', (req, res) => {
    res.json({ message: 'Server is running in development mode' });
  });
}

// Error handling middleware
app.use(require('./middleware/error'));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // Start appointment reminder scheduler
  scheduleAppointmentReminders();
  console.log('Appointment reminder scheduler started');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});