import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema({ url: String, publicId: String, filename: String, mimeType: String, uploadedAt: { type: Date, default: Date.now } }, { _id: false })
const requirementSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  status: { type: String, enum: ['Draft', 'In Review', 'Approved', 'Rejected'], default: 'Draft' },
  version: { type: Number, default: 1 },
  files: [fileSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvalHistory: [{ status: String, note: String, actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } }]
}, { timestamps: true })
requirementSchema.index({ organization: 1, project: 1, title: 1 })
export default mongoose.model('Requirement', requirementSchema)
