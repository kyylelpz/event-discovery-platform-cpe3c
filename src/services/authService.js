import { API_BASE_URL } from './apiBase.js'

const USERS_KEY = 'eventcinity_users'
const SESSION_KEY = 'eventcinity_session'
const PASSWORD_ITERATIONS = 120000
const SIGNUP_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.com$/i
const textEncoder = new TextEncoder()

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()
const getDefaultName = (email) => normalizeEmail(email).split('@')[0] || 'Eventcinity user'
const getDefaultUsername = (email) =>
  getDefaultName(email)
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'eventcinity-user'
const normalizeInterests = (values) =>
  Array.isArray(values)
    ? values
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    : []
const isBrowser = typeof window !== 'undefined'

export const isHostedAuthEnvironment = () => {
  if (!isBrowser) {
    return false
  }

  const { hostname } = window.location

  return (
    hostname === 'eventcinity.com' ||
    hostname === 'www.eventcinity.com' ||
    hostname === 'api.eventcinity.com' ||
    hostname.endsWith('.eventcinity.com')
  )
}

const canUseLocalAuthFallback = () => !isHostedAuthEnvironment()

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch {
    return {}
  }
}

const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch (error) {
    console.warn('Unable to cache users locally:', error)
  }
}

const buildSession = ({
  email,
  name,
  username = '',
  interests = [],
  authProvider = 'local',
  location = '',
  phone = '',
  bio = '',
  profilePic = '',
  createdAt = '',
  needsInterestsSelection = false,
  hasCompletedOnboarding,
  shouldShowInterestsPrompt = false,
}) => ({
  email: normalizeEmail(email),
  name: String(name || '').trim() || getDefaultName(email),
  username: String(username || getDefaultUsername(email)).trim(),
  interests: normalizeInterests(interests),
  authProvider,
  location: String(location || '').trim(),
  phone: String(phone || '').trim(),
  bio: String(bio || '').trim(),
  profilePic: String(profilePic || '').trim(),
  createdAt: String(createdAt || '').trim(),
  needsInterestsSelection: Boolean(needsInterestsSelection),
  hasCompletedOnboarding:
    typeof hasCompletedOnboarding === 'boolean'
      ? hasCompletedOnboarding
      : !needsInterestsSelection,
  shouldShowInterestsPrompt: Boolean(shouldShowInterestsPrompt),
})

const sanitizeStoredUser = (user = {}) =>
  buildSession({
    email: user.email,
    name: user.name,
    username: user.username,
    interests: user.interests,
    authProvider: user.authProvider || 'local',
    location: user.location,
    phone: user.phone,
    bio: user.bio,
    profilePic: user.profilePic,
    createdAt: user.createdAt,
    needsInterestsSelection: user.needsInterestsSelection,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
    shouldShowInterestsPrompt: user.shouldShowInterestsPrompt,
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

const updateRemoteProfile = async (updates) => {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'eventcinityAPIprofileBRO',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  })

  const data = await readResponseData(response)

  if (!response.ok) {
    const error = new Error(data.message || 'Profile update failed.')
    error.status = response.status
    throw error
  }

  return data
}

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
  try {
    const cryptoModule = getCryptoModule()
    const saltBytes = cryptoModule.getRandomValues(new Uint8Array(16))

    return {
      passwordHash: await derivePasswordHash(password, saltBytes),
      passwordSalt: toBase64(saltBytes),
      passwordIterations: PASSWORD_ITERATIONS,
      passwordDigest: 'SHA-256',
    }
  } catch (error) {
    console.warn('Secure password hashing is unavailable; using legacy local password storage.', error)
    return {
      password: String(password || ''),
    }
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
  username,
  interests = [],
  authProvider = 'local',
  location = '',
  phone = '',
  bio = '',
  profilePic = '',
  createdAt = '',
  needsInterestsSelection = false,
  hasCompletedOnboarding,
  shouldShowInterestsPrompt = false,
}) => {
  const normalizedEmail = normalizeEmail(email)
  const users = getUsers()
  const existingUser = users[normalizedEmail] || {}
  const passwordRecord = String(password || '').trim()
    ? await createPasswordRecord(password)
    : {}

  const nextUser = {
    ...existingUser,
    email: normalizedEmail,
    name: String(name || existingUser.name || getDefaultName(normalizedEmail)).trim(),
    username: String(username || existingUser.username || getDefaultUsername(normalizedEmail)).trim(),
    interests: normalizeInterests(
      Array.isArray(interests) ? interests : existingUser.interests || [],
    ),
    createdAt: String(existingUser.createdAt || createdAt || new Date().toISOString()).trim(),
    authProvider,
    location: String(location ?? existingUser.location ?? '').trim(),
    phone: String(phone ?? existingUser.phone ?? '').trim(),
    bio: String(bio ?? existingUser.bio ?? '').trim(),
    profilePic: String(profilePic ?? existingUser.profilePic ?? '').trim(),
    needsInterestsSelection: Boolean(needsInterestsSelection),
    hasCompletedOnboarding:
      typeof hasCompletedOnboarding === 'boolean'
        ? hasCompletedOnboarding
        : !needsInterestsSelection,
    shouldShowInterestsPrompt: Boolean(shouldShowInterestsPrompt),
    ...passwordRecord,
  }

  if (passwordRecord.passwordHash) {
    delete nextUser.password
  }

  users[normalizedEmail] = nextUser
  saveUsers(users)

  return nextUser
}

export const syncStoredUser = async (user) => {
  if (!canUseLocalAuthFallback() || !user?.email) {
    return null
  }

  return upsertLocalUser({
    email: user.email,
    name: user.name,
    username: user.username,
    interests: user.interests,
    authProvider: user.authProvider || 'local',
    location: user.location,
    phone: user.phone,
    bio: user.bio,
    profilePic: user.profilePic,
    createdAt: user.createdAt,
    needsInterestsSelection: user.needsInterestsSelection,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
    shouldShowInterestsPrompt: user.shouldShowInterestsPrompt,
  })
}

export const getKnownUsers = () =>
  Object.values(getUsers())
    .map((user) => sanitizeStoredUser(user))
    .sort((leftUser, rightUser) => {
      const leftCreatedAt = Date.parse(leftUser.createdAt || '')
      const rightCreatedAt = Date.parse(rightUser.createdAt || '')

      if (!Number.isNaN(leftCreatedAt) && !Number.isNaN(rightCreatedAt)) {
        return rightCreatedAt - leftCreatedAt
      }

      if (!Number.isNaN(leftCreatedAt)) return -1
      if (!Number.isNaN(rightCreatedAt)) return 1

      return leftUser.name.localeCompare(rightUser.name)
    })

const migrateLegacyPasswordIfNeeded = async (email, user, password) => {
  if (!user || typeof user.password !== 'string' || user.passwordHash) {
    return user
  }

  return upsertLocalUser({
    email,
    password,
    name: user.name,
    username: user.username,
    interests: user.interests,
    authProvider: user.authProvider || 'local',
    location: user.location,
    phone: user.phone,
    bio: user.bio,
    profilePic: user.profilePic,
    createdAt: user.createdAt,
    needsInterestsSelection: user.needsInterestsSelection,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
    shouldShowInterestsPrompt: user.shouldShowInterestsPrompt,
  })
}

const createSessionFromAuthPayload = (data, email, fallbackName, authProvider) => {
  const user = data?.user || data?.data?.user || data?.data || {}
  const localMirror = getUsers()[normalizeEmail(email)] || {}
  const resolvedInterests =
    (Array.isArray(user.interests) ? user.interests : null) || localMirror.interests || []
  const needsInterestsSelection =
    typeof user.needsInterestsSelection === 'boolean'
      ? user.needsInterestsSelection
      : typeof localMirror.needsInterestsSelection === 'boolean'
        ? localMirror.needsInterestsSelection
        : resolvedInterests.length === 0
  const hasCompletedOnboarding =
    typeof user.hasCompletedOnboarding === 'boolean'
      ? user.hasCompletedOnboarding
      : typeof localMirror.hasCompletedOnboarding === 'boolean'
        ? localMirror.hasCompletedOnboarding
        : !needsInterestsSelection
  const shouldShowInterestsPrompt =
    typeof user.shouldShowInterestsPrompt === 'boolean'
      ? user.shouldShowInterestsPrompt
      : typeof localMirror.shouldShowInterestsPrompt === 'boolean'
        ? localMirror.shouldShowInterestsPrompt
        : false

  return buildSession({
    email: user.email || localMirror.email || email,
    name: user.name || localMirror.name || fallbackName || getDefaultName(email),
    username: user.username || localMirror.username || '',
    interests: resolvedInterests,
    authProvider,
    location: user.location || localMirror.location || '',
    phone: user.phone || localMirror.phone || '',
    bio: user.bio || localMirror.bio || '',
    profilePic:
      user.profilePic ||
      user.avatar ||
      user.imageUrl ||
      localMirror.profilePic ||
      '',
    createdAt: user.createdAt || localMirror.createdAt || '',
    needsInterestsSelection,
    hasCompletedOnboarding,
    shouldShowInterestsPrompt,
  })
}

const syncLocalAuthMirror = async ({
  email,
  password,
  name,
  username,
  interests,
  authProvider,
  location,
  phone,
  bio,
  profilePic,
  createdAt,
  needsInterestsSelection,
  hasCompletedOnboarding,
  shouldShowInterestsPrompt,
}) => {
  if (!canUseLocalAuthFallback()) {
    return
  }

  try {
    await upsertLocalUser({
      email,
      password,
      name,
      username,
      interests,
      authProvider,
      location,
      phone,
      bio,
      profilePic,
      createdAt,
      needsInterestsSelection,
      hasCompletedOnboarding,
      shouldShowInterestsPrompt,
    })
  } catch (error) {
    console.warn('Unable to cache the signed-in user locally:', error)
  }
}

export const getEmailValidationError = (email) => {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    return 'Email is required.'
  }

  if (!SIGNUP_EMAIL_PATTERN.test(normalizedEmail)) {
    return 'Use a valid email address that includes @ and ends in .com.'
  }

  return ''
}

export const getSignupEmailError = getEmailValidationError

export const setSession = (session) => {
  try {
    const normalizedSession = buildSession(session)
    localStorage.setItem(SESSION_KEY, JSON.stringify(normalizedSession))
  } catch (error) {
    console.warn('Unable to persist the active session locally:', error)
  }
}

export const signUp = async ({ email, password, name }) => {
  const normalizedEmail = normalizeEmail(email)
  const emailError = getEmailValidationError(normalizedEmail)

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

    const session = buildSession({
      ...createSessionFromAuthPayload(data, normalizedEmail, fallbackName, 'remote'),
      needsInterestsSelection: true,
      hasCompletedOnboarding: false,
      shouldShowInterestsPrompt: true,
    })
    setSession(session)
    await syncLocalAuthMirror({
      email: normalizedEmail,
      password,
      name: session.name,
      username: session.username,
      interests: session.interests,
      authProvider: 'remote',
      location: session.location,
      phone: session.phone,
      bio: session.bio,
      profilePic: session.profilePic,
      createdAt: session.createdAt,
      needsInterestsSelection: true,
      hasCompletedOnboarding: false,
      shouldShowInterestsPrompt: true,
    })
    return session
  } catch (error) {
    if (!isRecoverableRemoteAuthError(error) || !canUseLocalAuthFallback()) {
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
      needsInterestsSelection: true,
      hasCompletedOnboarding: false,
      shouldShowInterestsPrompt: true,
    })
    const session = buildSession(user)
    setSession(session)
    return session
  }
}

export const signIn = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email)
  const emailError = getEmailValidationError(normalizedEmail)

  if (emailError) {
    throw new Error(emailError)
  }

  if (!String(password || '').trim()) {
    throw new Error('Password is required.')
  }

  try {
    const data = await requestRemoteAuth('/api/auth/login', {
      email: normalizedEmail,
      password,
    })

    const session = buildSession({
      ...createSessionFromAuthPayload(
        data,
        normalizedEmail,
        getDefaultName(normalizedEmail),
        'remote',
      ),
      shouldShowInterestsPrompt: false,
    })
    setSession(session)
    await syncLocalAuthMirror({
      email: normalizedEmail,
      password,
      name: session.name,
      username: session.username,
      interests: session.interests,
      authProvider: 'remote',
      location: session.location,
      phone: session.phone,
      bio: session.bio,
      profilePic: session.profilePic,
      createdAt: session.createdAt,
      needsInterestsSelection: session.needsInterestsSelection,
      hasCompletedOnboarding: session.hasCompletedOnboarding,
      shouldShowInterestsPrompt: false,
    })
    return session
  } catch (error) {
    if (!isRecoverableRemoteAuthError(error) || !canUseLocalAuthFallback()) {
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
    const session = buildSession({
      ...(nextUser || user),
      shouldShowInterestsPrompt: false,
    })
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

export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch (error) {
    console.warn('Unable to clear the active session locally:', error)
  }
}

export const getSession = () => {
  try {
    const storedSession = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    return storedSession ? buildSession(storedSession) : null
  } catch {
    return null
  }
}

export const saveInterests = async (email, interests) => {
  const normalizedEmail = normalizeEmail(email)
  const session = getSession()

  if (canUseLocalAuthFallback()) {
    await upsertLocalUser({
      email: normalizedEmail,
      name: session?.name,
      username: session?.username,
      interests,
      authProvider: session?.authProvider || 'local',
      location: session?.location,
      phone: session?.phone,
      bio: session?.bio,
      profilePic: session?.profilePic,
      createdAt: session?.createdAt,
      needsInterestsSelection: false,
      hasCompletedOnboarding: true,
      shouldShowInterestsPrompt: false,
    })
  }

  const shouldSyncRemoteProfile =
    session?.authProvider === 'remote' || isHostedAuthEnvironment()

  if (shouldSyncRemoteProfile) {
    try {
      const data = await updateRemoteProfile({ interests })
      const remoteUser = data.user || data.data?.user || {}

      if (session) {
        const nextSession = {
          ...session,
          interests: Array.isArray(remoteUser.interests) ? remoteUser.interests : interests,
          needsInterestsSelection: false,
          hasCompletedOnboarding: true,
          shouldShowInterestsPrompt: false,
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
      }

      return
    } catch (error) {
      console.warn('Unable to sync interests to the backend:', error)
    }
  }

  if (session) {
    session.interests = interests
    session.needsInterestsSelection = false
    session.hasCompletedOnboarding = true
    session.shouldShowInterestsPrompt = false
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
}
