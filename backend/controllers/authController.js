import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { generateToken } from '../utils/generateToken.js'

const sendAuth = (res, user, status = 200) => {
  console.log('\n==============================')
  console.log('🔐 sendAuth() called')
  console.log('👤 User ID:', user._id)
  console.log('👤 Name:', user.name)
  console.log('📧 Email:', user.email)
  console.log('🎭 Role:', user.role)
  console.log('📌 Status Code:', status)

  const token = generateToken(user)

  console.log('🎫 JWT Token Generated')
  console.log('🍪 Setting HTTP Only Cookie')

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  })

  console.log('📤 Sending authentication response')

  res.status(status).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  })

  console.log('==============================\n')
}

export const register = asyncHandler(async (req, res) => {

  console.log('\n===================================')
  console.log('🚀 REGISTER REQUEST RECEIVED')
  console.log('===================================')

  console.log('📍 Method:', req.method)
  console.log('📍 URL:', req.originalUrl)
  console.log('📦 Request Body:', req.body)

  const { name, email, password, role } = req.body

  console.log('👤 Name:', name)
  console.log('📧 Email:', email)
  console.log('🎭 Role:', role)
  console.log('🔑 Password Length:', password?.length)

  if (!name || !email || !password) {
    console.log('❌ Missing required fields')
    return res.status(400).json({
      message: 'Name, email, and password are required'
    })
  }

  console.log('🔍 Checking if email already exists...')

  const exists = await User.findOne({ email })

  if (exists) {
    console.log('❌ Email already registered')
    return res.status(409).json({
      message: 'Email already registered'
    })
  }

  console.log('✅ Email available')
  console.log('👤 Creating new user...')

  const user = await User.create({
    name,
    email,
    password,
    role
  })

  console.log('✅ User created successfully')
  console.log('🆔 User ID:', user._id)

  sendAuth(res, user, 201)
})

export const login = asyncHandler(async (req, res) => {

  console.log('\n===================================')
  console.log('🚀 LOGIN REQUEST RECEIVED')
  console.log('===================================')

  console.log('📍 Method:', req.method)
  console.log('📍 URL:', req.originalUrl)
  console.log('📦 Request Body:', req.body)

  const { email, password } = req.body

  console.log('📧 Email:', email)
  console.log('🔑 Password Length:', password?.length)

  console.log('🔍 Searching user in database...')

  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    console.log('❌ User not found')
    return res.status(401).json({
      message: 'Invalid email or password'
    })
  }

  console.log('✅ User found')
  console.log('👤 User ID:', user._id)
  console.log('👤 Name:', user.name)

  console.log('🔒 Comparing password...')

  const isMatch = await user.matchPassword(password)

  console.log('🔐 Password Match:', isMatch)

  if (!isMatch) {
    console.log('❌ Invalid password')
    return res.status(401).json({
      message: 'Invalid email or password'
    })
  }

  console.log('✅ Login successful')

  sendAuth(res, user)
})

export const logout = ((req, res) => {

  console.log('\n===================================')
  console.log('🚪 LOGOUT REQUEST')
  console.log('===================================')

  console.log('🍪 Clearing authentication cookie')

  res.clearCookie('token')

  console.log('✅ User logged out')

  res.json({
    message: 'Logged out'
  })
})

export const me = asyncHandler(async (req, res) => {

  console.log('\n===================================')
  console.log('👤 CURRENT USER REQUEST')
  console.log('===================================')

  console.log('📦 Authenticated User:')
  console.log(req.user)

  res.json(req.user)
})