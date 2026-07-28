import Team from '../models/Team.js'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const populate = (query) => query.populate('lead members', 'name email role avatar')
export const getTeams = asyncHandler(async (req, res) => res.json(await populate(Team.find({ organization: req.user.organization }).sort('name'))))
export const createTeam = asyncHandler(async (req, res) => {
  const { name, lead, members = [] } = req.body
  if (!name) return res.status(400).json({ message: 'Team name is required' })
  const ids = [...new Set([lead, ...members].filter(Boolean))]
  if (ids.length && await User.countDocuments({ _id: { $in: ids }, organization: req.user.organization }) !== ids.length) return res.status(422).json({ message: 'Team users must belong to this organization' })
  const team = await Team.create({ organization: req.user.organization, name, lead, members: ids })
  res.status(201).json(await populate(Team.findById(team._id)))
})
export const updateTeam = asyncHandler(async (req, res) => {
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => ['name', 'lead', 'members'].includes(key)))
  if (update.members || update.lead) {
    const ids = [...new Set([update.lead, ...(update.members || [])].filter(Boolean))]
    if (ids.length && await User.countDocuments({ _id: { $in: ids }, organization: req.user.organization }) !== ids.length) return res.status(422).json({ message: 'Team users must belong to this organization' })
  }
  const team = await Team.findOneAndUpdate({ _id: req.params.id, organization: req.user.organization }, update, { new: true, runValidators: true })
  if (!team) return res.status(404).json({ message: 'Team not found' })
  res.json(await populate(Team.findById(team._id)))
})
export const deleteTeam = asyncHandler(async (req, res) => { const team = await Team.findOneAndDelete({ _id: req.params.id, organization: req.user.organization }); if (!team) return res.status(404).json({ message: 'Team not found' }); res.json({ message: 'Team deleted' }) })
