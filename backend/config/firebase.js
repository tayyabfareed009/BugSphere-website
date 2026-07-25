import crypto from 'crypto'

let certificates = new Map()
let certificateExpiry = 0

const loadCertificates = async () => {
  if (Date.now() < certificateExpiry && certificates.size) return certificates
  const response = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com')
  if (!response.ok) throw new Error('Unable to load Firebase signing certificates')
  certificates = new Map(Object.entries(await response.json()))
  const cacheControl = response.headers.get('cache-control') || ''
  const seconds = Number(cacheControl.match(/max-age=(\d+)/)?.[1] || 3600)
  certificateExpiry = Date.now() + seconds * 1000
  return certificates
}

const decodePart = (value) => JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))

export async function verifyFirebaseIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') throw new Error('Firebase ID token is required')
  const [encodedHeader, encodedPayload, signature] = idToken.split('.')
  if (!encodedHeader || !encodedPayload || !signature) throw new Error('Malformed Firebase ID token')
  const header = decodePart(encodedHeader)
  const payload = decodePart(encodedPayload)
  const projectId = process.env.FIREBASE_PROJECT_ID
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID is not configured')
  if (header.alg !== 'RS256' || !header.kid || payload.aud !== projectId || payload.iss !== `https://securetoken.google.com/${projectId}` || !payload.sub || payload.sub.length > 128 || payload.exp * 1000 <= Date.now()) throw new Error('Invalid Firebase ID token claims')
  const cert = (await loadCertificates()).get(header.kid)
  if (!cert) throw new Error('Unknown Firebase signing key')
  const verifier = crypto.createVerify('RSA-SHA256')
  verifier.update(`${encodedHeader}.${encodedPayload}`)
  verifier.end()
  if (!verifier.verify(cert, Buffer.from(signature, 'base64url'))) throw new Error('Invalid Firebase ID token signature')
  return payload
}
