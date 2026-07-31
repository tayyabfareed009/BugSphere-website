import express from 'express'
import Organization from '../models/Organization.js'
import Invitation from '../models/Invitation.js'
import Team from '../models/Team.js'
import AuditLog from '../models/AuditLog.js'
import { protect, authorize } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { findActiveInvitation, hashInvitationToken, newInvitationToken, sendInvitationEmail } from '../services/invitationService.js'

const router = express.Router()

router.get('/invitations/validate', asyncHandler(async (req, res) => {
  const invitation = await findActiveInvitation(String(req.query.token || ''))
  if (!invitation) return res.status(410).json({ message: 'This invitation is invalid, expired, canceled, or already used.' })
  const organization = await Organization.findById(invitation.organization).select('name logo')
  res.json({ valid: true, email: invitation.email, role: invitation.role, organization: { id: organization._id, name: organization.name, logo: organization.logo }, expiresAt: invitation.expiresAt })
}))

router.use(protect)

router.get('/me', asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.user.organization)
  res.json(organization)
}))

router.put('/me', authorize('Owner'), asyncHandler(async (req, res) => {
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => ['name', 'settings', 'branding', 'logo'].includes(key)))
  const organization = await Organization.findByIdAndUpdate(req.user.organization, update, { new: true, runValidators: true })
  await AuditLog.create({ organization: req.user.organization, actor: req.user._id, action: 'organization.updated', entity: 'Organization', entityId: organization._id })
  res.json(organization)
}))

router.post('/invitations', authorize('Owner'), asyncHandler(async (req, res) => {
  const { email, role, team: teamId } = req.body;
  if (!email || !role) return res.status(400).json({ message: 'Email and role are required' });

  // Check if an active invitation already exists
  let invitation = await Invitation.findOne({
    organization: req.user.organization,
    email: email.toLowerCase(),
    acceptedAt: null,
    canceledAt: null,
    expiresAt: { $gt: new Date() }
  });

  if (invitation) {
    // Refresh token, reset expiration, update role/team if provided
    const rawToken = newInvitationToken();
    invitation.tokenHash = hashInvitationToken(rawToken);
    invitation.expiresAt = new Date(Date.now() + 7 * 86400000);
    invitation.lastSentAt = new Date();
    if (role) invitation.role = role;
    if (teamId) invitation.team = teamId;
    await invitation.save();

    // Resend email
    const organization = await Organization.findById(req.user.organization);
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const invitationUrl = `${clientUrl}/register?invitation=${encodeURIComponent(rawToken)}`;
    await sendInvitationEmail({
      email: invitation.email,
      name: organization.name,
      role: invitation.role,
      invitationUrl,
      expiresAt: invitation.expiresAt
    });

    await AuditLog.create({
      organization: req.user.organization,
      actor: req.user._id,
      action: 'invitation.resent',
      entity: 'Invitation',
      entityId: invitation._id
    });

    return res.json({
      id: invitation._id,
      email: invitation.email,
      role: invitation.role,
      team: invitation.team,
      status: 'Pending',
      expiresAt: invitation.expiresAt,
      message: 'Invitation refreshed and resent'
    });
  }

  // No existing invitation – create a new one (your original logic)
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return res.status(503).json({ message: 'Invitation email delivery is not configured.' });
  }

  // Check if user already exists? (optional)
  if (teamId && !await Team.exists({ _id: teamId, organization: req.user.organization })) {
    return res.status(422).json({ message: 'Team not found' });
  }

  const organization = await Organization.findById(req.user.organization);
  const rawToken = newInvitationToken();
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  invitation = await Invitation.create({
    organization: req.user.organization,
    email: email.toLowerCase(),
    role,
    team: teamId || undefined,
    invitedBy: req.user._id,
    tokenHash: hashInvitationToken(rawToken),
    expiresAt,
    lastSentAt: new Date()
  });

  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const invitationUrl = `${clientUrl}/register?invitation=${encodeURIComponent(rawToken)}`;
  await sendInvitationEmail({
    email: invitation.email,
    name: organization.name,
    role,
    invitationUrl,
    expiresAt
  });

  await AuditLog.create({
    organization: req.user.organization,
    actor: req.user._id,
    action: 'invitation.created',
    entity: 'Invitation',
    entityId: invitation._id
  });

  res.status(201).json({
    id: invitation._id,
    email: invitation.email,
    role: invitation.role,
    team: invitation.team,
    status: 'Pending',
    expiresAt: invitation.expiresAt
  });
}));

router.get('/invitations', authorize('Owner'), asyncHandler(async (req, res) => {
  const status = req.query.status || 'Pending'; const query = { organization: req.user.organization }
  if (status === 'Pending') Object.assign(query, { acceptedAt: null, canceledAt: null, expiresAt: { $gt: new Date() } })
  if (status === 'Expired') Object.assign(query, { acceptedAt: null, canceledAt: null, expiresAt: { $lte: new Date() } })
  if (status === 'Canceled') query.canceledAt = { $ne: null }
  if (status === 'Accepted') query.acceptedAt = { $ne: null }
  res.json(await Invitation.find(query).populate('team invitedBy', 'name email').sort('-createdAt'))
}))

router.post('/invitations/:id/resend', authorize('Owner'), asyncHandler(async (req, res) => {
  const invitation = await Invitation.findOne({ _id: req.params.id, organization: req.user.organization, acceptedAt: null, canceledAt: null })
  if (!invitation) return res.status(404).json({ message: 'Active invitation not found' })
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return res.status(503).json({ message: 'Invitation email delivery is not configured.' })
  const rawToken = newInvitationToken(); invitation.tokenHash = hashInvitationToken(rawToken); invitation.token = undefined; invitation.expiresAt = new Date(Date.now() + 7 * 86400000); invitation.lastSentAt = new Date(); await invitation.save()
  const organization = await Organization.findById(req.user.organization); const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')
  await sendInvitationEmail({ email: invitation.email, name: organization.name, role: invitation.role, invitationUrl: `${clientUrl}/register?invitation=${encodeURIComponent(rawToken)}`, expiresAt: invitation.expiresAt })
  await AuditLog.create({ organization: req.user.organization, actor: req.user._id, action: 'invitation.resent', entity: 'Invitation', entityId: invitation._id })
  res.json({ message: 'Invitation resent', expiresAt: invitation.expiresAt })
}))

router.delete('/invitations/:id', authorize('Owner'), asyncHandler(async (req, res) => {
  const invitation = await Invitation.findOneAndUpdate({ _id: req.params.id, organization: req.user.organization, acceptedAt: null, canceledAt: null }, { canceledAt: new Date() }, { new: true })
  if (!invitation) return res.status(404).json({ message: 'Active invitation not found' })
  await AuditLog.create({ organization: req.user.organization, actor: req.user._id, action: 'invitation.canceled', entity: 'Invitation', entityId: invitation._id })
  res.json({ message: 'Invitation canceled' })
}))

router.get('/audit-logs', authorize('Owner'), asyncHandler(async (req, res) => {
  res.json(await AuditLog.find({ organization: req.user.organization }).populate('actor', 'name email').sort('-createdAt').limit(100))
}))
export default router
