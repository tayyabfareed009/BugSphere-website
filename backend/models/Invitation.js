import mongoose from 'mongoose'

const invitationSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  role: { type: String, enum: ['Project Manager', 'Team Lead', 'Developer', 'Tester', 'Viewer'], default: 'Developer' },
  token: { type: String, required: true, unique: true, select: false },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  acceptedAt: Date
}, { timestamps: true })
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
export default mongoose.model('Invitation', invitationSchema)
