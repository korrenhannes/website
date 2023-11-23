require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

// Use CORS and JSON middleware
app.use(cors());
app.use(express.json());

// Use authentication routes
app.use('/api/auth', authRoutes);

// MongoDB connection using environment variable for URI
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
