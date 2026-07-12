import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Loader from '../components/Loader/Loader.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader fullScreen />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}
