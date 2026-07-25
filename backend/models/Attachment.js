import mongoose from 'mongoose'

const attachmentSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  bug: { type: mongoose.Schema.Types.ObjectId, ref: 'Bug', required: true, index: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  resourceType: { type: String, default: 'auto' }
}, { timestamps: true })

export default mongoose.model('Attachment', attachmentSchema)
