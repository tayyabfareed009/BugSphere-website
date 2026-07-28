import crypto from 'crypto'
import Invitation from '../models/Invitation.js'

export const hashInvitationToken = (token) => crypto.createHash('sha256').update(token).digest('hex')
export const newInvitationToken = () => crypto.randomBytes(32).toString('base64url')
export const findActiveInvitation = (token) => Invitation.findOne({
  $or: [{ tokenHash: hashInvitationToken(token) }, { token }], acceptedAt: null, canceledAt: null, expiresAt: { $gt: new Date() }
}).select('+token +tokenHash')

export async function sendInvitationEmail({ email, name, role, invitationUrl, expiresAt }) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error('Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM in .env.')
  const expiry = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(expiresAt)
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [email], subject: `You are invited to join ${name} on WorkSphere`, html: `<main style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h1>Join ${name}</h1><p>You have been invited as <strong>${role}</strong>.</p><p><a href="${invitationUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Accept invitation</a></p><p>This single-use link expires ${expiry}.</p><p>If you did not expect this, you can ignore this email.</p></main>` }) })
  if (!response.ok) throw new Error(`Invitation email could not be delivered: ${await response.text()}`)
  return response.json()
}
