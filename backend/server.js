import dotenv from 'dotenv';
dotenv.config();

import cloudinary, { configureCloudinary } from './config/cloudinary.js';
configureCloudinary();

console.log(cloudinary.config(true)); // optional – can be removed in production

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import bugRoutes from './routes/bugRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import workRoutes from './routes/workRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── CORS ──
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: clientUrl, credentials: true }));

// ── Middleware ──
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Static files (for local development only; on Vercel, use Cloudinary) ──
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ──
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'WorkSphere' }));

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api', workRoutes);
app.use('/api', reportRoutes);

// ── Error handling ──
app.use(notFound);
app.use(errorHandler);

// ── Database connection ──
// Connect once on module load (works for serverless – connection reused across invocations)
connectDB().catch((err) => {
  console.error('❌ Database connection failed:', err);
  // Don't exit – let Vercel handle the error gracefully
});

// ── Export the app for Vercel ──
export default app;

// ── Start server only when run directly (not in Vercel) ──
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`🚀 WorkSphere API running locally on port ${port}`);
  });
}