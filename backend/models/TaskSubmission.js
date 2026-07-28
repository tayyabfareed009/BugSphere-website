import mongoose from 'mongoose'
const taskSubmissionSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true }, hoursWorked: { type: Number, required: true, min: 0, max: 24 },
  links: [{ type: String }], status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Changes Requested'], default: 'Pending' },
  reviewNote: String, reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, submissionDate: { type: Date, default: Date.now },
  attachments: [{ url: String, publicId: String, filename: String, mimeType: String, uploadedAt: { type: Date, default: Date.now } }]
}, { timestamps: true })
taskSubmissionSchema.index({ organization: 1, employee: 1, submissionDate: -1 })
export default mongoose.model('TaskSubmission', taskSubmissionSchema)
