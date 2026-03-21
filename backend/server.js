import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

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



const app = express();
const PORT = process.env.PORT || 5001;

// ================= PATH FIX =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= UPLOADS =================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://smart-agri-platform-delta.vercel.app',
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// ================= HEALTH CHECK =================
app.get('/', (req, res) => {
  res.status(200).send('🚀 Smart Agriculture API is running...');
});

// ================= DATABASE CONNECTION =================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

// ================= ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/weather', weatherRoutes);

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

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});