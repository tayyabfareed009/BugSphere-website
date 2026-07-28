import crypto from 'crypto'
import Organization from '../models/Organization.js'
import User from '../models/User.js'
import Team from '../models/Team.js'

import { asyncHandler } from '../utils/asyncHandler.js'
import { generateToken } from '../utils/generateToken.js'
import { verifyFirebaseIdToken } from '../config/firebase.js'
import { findActiveInvitation } from '../services/invitationService.js'
import cloudinary from '../config/cloudinary.js'

const serializeUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, organization: user.organization })
const sendAuth = (res, user, status = 200) => {
  const token = generateToken(user)
  res.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.status(status).json({ token, user: serializeUser(user) })
}

export const register = asyncHandler(async (req, res) => {
  const { idToken, invitationToken, organizationName, phone } = req.body
  const claims = await verifyFirebaseIdToken(idToken)
  const firebaseUid = claims.user_id || claims.sub
  const email = claims.email
  const name = claims.name || email?.split('@')[0]
  if (!email || !name) return res.status(400).json({ message: 'Firebase account must have a verified email.' })
  let invitation = invitationToken && await findActiveInvitation(invitationToken)
  if (invitation && invitation.email !== email.toLowerCase()) return res.status(403).json({ message: 'This invitation is for a different email address.' })
  let organization
  let role = 'Owner'
  if (invitation) {
    organization = invitation.organization
    role = invitation.role
  } else {
    if (!organizationName) return res.status(400).json({ message: 'Organization name is required for a new workspace.' })
    const base = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workspace'
    organization = await Organization.create({ name: organizationName, slug: `${base}-${crypto.randomBytes(3).toString('hex')}` })
  }
  let user = await User.findOne({ firebaseUid })
  if (user && String(user.organization) !== String(organization)) return res.status(403).json({ message: 'This Firebase account already belongs to another organization.' })
  let avatar = '';
console.log("req.file exists:", !!req.file);
console.log("Request body:", req.body);
if (req.file) {
  console.log("File received:", req.file);

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "worksphere/avatars",
          public_id: `${firebaseUid}-${Date.now()}`
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(error);
          }

          resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    console.log("Cloudinary upload success:", result);

    avatar = result.secure_url;
  } catch (err) {
    console.error("Upload failed:", err);
    throw err;
  }
}
  console.log("File:", req.file);
  if (!user) user = await User.create({ firebaseUid, email, name, phone: phone || '', avatar, organization, role })
  if (invitation) {
    invitation.acceptedAt = new Date(); await invitation.save()
    if (invitation.team) await Team.updateOne({ _id: invitation.team, organization }, { $addToSet: { members: user._id } })
    console.log('[AUTH] Invitation accepted', { invitationId: invitation._id, userId: user._id, organizationId: organization })
  }
  user.lastLoginAt = new Date(); await user.save()
  sendAuth(res, user, 201)
})

// This only validates an application session. Firebase sign-in/token verification occurs
// at the boundary in the deployed Firebase Admin integration.
export const me = asyncHandler(async (req, res) => res.json(serializeUser(req.user)))
export const logout = (req, res) => { res.clearCookie('token'); res.json({ message: 'Logged out' }) }

export const login = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    const claims = await verifyFirebaseIdToken(idToken);

    const firebaseUid = claims.user_id || claims.sub;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
        return res.status(404).json({
            message: "User not found."
        });
    }

    user.lastLoginAt = new Date();
    await user.save();

    sendAuth(res, user);
})

// // Existing functions
// export const me = asyncHandler(async (req, res) =>
//     res.json(serializeUser(req.user))
// );

// export const logout = (req, res) => {
//     res.clearCookie("token");
//     res.json({ message: "Logged out" });
// };