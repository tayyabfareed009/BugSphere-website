import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  title: { type: String, required: true, trim: true }, description: { type: String, default: '' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'Assigned', 'In Progress', 'Under Review', 'Completed', 'Rejected', 'Reopened'], default: 'Pending' },
  deadline: Date, estimatedHours: { type: Number, min: 0 }, dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  attachments: [{ url: String, publicId: String, filename: String, mimeType: String, uploadedAt: { type: Date, default: Date.now } }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })
taskSchema.index({ organization: 1, project: 1, status: 1 })
export default mongoose.model('Task', taskSchema)
