import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: { type: String, required: true, trim: true },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })
teamSchema.index({ organization: 1, name: 1 }, { unique: true })
export default mongoose.model('Team', teamSchema)
