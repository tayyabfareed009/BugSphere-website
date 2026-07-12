import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { AuthContext } from './authContextValue.js'
import { rolePermissions } from '../utils/constants.js'

const demoUser = {
  id: 'demo-admin',
  name: 'Ava Richardson',
  email: 'ava@bugsphere.dev',
  role: 'Admin',
  avatar: 'AR'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('bugsphere_user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const loading = false

  const login = async ({ email }) => {
    const nextUser = { ...demoUser, email: email || demoUser.email }
    localStorage.setItem('bugsphere_token', 'demo.jwt.token')
    localStorage.setItem('bugsphere_user', JSON.stringify(nextUser))
    setUser(nextUser)
    toast.success('Welcome back to BugSphere')
    return nextUser
  }

  const register = async (payload) => {
    const nextUser = { ...demoUser, ...payload, avatar: payload.name?.slice(0, 2).toUpperCase() || 'BS' }
    localStorage.setItem('bugsphere_token', 'demo.jwt.token')
    localStorage.setItem('bugsphere_user', JSON.stringify(nextUser))
    setUser(nextUser)
    toast.success('Workspace created')
    return nextUser
  }

  const logout = () => {
    localStorage.removeItem('bugsphere_token')
    localStorage.removeItem('bugsphere_user')
    setUser(null)
    toast.success('Signed out')
  }

  const value = useMemo(() => {
    const can = (permission) => Boolean(user && rolePermissions[user.role]?.includes(permission))
    return { user, loading, login, register, logout, can }
  }, [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
