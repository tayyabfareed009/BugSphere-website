import dotenv from 'dotenv'
dotenv.config();
import cloudinary, { configureCloudinary } from './config/cloudinary.js';
configureCloudinary();

console.log(cloudinary.config(true));
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import bugRoutes from './routes/bugRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import userRoutes from './routes/userRoutes.js'
//import cloudinary from './config/cloudinary.js';
import organizationRoutes from './routes/organizationRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import teamRoutes from './routes/teamRoutes.js'
import workRoutes from './routes/workRoutes.js'
console.log({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing",
});


const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'BugSphere' }))
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/bugs', bugRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/organization', organizationRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api', workRoutes)
app.use('/api', reportRoutes)

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 5000

connectDB()
  .then(() => app.listen(port, () => console.log(`BugSphere API running on port ${port}`)))
  .catch((error) => {
    console.error('Database connection failed', error)
    process.exit(1)
  })
