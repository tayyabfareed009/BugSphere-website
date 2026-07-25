const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
const authUrl = (action) => `https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${apiKey}`

async function request(action, body) {
  if (!apiKey) throw new Error('VITE_FIREBASE_API_KEY is not configured')
  const response = await fetch(authUrl(action), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, returnSecureToken: true }) })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message?.replaceAll('_', ' ') || 'Firebase authentication failed')
  return data
}

export const signInWithEmail = (email, password) => request('signInWithPassword', { email, password })
export const signUpWithEmail = (email, password) => request('signUp', { email, password })
