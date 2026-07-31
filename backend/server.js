import dotenv from 'dotenv';
dotenv.config();

import cloudinary, { configureCloudinary } from './config/cloudinary.js';
configureCloudinary();

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

/* ===========================
   CORS Configuration
=========================== */
/* ===========================
   CORS Configuration
=========================== */

app.use(cors({
    origin: true,
    credentials: true
}));

// app.use(cors({
//     origin: true,
//     credentials: true
// }));
/* ===========================
   Middleware
=========================== */

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ===========================
   Health Check
=========================== */

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'WorkSphere API Running'
    });
});

/* ===========================
   Routes
=========================== */

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

/* ===========================
   Error Handlers
=========================== */

app.use(notFound);
app.use(errorHandler);

/* ===========================
   Database
=========================== */

connectDB().catch(err => {
    console.error('Database Connection Failed:', err);
});

/* ===========================
   Export
=========================== */

export default app;

/* ===========================
   Local Development
=========================== */

if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}