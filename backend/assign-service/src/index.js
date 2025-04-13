const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const logger = require('./utils/logger');
const AppError = require('./utils/AppError');
const errorHandler = require('./middleware/error');
const assignmentRoutes = require('./routes/assignment.routes');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true // Allow cookies to be sent
}));

// Routes
app.use('/api/assignments', assignmentRoutes);

//health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'assign-service' });
});

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch(err => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Assignment service running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error('Unhandled rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error('Uncaught exception:', err);
  process.exit(1);
}); 