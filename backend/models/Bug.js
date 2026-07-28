import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  url: String,
  publicId: String,
  filename: String,
}, { _id: false });

const bugSchema = new mongoose.Schema({
  bugId: { type: String, unique: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  severity: {
    type: String,
    enum: ['Minor', 'Major', 'Critical', 'Blocker'],
    default: 'Minor',
  },
  status: {
    type: String,
    enum: ['Open', 'Assigned', 'In Progress', 'Ready for Testing', 'Testing', 'Reopened', 'Resolved', 'Closed'],
    default: 'Open',
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedDeveloper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  labels: [{ type: String, trim: true }],
  dueDate: Date,
  attachments: [attachmentSchema],
  activity: [{
    message: String,
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// Compound index for filtering
bugSchema.index({ organization: 1, project: 1, status: 1 });

// ✅ FIXED: no 'next' parameter – async middleware uses return/promise
bugSchema.pre('save', async function () {
  if (this.bugId) return; // already set
  const count = await mongoose.model('Bug').countDocuments();
  this.bugId = `BUG-${String(count + 1001).padStart(4, '0')}`;
});

export default mongoose.model('Bug', bugSchema);