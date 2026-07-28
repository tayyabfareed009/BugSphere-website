/**
 * Firebase Authentication using REST API
 * No SDK required – works with Firebase's Identity Toolkit
 */

const apiKey = "AIzaSyCWw-RioKVOpG4d8kFsOzJ6RieZNTxIiiw";

/**
 * Base URL for Firebase Authentication REST endpoints
 */
const authUrl = (action) =>
  `https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${apiKey}`;

/**
 * Generic request handler for Firebase REST API
 * @param {string} action - Firebase endpoint action (e.g., 'signUp', 'signInWithPassword', 'sendOobCode')
 * @param {object} body - Request payload
 * @param {boolean} returnSecureToken - Whether to request a secure token (default: true)
 * @returns {Promise<object>} Firebase response data
 */
async function request(action, body, returnSecureToken = true) {
  if (!apiKey) {
    throw new Error(
      'VITE_FIREBASE_API_KEY is not configured in environment variables'
    );
  }

  const response = await fetch(authUrl(action), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...body,
      returnSecureToken,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Format Firebase error messages (replace underscores with spaces)
    const message = data.error?.message?.replaceAll('_', ' ') || 'Firebase authentication failed';
    throw new Error(message);
  }

  return data;
}

// ──────────────────────────────────────────────
// Public authentication methods
// ──────────────────────────────────────────────

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{idToken: string, localId: string, email: string, refreshToken: string, expiresIn: string}>}
 */
export const signInWithEmail = (email, password) =>
  request('signInWithPassword', { email, password });

/**
 * Create a new user account with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{idToken: string, localId: string, email: string, refreshToken: string, expiresIn: string}>}
 */
export const signUpWithEmail = (email, password) =>
  request('signUp', { email, password });

/**
 * Send a password reset email to the user
 * @param {string} email - The email address to send the reset link to
 * @returns {Promise<{email: string}>}
 */
export const resetPasswordWithEmail = (email) =>
  // sendOobCode does NOT need returnSecureToken, but it's harmless if sent
  request('sendOobCode', { requestType: 'PASSWORD_RESET', email }, false);

/**
 * Send email verification link to the user (requires ID token)
 * @param {string} idToken - Firebase ID token of the authenticated user
 * @returns {Promise<{email: string}>}
 */
export const sendEmailVerification = (idToken) =>
  request('sendOobCode', { requestType: 'VERIFY_EMAIL', idToken }, false);

/**
 * Refresh an expired ID token using the refresh token
 * @param {string} refreshToken
 * @returns {Promise<{id_token: string, refresh_token: string, expires_in: string, user_id: string}>}
 */
export const refreshToken = (refreshToken) =>
  request('token', { grant_type: 'refresh_token', refresh_token: refreshToken }, true);

/**
 * Change password for authenticated user (requires ID token)
 * @param {string} idToken
 * @param {string} password - New password
 * @returns {Promise<{localId: string, email: string, passwordHash: string, idToken: string, refreshToken: string, expiresIn: string}>}
 */
export const changePassword = (idToken, password) =>
  request('update', { idToken, password }, true);

/**
 * Get user account info (requires ID token)
 * @param {string} idToken
 * @returns {Promise<{users: Array<{localId: string, email: string, displayName: string, photoUrl: string, providerUserInfo: Array}>}>}
 */
export const getUserInfo = (idToken) =>
  request('lookup', { idToken }, false);

/**
 * Delete user account (requires ID token)
 * @param {string} idToken
 * @returns {Promise<{kind: string}>}
 */
export const deleteAccount = (idToken) =>
  request('delete', { idToken }, false);

/**
 * Link email/password to an existing account (requires ID token)
 * @param {string} idToken
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{localId: string, email: string, passwordHash: string, idToken: string, refreshToken: string, expiresIn: string}>}
 */
export const linkEmailPassword = (idToken, email, password) =>
  request('update', { idToken, email, password, returnSecureToken: true }, true);

export default {
  signInWithEmail,
  signUpWithEmail,
  resetPasswordWithEmail,
  sendEmailVerification,
  refreshToken,
  changePassword,
  getUserInfo,
  deleteAccount,
  linkEmailPassword,
};