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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ================= PATH FIX =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= UPLOADS =================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ================= MIDDLEWARE =================

// ✅ CORS (IMPORTANT for Vercel)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://smart-agri-platform-delta.vercel.app'
  ],
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// ================= HEALTH CHECK =================
app.get('/', (req, res) => {
  res.status(200).send('🚀 Smart Agriculture API is running...');
});

// ================= DATABASE CONNECTION =================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Error:', err);
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

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route Not Found',
  });
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});