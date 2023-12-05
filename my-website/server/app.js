// app.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const paypalRoutes = require('./routes/paypalserver'); // Import the PayPal router
const passport = require('./passportSetup');

const app = express();
const port = process.env.PORT || 3000;

// Log environment variables to ensure they are loaded correctly
console.log('Environment Variables:');
console.log('PORT:', process.env.PORT);
console.log('DB_URI:', process.env.DB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
// Middleware setup
app.use(cors());
app.use(express.json());

// Using routers
app.use('/api/auth', authRoutes);
app.use('/api/paypal', paypalRoutes); // Use PayPal routes under /api/paypal

// Passport initialization
app.use(passport.initialize());

// MongoDB connection
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
