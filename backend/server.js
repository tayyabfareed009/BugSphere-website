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
    'http://localhost:5173',
    'https://bug-sphere-website-tayyabfareed009s-projects.vercel.app'
];

const corsOptions = {
    origin(origin, callback) {

        // Allow Postman, mobile apps, server-to-server requests
        if (!origin) {
            return callback(null, true);
        }

        // Allow localhost and production frontend
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow ALL Vercel preview deployments
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        console.log('Blocked by CORS:', origin);

        callback(new Error('Not allowed by CORS'));
    },

    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization'
    ]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
=========================== */app.get('/api/health', async (req, res) => {
    try {
        const mongoose = (await import('mongoose')).default;

        res.status(200).json({
            success: true,
            message: "WorkSphere API Running",
            timestamp: new Date().toISOString(),

            server: {
                node: process.version,
                environment: process.env.NODE_ENV,
                vercel: !!process.env.VERCEL,
                uptime: `${Math.floor(process.uptime())}s`
            },

            request: {
                method: req.method,
                origin: req.headers.origin || null,
                host: req.headers.host,
                ip: req.ip
            },

            database: {
                connected: mongoose.connection.readyState === 1,
                state: mongoose.connection.readyState,
                name: mongoose.connection.name || null
            },

            environment: {
                CLIENT_URL: !!process.env.CLIENT_URL,
                MONGODB_URI: !!process.env.MONGODB_URI,
                JWT_SECRET: !!process.env.JWT_SECRET,
                CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
                CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
                CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
                FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
                FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
                FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Health check failed",
            error: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

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