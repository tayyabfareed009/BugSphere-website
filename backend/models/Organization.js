import mongoose from 'mongoose'

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
  logo: { type: String, default: '' },
  settings: { timezone: { type: String, default: 'UTC' }, allowInvites: { type: Boolean, default: true }, notificationDefaults: { type: Boolean, default: true }, appearance: { type: String, enum: ['system', 'light', 'dark'], default: 'system' }, security: { requireStrongPasswords: { type: Boolean, default: true } } },
  branding: { primaryColor: { type: String, default: '#4f46e5' }, companyProfile: { type: String, default: '' } }
}, { timestamps: true })

export default mongoose.model('Organization', organizationSchema)
