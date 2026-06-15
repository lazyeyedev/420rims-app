require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes    = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const dealerRoutes  = require('./routes/dealerRoutes');
const userRoutes    = require('./routes/userRoutes');
const adminRoutes   = require('./routes/adminRoutes');
const boostRoutes   = require('./routes/boostRoutes');

connectDB();

const app = express();

app.use(cors({
  origin:      process.env.CLIENT_URL,
  credentials: true,
}));

app.use(helmet());
app.use(morgan('dev'));

// NOTE: express.json() is applied globally here.
// The Paystack webhook route applies express.raw() at the route level
// BEFORE express.json() touches it, so signature verification works correctly.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

app.use('/api/auth',     authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/dealers',  dealerRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/boosts',   boostRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
