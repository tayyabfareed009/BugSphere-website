import Notification from '../models/Notification.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50)
  res.json(notifications)
})

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true })
  if (!notification) return res.status(404).json({ message: 'Notification not found' })
  res.json(notification)
})

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true })
  res.status(204).end()
})
