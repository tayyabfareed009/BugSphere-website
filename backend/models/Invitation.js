import mongoose from 'mongoose'

const invitationSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  role: { type: String, enum: ['Project Manager', 'Team Manager', 'Team Lead', 'Developer', 'Tester', 'QA Engineer', 'UI Designer', 'DevOps Engineer', 'Viewer'], default: 'Developer' },
  token: { type: String, unique: true, sparse: true, select: false },
  tokenHash: { type: String, unique: true, sparse: true, select: false },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  expiresAt: { type: Date, required: true },
  acceptedAt: Date,
  canceledAt: Date,
  lastSentAt: Date
}, { timestamps: true })
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
export default mongoose.model('Invitation', invitationSchema)
