if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const multer = require('multer');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const expressSitemapXml = require('express-sitemap-xml');
const { URL } = require('url');
const authRoutes = require('./routes/auth');
const paypalRoutes = require('./routes/paypalserver');
const passport = require('./passportSetup');
const cron = require('node-cron');
const User = require('./models/User');
const Log = require('./models/logModel'); // Adjust the path to your Log model
const compression = require('compression');
const cookieParser = require('cookie-parser');


function getUrls() {
  const baseUrl = 'https://www.cliplt.com';
  return [
      `${baseUrl}/`,
      `${baseUrl}/login`,
      `${baseUrl}/signup`,
      `${baseUrl}/home`,
      `${baseUrl}/home/Media`,
      `${baseUrl}/home/Media/stream-video`,
      `${baseUrl}/Media`,
      `${baseUrl}/Media/stream-video`,
      `${baseUrl}/how-it-works`,
      `${baseUrl}/explore-further`,
      `${baseUrl}/support`,
      `${baseUrl}/complaints`,
      `${baseUrl}/offers`,
      `${baseUrl}/free-user`,
      `${baseUrl}/regular-user`,
      `${baseUrl}/premium-user`,
      `${baseUrl}/partner`,
      `${baseUrl}/affiliate-dashboard`,
      // ... add any other specific routes you have
  ].map(url => new URL(url).pathname);
}

const app = express();
app.use(compression());

app.use(expressSitemapXml(getUrls, 'https://www.cliplt.com'));


const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const allowedOrigins = [
  "https://young-beach-38748-bf9fd736b27e.herokuapp.com",
  "https://young-beach-38748-bf9fd736b27e.herokuapp.com/home",
  "https://young-beach-38748-bf9fd736b27e.herokuapp.com/login",
  "https://young-beach-38748-bf9fd736b27e.herokuapp.com/signup",
  "https://backend686868k-c9c97cdcbc27.herokuapp.com",
  "http://localhost:3001",
  "https://www.cliplt.com",
  "http://www.cliplt.com",
  "http://localhost:3000/stream-video",
  "http://localhost:3001/home",
  "http://localhost:3001/home/Media",
  "http://localhost:3001/home/Media/stream-video",
  "http://localhost:3001/Media",
  "http://localhost:3001/Media/stream-video",
  "https://backend686868k-c9c97cdcbc27.herokuapp.com/home",
  "https://backend686868k-c9c97cdcbc27.herokuapp.com/stream-video",
  "https://clipit-ghiltw5oka-ue.a.run.app",
  "https://clipit-ghiltw5oka-ue.a.run.app/api",
  "https://backend686868k-c9c97cdcbc27.herokuapp.com/api/auth/signup",
  "https://backend686868k-c9c97cdcbc27.herokuapp.com/api/auth",
  "https://backend686868k-c9c97cdcbc27.herokuapp.com/api",
  "https://backend686868k-c9c97cdcbc27.herokuapp.com",
  "https://clipit-ghiltw5oka-ue.a.run.app",


];

// Middleware to set secure, SameSite cookies
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.cookies) {
    Object.keys(req.cookies).forEach(key => {
      res.cookie(key, req.cookies[key], {
        sameSite: 'None', 
        secure: true
      });
    });
  }
  next();
});

// Insert right after your app has been initialized
app.use((req, res, next) => {
  if (req.header('X-Forwarded-Proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('Host')}${req.url}`);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'index, follow');
  next();
});


// Middleware to log the origin of incoming requests
app.use((req, res, next) => {
  // Log the value of the Origin header
  console.log('Request Origin:', req.get('Origin'));

  // Proceed to the next middleware
  next();
});

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

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Might need to change later as it weakens the security of the site
        "https://www.paypal.com",
        "https://accounts.google.com",
        "https://connect.facebook.net",
        // Add any other script sources as needed
      ],
      reportUri: '/csp-report-endpoint', // Replace with the URL of your endpoint

      styleSrc: [
        "'self'",
        "https://accounts.google.com", // Allow styles from Google's domain
        "'unsafe-inline'",
        "https://accounts.google.com/gsi/style" // Add this line to allow the specific stylesheet
      ],
      styleSrcElem: [
        "'self'",
        "https://fonts.googleapis.com",
        "'unsafe-inline'",
        "https://accounts.google.com",
        "https://accounts.google.com/gsi/style"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://www.paypalobjects.com",
        "https://t.paypal.com",  // Add this line
        // Add any other image sources as needed
      ],
      connectSrc: [
        "'self'",
        "https://backend686868k-c9c97cdcbc27.herokuapp.com",
        "wss://backend686868k-c9c97cdcbc27.herokuapp.com",
        "https://www.paypal.com",
        "https://www.sandbox.paypal.com",
        "http://localhost:3001",
        "ws://localhost:3001",
        "https://young-beach-38748-bf9fd736b27e.herokuapp.com",
        "wss://young-beach-38748-bf9fd736b27e.herokuapp.com",
        "https://young-beach-38748-bf9fd736b27e.herokuapp.com/socket.io/",
        "https://young-beach-38748-bf9fd736b27e.herokuapp.com/socket.io",
        "http://localhost:5000",
        "https://localhost:5000",
        "https://clipit-ghiltw5oka-ue.a.run.app",
        "https://storage.googleapis.com",
        "https://storage.googleapis.com/clipitshorts",
        "http://localhost:5001",
        "https://localhost:5001",


                
      ],
      
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:",
        // Add any other font sources as needed
      ],
      frameSrc: [
        "'self'",
        "https://accounts.google.com", // Allow frames from Google
        "https://www.sandbox.paypal.com/",
        // Add any other frame sources as needed

      
      ],
      mediaSrc: [
        "'self'", 
        "blob:", 
        "data:",
        // If you know the exact bucket, you can specify it directly:
        "https://storage.googleapis.com/clipitshorts",
        "https://backend686868k-c9c97cdcbc27.herokuapp.com/stream-video", // Add this line
        "https://storage.googleapis.com",
        "https://storage.googleapis.com/clipitshorts",
        "https://storage.googleapis.com/clipitshorts/undefined"        
      ],
      // Add other directives as necessary
    },
  },
  crossOriginEmbedderPolicy: false, // Set to false if your site hosts cross-origin content
}));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));


// Endpoint to receive CSP violation reports
app.post('/csp-report-endpoint', (req, res) => {
  const report = req.body;
  // Log the CSP violation report
  console.log('CSP Violation Report:', report);
  // Respond with a 200 status to acknowledge receipt
  res.status(200).send('CSP report received');
});

// Google Cloud Storage setup
const storage = new Storage({ keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE });
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);
const upload = multer({ dest: 'uploads/' });
const clipItShortsBucket = storage.bucket('clipitshorts');

// Middleware setup
app.use(express.json());
app.use(passport.initialize());

// Using routers
app.use('/api/auth', authRoutes);
app.use('/api/paypal', paypalRoutes);

app.use((error, req, res, next) => {
  console.error('Unhandled Error:', error);
  res.status(500).send('Internal Server Error');
});


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

app.get('/stream-video', (req, res) => {
  const file = clipItShortsBucket.file('Simply ClipIt..mp4');
  
  file.getMetadata().then(data => {
    const metadata = data[0];
    const fileSize = metadata.size;
    const range = req.headers.range;
    
    if (range) {
      // Parse Range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      
      const stream = file.createReadStream({ start, end });

      // Set proper headers for partial content
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });

      stream.pipe(res);
    } else {
      // Set headers for full content
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });

      file.createReadStream().pipe(res);
    }
  }).catch(error => {
    console.error('Error in /stream-video route:', error);
    res.status(500).send('Internal Server Error');
  });
});
