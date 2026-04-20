import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Routes
import cropRoutes from './routes/crop.route.js';
import diseaseRoutes from './routes/disease.route.js';
import marketRoutes from './routes/market.route.js';
import communityRoutes from './routes/community.route.js';
import irrigationRoutes from './routes/irrigation.route.js';
import weatherRoutes from './routes/weather.route.js';
import authRoutes from './routes/auth.route.js';
import adminRoutes from './routes/admin.route.js';
import notificationRoutes from './routes/notification.route.js';
import chatRoutes from './routes/chat.route.js';
import settingsRoutes from './routes/settings.route.js';
import listingRoutes from './routes/listing.route.js';
import spotlightRoutes from './routes/spotlight.route.js';
import dashboardRoutes from './routes/dashboard.route.js';
import { trackVisit } from './middleware/analytics.middleware.js';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ================= PATH FIX =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= VERCEL FIX (READ-ONLY FILESYSTEM) =================
const isVercel = process.env.VERCEL === '1';
let uploadDir;

if (isVercel) {
  // On Vercel, the only writable directory is /tmp
  uploadDir = path.join('/tmp', 'uploads');
  console.log('🚀 Running on Vercel - Using /tmp/uploads for temporary storage');
} else {
  uploadDir = path.join(__dirname, 'uploads');
}

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`✅ Upload directory ready at: ${uploadDir}`);
  } catch (err) {
    console.warn(`⚠️ Could not create upload directory: ${err.message}`);
  }
}

// ================= ENV VAR CHECK =================
const criticalVars = ['MONGODB_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];
criticalVars.forEach(v => {
  if (!process.env[v]) {
    console.error(`❌ CRITICAL ENV VAR MISSING: ${v}`);
  }
});

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://[::1]:5173',
        'http://[::1]:5174',
        'https://smart-agri-platform-delta.vercel.app',
      ];
      
      // Allow local origins and all Vercel subdomains
      const isVercelOrigin = origin && origin.endsWith('.vercel.app');

      if (!origin || allowedOrigins.includes(origin) || isVercelOrigin || origin.match(/^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/) || origin.match(/^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/) || origin.match(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+(:\d+)?$/)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', cors(), express.static(uploadDir));

// ================= GLOBAL ERROR HANDLERS =================
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
});

// ================= DATABASE CONNECTION =================
let dbPromise = null;

const connectDB = async () => {
  if (dbPromise && mongoose.connection.readyState === 1) return dbPromise;

  dbPromise = (async () => {
    try {
      console.log('⏳ Connecting to MongoDB...');
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined!');
      }
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
      });
      console.log('✅ MongoDB connected');
      return true;
    } catch (err) {
      console.error('❌ MongoDB connection error:', err.message);
      dbPromise = null; // Allow retry on next request
      throw err;
    }
  })();

  return dbPromise;
};

// Middleware to ensure DB is connected
const ensureDB = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (err) {
    res.status(503).json({ 
      success: false, 
      message: 'Database connection in progress. Please refresh in a moment.' 
    });
  }
};

// ================= START SERVER (Vercel Background) =================
if (process.env.VERCEL) {
  connectDB().catch(() => {});
}

// Global Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// ================= HEALTH CHECK =================
app.get('/', (req, res) => {
  res.status(200).send('🚀 Smart Agriculture API is running...');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is awake and healthy',
    timestamp: new Date().toISOString(),
    isVercel: isVercel,
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    marketApiKey: !!process.env.DATA_GOV_API_KEY
  });
});

app.use(trackVisit);

// ================= ROUTES =================
app.use('/api/auth', ensureDB, authRoutes);
app.use('/api/admin', ensureDB, adminRoutes);
app.use('/api/notifications', ensureDB, notificationRoutes);
app.use('/api/chat', ensureDB, chatRoutes);
app.use('/api/crops', ensureDB, cropRoutes);
app.use('/api/disease', ensureDB, diseaseRoutes);
app.use('/api/market', ensureDB, marketRoutes);
app.use('/api/community', ensureDB, communityRoutes);
app.use('/api/irrigation', ensureDB, irrigationRoutes);
app.use('/api/weather', ensureDB, weatherRoutes);
app.use('/api/listings', ensureDB, listingRoutes);
app.use('/api/settings', ensureDB, settingsRoutes);
app.use('/api/spotlights', ensureDB, spotlightRoutes);
app.use('/api/dashboard', ensureDB, dashboardRoutes);

// ================= TEST ROUTE =================
app.post('/test', (req, res) => {
  res.json({
    success: true,
    message: 'POST request working',
    body: req.body,
  });
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route Not Found: ${req.method} ${req.originalUrl}`,
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ================= SOCKET.IO =================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const socketUsers = {}; // userId -> socketId

// Expose to app for controllers
app.set('io', io);
app.set('socketUsers', socketUsers);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socketUsers[userId] = socket.id;
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on('callUser', ({ userToCall, signalData, from, name, type }) => {
    const targetSocketId = socketUsers[userToCall];
    if (targetSocketId) {
      console.log(`Calling user ${userToCall} (socket ${targetSocketId}) from ${from}`);
      io.to(targetSocketId).emit('callUser', { signal: signalData, from, name, type });
    }
  });

  socket.on('answerCall', (data) => {
    console.log(`Answering call to ${data.to}`);
    io.to(data.to).emit('callAccepted', data.signal);
  });

  socket.on('endCall', ({ to }) => {
    const targetSocketId = socketUsers[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('callEnded');
    }
  });

  // Typing Indicators
  socket.on('typing', ({ to, from, name }) => {
    const targetSocketId = socketUsers[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('typing', { from, name });
    }
  });

  socket.on('stop_typing', ({ to, from }) => {
    const targetSocketId = socketUsers[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('stop_typing', { from });
    }
  });

  // Message Status
  socket.on('message_seen', ({ to, from }) => {
    const targetSocketId = socketUsers[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('message_seen', { from });
    }
  });

  socket.on('disconnect', () => {
    for (let id in socketUsers) {
      if (socketUsers[id] === socket.id) {
        delete socketUsers[id];
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// ================= GLOBAL ERROR HANDLERS =================
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
});


// ================= START SERVER =================
if (!process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    connectDB().catch(() => {});
  });
}

export default app;
export { server, io };