import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { generateToken } from '../utils/generateToken.js'

const sendAuth = (res, user, status = 200) => {
  const token = generateToken(user)
  res.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' })
  res.status(status).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } })
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' })
  const exists = await User.findOne({ email })
  if (exists) return res.status(409).json({ message: 'Email already registered' })
  const user = await User.create({ name, email, password, role })
  sendAuth(res, user, 201)
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid email or password' })
  sendAuth(res, user)
})

export const logout = (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out' })
}

export const me = asyncHandler(async (req, res) => {
  res.json(req.user)
})
