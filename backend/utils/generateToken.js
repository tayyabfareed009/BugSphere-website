import jwt from 'jsonwebtoken'

export function generateToken(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured')
  return jwt.sign({ id: user._id, role: user.role, organization: user.organization }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}
