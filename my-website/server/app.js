// app.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const authRoutes = require('./routes/auth');
const paypalRoutes = require('./routes/paypalserver'); // Import the PayPal router
const passport = require('./passportSetup');

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

// Configure CORS for Express
const corsOptions = {
  origin: "http://localhost:3001", // Replace with your client's origin
  credentials: true, // Allow credentials (cookies, sessions, etc.)
};
app.use(cors(corsOptions));

// Configure CORS for Socket.IO
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3001", // Replace with your client's origin
    methods: ["GET", "POST"],
    credentials: true
  }
});

const storage = new Storage({ keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE });
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);
const upload = multer({ dest: 'uploads/' });

// Log environment variables to ensure they are loaded correctly
console.log('Environment Variables:');
console.log('PORT:', process.env.PORT);
console.log('DB_URI:', process.env.DB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Use CORS and JSON middleware
// Middleware setup

app.use(cors());
console.log('GOOGLE_CLOUD_KEY_FILE:', process.env.GOOGLE_CLOUD_KEY_FILE);
console.log('GOOGLE_CLOUD_BUCKET:', process.env.GOOGLE_CLOUD_BUCKET);

app.use(express.json());

// Using routers
app.use('/api/auth', authRoutes);
app.use('/api/paypal', paypalRoutes); // Use PayPal routes under /api/paypal

// Passport initialization
app.use(passport.initialize());

// MongoDB connection using environment variable for URI
// MongoDB connection
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);

    // Exit the application if there is a connection error

    process.exit(1);
  });


io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
    // Handle other socket events as necessary
});

// Route for video upload
app.post('/upload-video', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream({
    metadata: { contentType: req.file.mimetype },
  });

  blobStream.on('error', err => {
    console.error('Blob stream error:', err);
    res.status(500).send(err);
  });

  blobStream.on('finish', () => {
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    res.status(200).send({ url: publicUrl });
  });

  blobStream.end(req.file.buffer);
});

// Start the server with socket.io
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
