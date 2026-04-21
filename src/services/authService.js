import { API_BASE_URL } from './apiBase.js'

const USERS_KEY = 'eventcinity_users'
const SESSION_KEY = 'eventcinity_session'
const PASSWORD_ITERATIONS = 120000
const SIGNUP_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.com$/i
const textEncoder = new TextEncoder()

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()
const getDefaultName = (email) => normalizeEmail(email).split('@')[0] || 'Eventcinity user'

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch {
    return {}
  }
}

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const buildSession = ({ email, name, interests = [], authProvider = 'local' }) => ({
  email: normalizeEmail(email),
  name: String(name || '').trim() || getDefaultName(email),
  interests: Array.isArray(interests) ? interests : [],
  authProvider,
})

const readResponseData = async (response) => {
  const rawText = await response.text()

  if (!rawText) {
    return {}
  }

  try {
    return JSON.parse(rawText)
  } catch {
    return { message: rawText }
  }
}

const isRecoverableRemoteAuthError = (error) =>
  error?.name === 'TypeError' ||
  error?.status === 404 ||
  error?.status === 405 ||
  error?.status === 502 ||
  error?.status === 503 ||
  error?.status === 504

const requestRemoteAuth = async (path, payload) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const data = await readResponseData(response)

  if (!response.ok || data?.success === false) {
    const error = new Error(data.message || 'Authentication failed.')
    error.status = response.status
    throw error
  }

  return data
}

const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes))
const fromBase64 = (value) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0))

const getCryptoModule = () => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure password hashing is not available in this browser.')
  }

  return globalThis.crypto
}

const derivePasswordHash = async (password, saltBytes, iterations = PASSWORD_ITERATIONS) => {
  const cryptoModule = getCryptoModule()
  const keyMaterial = await cryptoModule.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const derivedBits = await cryptoModule.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )

  return toBase64(new Uint8Array(derivedBits))
}

const createPasswordRecord = async (password) => {
  const cryptoModule = getCryptoModule()
  const saltBytes = cryptoModule.getRandomValues(new Uint8Array(16))

  return {
    passwordHash: await derivePasswordHash(password, saltBytes),
    passwordSalt: toBase64(saltBytes),
    passwordIterations: PASSWORD_ITERATIONS,
    passwordDigest: 'SHA-256',
  }
}

const verifyStoredPassword = async (user, password) => {
  if (typeof user?.passwordHash === 'string' && typeof user?.passwordSalt === 'string') {
    const derivedHash = await derivePasswordHash(
      password,
      fromBase64(user.passwordSalt),
      user.passwordIterations || PASSWORD_ITERATIONS,
    )

    return derivedHash === user.passwordHash
  }

  return typeof user?.password === 'string' && user.password === password
}

const upsertLocalUser = async ({
  email,
  password,
  name,
  interests = [],
  authProvider = 'local',
}) => {
  const normalizedEmail = normalizeEmail(email)
  const users = getUsers()
  const existingUser = users[normalizedEmail] || {}
  const passwordRecord = await createPasswordRecord(password)

  const nextUser = {
    ...existingUser,
    email: normalizedEmail,
    name: String(name || existingUser.name || getDefaultName(normalizedEmail)).trim(),
    interests: Array.isArray(interests) ? interests : existingUser.interests || [],
    createdAt: existingUser.createdAt || new Date().toISOString(),
    authProvider,
    ...passwordRecord,
  }

  delete nextUser.password

  users[normalizedEmail] = nextUser
  saveUsers(users)

  return nextUser
}

const migrateLegacyPasswordIfNeeded = async (email, user, password) => {
  if (!user || typeof user.password !== 'string' || user.passwordHash) {
    return user
  }

  return upsertLocalUser({
    email,
    password,
    name: user.name,
    interests: user.interests,
    authProvider: user.authProvider || 'local',
  })
}

const createSessionFromAuthPayload = (data, email, fallbackName, authProvider) => {
  const user = data?.user || data?.data?.user || data?.data || {}

  return buildSession({
    email: user.email || email,
    name: user.name || fallbackName || getDefaultName(email),
    interests: user.interests || [],
    authProvider,
  })
}

export const getSignupEmailError = (email) => {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    return 'Email is required.'
  }

  if (!SIGNUP_EMAIL_PATTERN.test(normalizedEmail)) {
    return 'Use a valid email address that includes @ and ends in .com.'
  }

  return ''
}

export const setSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(buildSession(session)))
}

export const signUp = async ({ email, password, name }) => {
  const normalizedEmail = normalizeEmail(email)
  const emailError = getSignupEmailError(normalizedEmail)

  if (emailError) {
    throw new Error(emailError)
  }

  if (!String(password || '').trim()) {
    throw new Error('Password is required.')
  }

  const fallbackName = String(name || '').trim() || getDefaultName(normalizedEmail)

  try {
    const data = await requestRemoteAuth('/api/auth/register', {
      email: normalizedEmail,
      password,
      name: fallbackName,
    })

    const session = createSessionFromAuthPayload(data, normalizedEmail, fallbackName, 'remote')
    setSession(session)
    await upsertLocalUser({
      email: normalizedEmail,
      password,
      name: session.name,
      interests: session.interests,
      authProvider: 'remote',
    })
    return session
  } catch (error) {
    if (!isRecoverableRemoteAuthError(error)) {
      throw error
    }

    const users = getUsers()

    if (users[normalizedEmail]) {
      throw new Error('An account with this email already exists.')
    }

    const user = await upsertLocalUser({
      email: normalizedEmail,
      password,
      name: fallbackName,
      interests: [],
      authProvider: 'local',
    })
    const session = buildSession(user)
    setSession(session)
    return session
  }
}

export const signIn = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    throw new Error('Email is required.')
  }

  if (!String(password || '').trim()) {
    throw new Error('Password is required.')
  }

  try {
    const data = await requestRemoteAuth('/api/auth/login', {
      email: normalizedEmail,
      password,
    })

    const session = createSessionFromAuthPayload(
      data,
      normalizedEmail,
      getDefaultName(normalizedEmail),
      'remote',
    )
    setSession(session)
    await upsertLocalUser({
      email: normalizedEmail,
      password,
      name: session.name,
      interests: session.interests,
      authProvider: 'remote',
    })
    return session
  } catch (error) {
    if (!isRecoverableRemoteAuthError(error)) {
      throw error
    }

    const users = getUsers()
    const user = users[normalizedEmail]

    if (!user) {
      throw new Error('No account found with this email.')
    }

    const passwordMatches = await verifyStoredPassword(user, password)

    if (!passwordMatches) {
      throw new Error('Incorrect password.')
    }

    const nextUser = await migrateLegacyPasswordIfNeeded(normalizedEmail, user, password)
    const session = buildSession(nextUser || user)
    setSession(session)
    return session
  }
}

export const signOut = () => {
  localStorage.removeItem(SESSION_KEY)

  void fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {})
}

export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

export const saveInterests = (email, interests) => {
  const normalizedEmail = normalizeEmail(email)
  const users = getUsers()

  if (users[normalizedEmail]) {
    users[normalizedEmail].interests = interests
    saveUsers(users)
  }

  const session = getSession()

  if (session) {
    session.interests = interests
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
}
