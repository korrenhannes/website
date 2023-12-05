require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
<<<<<<< HEAD
=======
const http = require('http');
const socketIO = require('socket.io');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
const authRoutes = require('./routes/auth');
const passport = require('./passportSetup');

const app = express();
const port = process.env.PORT || 3000;
<<<<<<< HEAD
=======
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
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76

// Log environment variables to ensure they are loaded correctly
console.log('Environment Variables:');
console.log('PORT:', process.env.PORT);
console.log('DB_URI:', process.env.DB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
<<<<<<< HEAD

// Use CORS and JSON middleware
app.use(cors());
=======
console.log('GOOGLE_CLOUD_KEY_FILE:', process.env.GOOGLE_CLOUD_KEY_FILE);
console.log('GOOGLE_CLOUD_BUCKET:', process.env.GOOGLE_CLOUD_BUCKET);

>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
app.use(express.json());

// Use authentication routes
app.use('/api/auth', authRoutes);

// Initialize Passport
app.use(passport.initialize());

<<<<<<< HEAD
// MongoDB connection using environment variable for URI
=======
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => {
    console.error('MongoDB connection error:', error);
<<<<<<< HEAD
    // Exit the application if there is a connection error
    process.exit(1);
});

// Start the server
app.listen(port, () => {
=======
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
>>>>>>> 4353c732b80537dea39e20140b5e75195065be76
  console.log(`Server is running on port ${port}`);
});
