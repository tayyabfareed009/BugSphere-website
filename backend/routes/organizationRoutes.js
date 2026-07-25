import crypto from 'crypto'
import express from 'express'
import Organization from '../models/Organization.js'
import Invitation from '../models/Invitation.js'
import AuditLog from '../models/AuditLog.js'
import { protect, authorize } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = express.Router()
router.use(protect)

router.get('/me', asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.user.organization)
  res.json(organization)
}))

router.put('/me', authorize('Owner'), asyncHandler(async (req, res) => {
  const organization = await Organization.findByIdAndUpdate(req.user.organization, { name: req.body.name, settings: req.body.settings }, { new: true, runValidators: true })
  await AuditLog.create({ organization: req.user.organization, actor: req.user._id, action: 'organization.updated', entity: 'Organization', entityId: organization._id })
  res.json(organization)
}))

router.post('/invitations', authorize('Owner'), asyncHandler(async (req, res) => {
  const { email, role } = req.body
  if (!email || !role) return res.status(400).json({ message: 'Email and role are required' })
  const invitation = await Invitation.create({ organization: req.user.organization, email, role, invitedBy: req.user._id, token: crypto.randomBytes(32).toString('hex'), expiresAt: new Date(Date.now() + 7 * 86400000) })
  await AuditLog.create({ organization: req.user.organization, actor: req.user._id, action: 'invitation.created', entity: 'Invitation', entityId: invitation._id })
  res.status(201).json({ id: invitation._id, email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt })
}))

router.get('/audit-logs', authorize('Owner'), asyncHandler(async (req, res) => {
  res.json(await AuditLog.find({ organization: req.user.organization }).populate('actor', 'name email').sort('-createdAt').limit(100))
}))
export default router
