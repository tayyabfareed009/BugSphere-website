import mongoose from 'mongoose'

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
  logo: { type: String, default: '' },
  settings: { timezone: { type: String, default: 'UTC' }, allowInvites: { type: Boolean, default: true } }
}, { timestamps: true })

export default mongoose.model('Organization', organizationSchema)
