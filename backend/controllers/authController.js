import crypto from 'crypto'
import Organization from '../models/Organization.js'
import User from '../models/User.js'
import Invitation from '../models/Invitation.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { generateToken } from '../utils/generateToken.js'
import { verifyFirebaseIdToken } from '../config/firebase.js'

const serializeUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, organization: user.organization })
const sendAuth = (res, user, status = 200) => {
  const token = generateToken(user)
  res.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.status(status).json({ token, user: serializeUser(user) })
}

export const firebaseSession = asyncHandler(async (req, res) => {
  const { idToken, invitationToken, organizationName } = req.body
  const claims = await verifyFirebaseIdToken(idToken)
  const firebaseUid = claims.user_id || claims.sub
  const email = claims.email
  const name = claims.name || email?.split('@')[0]
  if (!email || !name) return res.status(400).json({ message: 'Firebase account must have a verified email.' })
  let invitation = invitationToken && await Invitation.findOne({ token: invitationToken, email: email.toLowerCase(), acceptedAt: null, expiresAt: { $gt: new Date() } }).select('+token')
  let organization
  let role = 'Owner'
  if (invitation) {
    organization = invitation.organization
    role = invitation.role
    invitation.acceptedAt = new Date()
    await invitation.save()
  } else {
    if (!organizationName) return res.status(400).json({ message: 'Organization name is required for a new workspace.' })
    const base = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workspace'
    organization = await Organization.create({ name: organizationName, slug: `${base}-${crypto.randomBytes(3).toString('hex')}` })
  }
  let user = await User.findOne({ firebaseUid })
  if (!user) user = await User.create({ firebaseUid, email, name, organization, role })
  sendAuth(res, user, 201)
})

// This only validates an application session. Firebase sign-in/token verification occurs
// at the boundary in the deployed Firebase Admin integration.
export const me = asyncHandler(async (req, res) => res.json(serializeUser(req.user)))
export const logout = (req, res) => { res.clearCookie('token'); res.json({ message: 'Logged out' }) }
