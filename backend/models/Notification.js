import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['Bug', 'Comment', 'Project', 'System'], default: 'System' }
}, { timestamps: true })

export default mongoose.model('Notification', notificationSchema)
