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
const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true
};

app.use(cors(corsOptions));

// app.options('*', cors(corsOptions));

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
    res.status(200).json({
        success: true,
        message: "WorkSphere API Running",
        timestamp: new Date().toISOString(),

        environment: {
            nodeEnv: process.env.NODE_ENV,
            vercel: process.env.VERCEL || false,
            port: process.env.PORT || null
        },

        request: {
            method: req.method,
            origin: req.headers.origin || null,
            host: req.headers.host,
            userAgent: req.headers["user-agent"]
        },

        cors: {
            clientUrl: process.env.CLIENT_URL || null
        },

        database: {
            configured: !!process.env.MONGODB_URI
        },

        cloudinary: {
            configured:
                !!process.env.CLOUDINARY_CLOUD_NAME &&
                !!process.env.CLOUDINARY_API_KEY &&
                !!process.env.CLOUDINARY_API_SECRET
        },

        firebase: {
            configured:
                !!process.env.FIREBASE_PROJECT_ID &&
                !!process.env.FIREBASE_CLIENT_EMAIL &&
                !!process.env.FIREBASE_PRIVATE_KEY
        }
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