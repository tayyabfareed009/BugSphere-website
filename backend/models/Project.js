import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  key: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  milestones: [{ title: String, dueDate: Date, completed: { type: Boolean, default: false } }],
  status: { type: String, enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Archived'], default: 'Active' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  startDate: Date, endDate: Date, dueDate: Date,
  progress: { type: Number, min: 0, max: 100, default: 0 },
  attachments: [{ url: String, publicId: String, filename: String, mimeType: String, uploadedAt: { type: Date, default: Date.now } }]
}, { timestamps: true })
projectSchema.index({ organization: 1, key: 1 }, { unique: true })

export default mongoose.model('Project', projectSchema)
