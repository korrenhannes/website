if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const multer = require('multer');
const path = require('path'); // Import path module
const { Storage } = require('@google-cloud/storage');
const authRoutes = require('./routes/auth');
const paypalRoutes = require('./routes/paypalserver');
const passport = require('./passportSetup');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Configure CORS for Express
// You might need to adjust the origin for production environment
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "https://young-beach-38748-bf9fd736b27e.herokuapp.com",
  credentials: true,
};
app.use(cors(corsOptions));

// Configure CORS for Socket.IO
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "https://young-beach-38748-bf9fd736b27e.herokuapp.com",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Google Cloud Storage setup
const storage = new Storage({ keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE });
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);
const upload = multer({ dest: 'uploads/' });

// Middleware setup
app.use(express.json());
app.use(passport.initialize());

// Using routers
app.use('/api/auth', authRoutes);
app.use('/api/paypal', paypalRoutes);
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

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

// Start the server with socket.io
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});