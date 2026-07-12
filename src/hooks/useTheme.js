import { useContext } from 'react'
import { ThemeContext } from '../context/themeContextValue.js'

export function useTheme() {
  return useContext(ThemeContext)
}
