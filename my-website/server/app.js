if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const multer = require('multer');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const authRoutes = require('./routes/auth');
const paypalRoutes = require('./routes/paypalserver');
const passport = require('./passportSetup');
const cron = require('node-cron');
const User = require('./models/User');
const Log = require('./models/logModel'); // Adjust the path to your Log model

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const allowedOrigins = [
  "https://young-beach-38748-bf9fd736b27e.herokuapp.com",
  "https://young-beach-38748-bf9fd736b27e.herokuapp.com/cloud-api",
  "https://young-beach-38748-bf9fd736b27e.herokuapp.com/login",
  "https://young-beach-38748-bf9fd736b27e.herokuapp.com/signup",
  "https://backend686868k-c9c97cdcbc27.herokuapp.com",
  "http://localhost:3001",
  "www.cliplt.com",
  "http://www.cliplt.com"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


// Configure CORS for Socket.IO
const io = socketIO(server, {
  cors: {
    origin: allowedOrigins, // Allow all origins
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

// MongoDB connection
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  // Handle other socket events as necessary
});
// Temporary route to convert dateOfSubscription fields
// app.get('/convert-dates', async (req, res) => {
//   try {
//     const users = await User.find({});
//     users.forEach(async user => {
//       if (typeof user.dateOfSubscription === 'string') {
//         user.dateOfSubscription = new Date(user.dateOfSubscription);
//         await user.save();
//       }
//     });
//     res.send('Conversion process started');
//   } catch (error) {
//     res.status(500).send('Error occurred: ' + error.message);
//   }
// });

// Cron job to reset tokens
cron.schedule('0 0 * * *', async () => {
  console.log('Running a daily check for token renewal');
  const usersToUpdate = await User.find({ dateOfSubscription: { $type: 'string' } });

  for (const user of usersToUpdate) {
    await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { dateOfSubscription: new Date(user.dateOfSubscription) } }
    );
  }

  console.log('after conversion:' );

  try {
    const today = new Date();
    const usersToRenew = await User.aggregate([
      {
        $addFields: {
          "dayOfSubscription": { $dayOfMonth: "$dateOfSubscription" }
        }
      },
      {
        $match: {
          "dayOfSubscription": today.getDate()
        }
      }
    ]);
    console.log('added fields');

    usersToRenew.forEach(async (user) => {
      let newTokenCount;
      switch (user.paymentPlan) {
        case 'regular':
          newTokenCount = 10;
          break;
        case 'premium':
          newTokenCount = 100;
          break;
        default:
          newTokenCount = 1; // Free or other plans
      }
    
      // Update the user document in the database
      try {
        await User.findByIdAndUpdate(user._id, {
          $set: { tokens: newTokenCount.toString() }
        });
        // Log this action
        await new Log({
          action: 'Token Renewal',
          userEmail: user.email,
          paymentPlan: user.paymentPlan,
          tokens: newTokenCount,
          timestamp: new Date()  // Current date and time
        }).save();
        console.log('updated users tokens', user.email);
      } catch (error) {
        console.error('Error updating user:', error);
      }
    });
    

  } catch (error) {
    console.error('Error in token renewal cron job:', error);
  }
});
// Confirm Email Route
app.get('/confirm/:confirmationCode', async (req, res) => {
  try {
    const { confirmationCode } = req.params;
    const user = await User.findOne({ confirmationCode });

    if (!user) {
      return res.status(404).send('Confirmation code not found');
    }

    // Mark the user as confirmed (you can add a field like 'isConfirmed' in the User model)
    user.isConfirmed = true;
    await user.save();

    res.status(200).send('Email confirmed successfully');
  } catch (error) {
    console.error('Email confirmation error:', error);
    res.status(500).send('Error confirming email');
  }
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
