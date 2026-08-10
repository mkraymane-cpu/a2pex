require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Security headers (disables X-Powered-By, sets sane defaults for
// HSTS/CSP-adjacent headers, etc.).
app.use(helmet());

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Brute-force protection on login: 10 attempts per 15 minutes per IP.
// Applied narrowly (not globally) so it never throttles normal storefront
// or admin CRUD traffic — only repeated failed/attempted logins.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in a few minutes.' },
});
app.use('/api/auth/login', loginLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'A2PEX Kits API' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
