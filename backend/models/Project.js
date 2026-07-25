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
  dueDate: Date
}, { timestamps: true })
projectSchema.index({ organization: 1, key: 1 }, { unique: true })

export default mongoose.model('Project', projectSchema)
