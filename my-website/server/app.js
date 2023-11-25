require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

// Log environment variables to ensure they are loaded correctly
console.log('Environment Variables:');
console.log('PORT:', process.env.PORT);
console.log('DB_URI:', process.env.DB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Use CORS and JSON middleware
app.use(cors());
app.use(express.json());

// Use authentication routes
app.use('/api/auth', authRoutes);c

// MongoDB connection using environment variable for URI
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => {
    console.error('MongoDB connection error:', error);
    // Exit the application if there is a connection error
    process.exit(1);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
