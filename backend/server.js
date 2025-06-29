import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import { loginLimiter, apiLimiter } from './middleware/rateLimit.js';
import { securityMiddleware } from './middleware/security.js';
import upload from './middleware/upload.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import reservationRoutes from './routes/reservations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: './config.env' });

const app = express();

// Database Connection
connectDB();

// Security Middleware
securityMiddleware(app);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'||'https://restuarant-frontend-kjeu.onrender.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
app.use('/api/auth/login', loginLimiter);
app.use('/api', apiLimiter);

// CORS


// Request logging
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.path}`);
  next();
});
app.use(express.static('public'));
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('Params:', req.params);
  next();
});

app.options('*', cors()); 
app.use((req, res, next) => {
  if (req.originalUrl === '/api/categories' && req.method === 'POST') {
    // Skip body parsing for category uploads
    next();
  } else {
    // Use body parsing for other routes
    express.json({ limit: '10kb' })(req, res, next);
  }
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/reservations', reservationRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
