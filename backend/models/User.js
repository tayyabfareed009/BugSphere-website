import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  firebaseUid: { type: String, required: true, unique: true, index: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  role: { type: String, enum: ['Owner', 'Project Manager', 'Team Manager', 'Team Lead', 'Developer', 'Tester', 'QA Engineer', 'UI Designer', 'DevOps Engineer', 'Viewer'], default: 'Tester' },
  avatar: { type: String, default: '' },
  phone: { type: String, trim: true, default: '' },
  active: { type: Boolean, default: true, index: true },
  lastLoginAt: Date,
  notificationsEnabled: { type: Boolean, default: true }
}, { timestamps: true })

userSchema.index({ organization: 1, email: 1 }, { unique: true })

export default mongoose.model('User', userSchema)
