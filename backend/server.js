import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import passport from './config/passport.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import { loginLimiter, apiLimiter, foodApiLimiter } from './middleware/rateLimit.js';
import { securityMiddleware } from './middleware/security.js';
import upload from './middleware/upload.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import reservationRoutes from './routes/reservations.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import tableRoutes from './routes/tableRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Database Connection
connectDB();

// Enhanced CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', // Local development
  'http://localhost:5174', // Alternative Vite port
  'http://localhost:3000', // Alternative local development
  'http://127.0.0.1:5173', // Alternative localhost
  'http://127.0.0.1:5174', // Alternative localhost
  'https://restuarant-frontend-kjeu.onrender.com' // Production frontend
];

// Trust proxy
app.set('trust proxy', 1);

// Security Middleware
securityMiddleware(app);

// Enhanced CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log the blocked origin for debugging
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Explicit preflight handling
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});

// Session configuration for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting - Apply different limiters based on routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/foods', foodApiLimiter);
app.use('/api', apiLimiter);

// Request logging
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', req.body);
  }
  next();
});

// API Routes - IMPORTANT: Mount these after all middleware but before error handlers
console.log('🚀 Registering API routes...');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered');
app.use('/api/admin', adminRoutes);
console.log('✅ Admin routes registered');
app.use('/api/users', userRoutes);
console.log('✅ User routes registered');
app.use('/api/foods', foodRoutes);
console.log('✅ Food routes registered');
app.use('/api/categories', categoryRoutes);
console.log('✅ Category routes registered');
app.use('/api/orders', orderRoutes);
console.log('✅ Order routes registered');
app.use('/api/staff', staffRoutes);
console.log('✅ Staff routes registered');
app.use('/api/reservations', reservationRoutes);
console.log('✅ Reservation routes registered');
app.use('/api/feedback', feedbackRoutes);
console.log('✅ Feedback routes registered');
app.use('/api/tables', tableRoutes);
console.log('✅ Table routes registered');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    routes: {
      sendOTP: '/api/auth/send-otp',
      verifyOTP: '/api/auth/verify-otp'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to KISSme Restaurant ');
});

// 404 Handler - MUST come after all routes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
    availableRoutes: [
      '/api/auth/send-otp',
      '/api/auth/verify-otp',
      '/api/auth/login',
      '/api/auth/signup'
    ]
  });
});

// Error Handler - MUST be last middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
});
export default app;