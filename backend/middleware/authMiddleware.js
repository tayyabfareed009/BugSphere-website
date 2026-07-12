import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : req.cookies?.token
  if (!token) return res.status(401).json({ message: 'Not authorized' })

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bugsphere-dev-secret')
  req.user = await User.findById(decoded.id).select('-password')
  if (!req.user) return res.status(401).json({ message: 'User not found' })
  next()
})

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden for this role' })
  next()
}
