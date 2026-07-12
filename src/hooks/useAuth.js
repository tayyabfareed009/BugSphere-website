import { useContext } from 'react'
import { AuthContext } from '../context/authContextValue.js'

export function useAuth() {
  return useContext(AuthContext)
}
