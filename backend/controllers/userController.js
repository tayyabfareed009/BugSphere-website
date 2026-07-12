import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getUsers = asyncHandler(async (req, res) => {
  res.json(await User.find().select('-password').sort('name'))
})

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password')
  Object.assign(user, { name: req.body.name || user.name, email: req.body.email || user.email, avatar: req.body.avatar || user.avatar })
  if (req.body.password) user.password = req.body.password
  await user.save()
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar })
})

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password')
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({ message: 'User deleted' })
})
