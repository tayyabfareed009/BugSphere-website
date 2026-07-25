import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getUsers = asyncHandler(async (req, res) => {
  res.json(await User.find({ organization: req.user.organization }).sort('name'))
})

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.user._id, organization: req.user.organization })
  Object.assign(user, { name: req.body.name || user.name, avatar: req.body.avatar || user.avatar, notificationsEnabled: req.body.notificationsEnabled ?? user.notificationsEnabled })
  await user.save()
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar })
})

export const updateUser = asyncHandler(async (req, res) => {
  const allowed = ['role', 'name', 'avatar', 'notificationsEnabled']
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
  const user = await User.findOneAndUpdate({ _id: req.params.id, organization: req.user.organization }, update, { new: true, runValidators: true })
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOneAndDelete({ _id: req.params.id, organization: req.user.organization })
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({ message: 'User deleted' })
})
