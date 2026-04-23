import { API_BASE_URL, isLocalHostname } from './apiBase.js'

const USERS_KEY = 'eventcinity_users'
const SESSION_KEY = 'eventcinity_session'
const PASSWORD_ITERATIONS = 120000
const SIGNUP_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.com$/i
const USERNAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const PASSWORD_UPPERCASE_PATTERN = /[A-Z]/
const PASSWORD_LOWERCASE_PATTERN = /[a-z]/
const PASSWORD_NUMBER_PATTERN = /\d/
const PASSWORD_SPECIAL_PATTERN = /[^A-Za-z0-9]/
const textEncoder = new TextEncoder()

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()
const getDefaultName = (email) => normalizeEmail(email).split('@')[0] || 'Eventcinity user'
export const normalizeUsername = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
const getDefaultUsername = (email) =>
  normalizeUsername(getDefaultName(email)) || 'eventcinity-user'
const normalizeInterests = (values) =>
  Array.isArray(values)
    ? values
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    : []
export const getUsernameValidationError = (username) => {
  const normalizedUsername = normalizeUsername(username)

  if (!normalizedUsername) {
    return 'Username is required.'
  }

  if (normalizedUsername.length < 3) {
    return 'Username must be at least 3 characters long.'
  }

  if (normalizedUsername.length > 30) {
    return 'Username can be at most 30 characters long.'
  }

  if (!USERNAME_PATTERN.test(normalizedUsername)) {
    return 'Use lowercase letters, numbers, and single hyphens only.'
  }

  return ''
}
const isBrowser = typeof window !== 'undefined'

export const isHostedAuthEnvironment = () => {
  if (!isBrowser) {
    return false
  }

  const explicitBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (explicitBaseUrl) {
    try {
      return !isLocalHostname(new URL(explicitBaseUrl).hostname)
    } catch {
      return !isLocalHostname(window.location.hostname)
    }
  }

  return !isLocalHostname(window.location.hostname)
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
  id = '',
  email,
  name,
  username = '',
  interests = [],
  token = '',
  authProvider = 'local',
  location = '',
  phone = '',
  bio = '',
  profilePic = '',
  createdAt = '',
  followersCount = 0,
  followingCount = 0,
  followerUsernames = [],
  followingUsernames = [],
  needsInterestsSelection = false,
  hasCompletedOnboarding,
  shouldShowInterestsPrompt = false,
}) => ({
  id: String(id || '').trim(),
  email: normalizeEmail(email),
  name: String(name || '').trim() || getDefaultName(email),
  username: String(username || getDefaultUsername(email)).trim(),
  interests: normalizeInterests(interests),
  token: String(token || '').trim(),
  authProvider,
  location: String(location || '').trim(),
  phone: String(phone || '').trim(),
  bio: String(bio || '').trim(),
  profilePic: String(profilePic || '').trim(),
  createdAt: String(createdAt || '').trim(),
  followersCount: Number(followersCount || 0),
  followingCount: Number(followingCount || 0),
  followerUsernames: Array.isArray(followerUsernames)
    ? followerUsernames.map((value) => String(value || '').trim().toLowerCase()).filter(Boolean)
    : [],
  followingUsernames: Array.isArray(followingUsernames)
    ? followingUsernames.map((value) => String(value || '').trim().toLowerCase()).filter(Boolean).filter((value, index, values) => values.indexOf(value) === index)
    : [],
  needsInterestsSelection: Boolean(needsInterestsSelection),
  hasCompletedOnboarding:
    typeof hasCompletedOnboarding === 'boolean'
      ? hasCompletedOnboarding
      : !needsInterestsSelection,
  shouldShowInterestsPrompt: Boolean(shouldShowInterestsPrompt),
})

const sanitizeStoredUser = (user = {}) =>
  buildSession({
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    interests: user.interests,
    token: user.token,
    authProvider: user.authProvider || 'local',
    location: user.location,
    phone: user.phone,
    bio: user.bio,
    profilePic: user.profilePic,
    createdAt: user.createdAt,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    followerUsernames: user.followerUsernames,
    followingUsernames: user.followingUsernames,
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

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key)

const ensureUniqueLocalUsername = (username, currentEmail = '') => {
  if (!username) {
    return
  }

  const duplicateUser = Object.values(getUsers()).find((user) => {
    const sameUsername = normalizeUsername(user?.username) === username
    const sameEmail = normalizeEmail(user?.email) === normalizeEmail(currentEmail)

    return sameUsername && !sameEmail
  })

  if (duplicateUser) {
    throw new Error('That username is already in use.')
  }
}

const normalizeProfileUpdates = (updates = {}) => {
  const normalizedUpdates = {}

  if (hasOwn(updates, 'name')) {
    normalizedUpdates.name = String(updates.name || '').trim()
  }

  if (hasOwn(updates, 'username')) {
    const normalizedUsername = normalizeUsername(updates.username)
    const usernameError = getUsernameValidationError(normalizedUsername)

    if (usernameError) {
      throw new Error(usernameError)
    }

    normalizedUpdates.username = normalizedUsername
  }

  if (hasOwn(updates, 'interests')) {
    normalizedUpdates.interests = normalizeInterests(updates.interests)
  }

  if (hasOwn(updates, 'location')) {
    normalizedUpdates.location = String(updates.location || '').trim()
  }

  if (hasOwn(updates, 'phone') || hasOwn(updates, 'contact')) {
    normalizedUpdates.phone = String(updates.phone ?? updates.contact ?? '').trim()
  }

  if (hasOwn(updates, 'bio')) {
    normalizedUpdates.bio = String(updates.bio || '').trim()
  }

  if (hasOwn(updates, 'profilePic') || hasOwn(updates, 'avatar')) {
    normalizedUpdates.profilePic = String(
      updates.profilePic ?? updates.avatar ?? '',
    ).trim()
  }

  return normalizedUpdates
}

const buildProfileSession = (
  session,
  normalizedUpdates = {},
  remoteUser = {},
  { completeOnboarding = false } = {},
) => {
  const resolvedInterests = hasOwn(remoteUser, 'interests')
    ? normalizeInterests(remoteUser.interests)
    : hasOwn(normalizedUpdates, 'interests')
      ? normalizeInterests(normalizedUpdates.interests)
      : normalizeInterests(session.interests)
  const needsInterestsSelection =
    completeOnboarding
      ? false
      : typeof remoteUser?.needsInterestsSelection === 'boolean'
        ? remoteUser.needsInterestsSelection
        : resolvedInterests.length === 0
  const hasCompletedOnboarding =
    completeOnboarding
      ? true
      : typeof remoteUser?.hasCompletedOnboarding === 'boolean'
        ? remoteUser.hasCompletedOnboarding
        : !needsInterestsSelection

  return buildSession({
    ...session,
    id: remoteUser?.id || remoteUser?._id || session.id,
    email: remoteUser?.email || session.email,
    name:
      remoteUser?.name ||
      (hasOwn(normalizedUpdates, 'name') ? normalizedUpdates.name : session.name),
    username:
      remoteUser?.username ||
      (hasOwn(normalizedUpdates, 'username')
        ? normalizedUpdates.username
        : session.username),
    interests: resolvedInterests,
    location:
      remoteUser?.location ||
      (hasOwn(normalizedUpdates, 'location')
        ? normalizedUpdates.location
        : session.location),
    phone:
      remoteUser?.phone ||
      (hasOwn(normalizedUpdates, 'phone') ? normalizedUpdates.phone : session.phone),
    bio:
      remoteUser?.bio ||
      (hasOwn(normalizedUpdates, 'bio') ? normalizedUpdates.bio : session.bio),
    profilePic:
      remoteUser?.profilePic ||
      remoteUser?.avatar ||
      remoteUser?.imageUrl ||
      (hasOwn(normalizedUpdates, 'profilePic')
        ? normalizedUpdates.profilePic
        : session.profilePic),
    createdAt: remoteUser?.createdAt || session.createdAt,
    authProvider:
      remoteUser?.authProvider ||
      remoteUser?.provider ||
      session.authProvider ||
      'remote',
    needsInterestsSelection,
    hasCompletedOnboarding,
    shouldShowInterestsPrompt:
      completeOnboarding
        ? false
        : Boolean(session.shouldShowInterestsPrompt && needsInterestsSelection),
  })
}

const updateRemoteProfile = async (updates) => {
  const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
    method: 'PUT',
    headers: getAuthRequestHeaders({
      'Content-Type': 'application/json',
    }),
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
  id = '',
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
    id: String(id || existingUser.id || '').trim(),
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
    id: user.id,
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
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    followerUsernames: user.followerUsernames,
    followingUsernames: user.followingUsernames,
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
    id: user.id,
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
  const token = String(data?.token || data?.data?.token || '').trim()
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
    id: user.id || localMirror.id || '',
    email: user.email || localMirror.email || email,
    name: user.name || localMirror.name || fallbackName || getDefaultName(email),
    username: user.username || localMirror.username || '',
    interests: resolvedInterests,
    token,
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
  id,
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
      id,
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

export const saveCurrentUserProfile = async (
  updates = {},
  { completeOnboarding = false, fallbackEmail = '' } = {},
) => {
  const storedSession = getSession()
  const normalizedFallbackEmail = normalizeEmail(fallbackEmail)

  if (!storedSession?.email && !normalizedFallbackEmail) {
    throw new Error('You need to sign in first.')
  }

  const session = storedSession
    ? buildSession(storedSession)
    : buildSession({ email: normalizedFallbackEmail })
  const normalizedUpdates = normalizeProfileUpdates(updates)

  if (canUseLocalAuthFallback() && hasOwn(normalizedUpdates, 'username')) {
    ensureUniqueLocalUsername(normalizedUpdates.username, session.email)
  }

  const shouldSyncRemoteProfile =
    session.authProvider === 'remote' || isHostedAuthEnvironment()

  let remoteUser = {}

  if (shouldSyncRemoteProfile) {
    try {
      const data = await updateRemoteProfile(normalizedUpdates)
      remoteUser = data.user || data.data?.user || data.data || {}
    } catch (error) {
      if (!isRecoverableRemoteAuthError(error) || !canUseLocalAuthFallback()) {
        throw error
      }

      console.warn('Unable to sync the profile to the backend:', error)
    }
  }

  const nextSession = buildProfileSession(session, normalizedUpdates, remoteUser, {
    completeOnboarding,
  })

  setSession(nextSession)
  await syncLocalAuthMirror({
    id: nextSession.id,
    email: nextSession.email,
    name: nextSession.name,
    username: nextSession.username,
    interests: nextSession.interests,
    authProvider: nextSession.authProvider,
    location: nextSession.location,
    phone: nextSession.phone,
    bio: nextSession.bio,
    profilePic: nextSession.profilePic,
    createdAt: nextSession.createdAt,
    needsInterestsSelection: nextSession.needsInterestsSelection,
    hasCompletedOnboarding: nextSession.hasCompletedOnboarding,
    shouldShowInterestsPrompt: nextSession.shouldShowInterestsPrompt,
  })

  return nextSession
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

export const getPasswordValidationChecks = (password) => {
  const rawPassword = String(password || '')

  return [
    { id: 'length', label: 'At least 6 characters', isValid: rawPassword.length >= 6 },
    {
      id: 'uppercase',
      label: 'One uppercase letter',
      isValid: PASSWORD_UPPERCASE_PATTERN.test(rawPassword),
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter',
      isValid: PASSWORD_LOWERCASE_PATTERN.test(rawPassword),
    },
    {
      id: 'number',
      label: 'One number',
      isValid: PASSWORD_NUMBER_PATTERN.test(rawPassword),
    },
    {
      id: 'special',
      label: 'One special character',
      isValid: PASSWORD_SPECIAL_PATTERN.test(rawPassword),
    },
  ]
}

export const getPasswordValidationErrors = (password) => {
  const rawPassword = String(password || '')

  if (!rawPassword) {
    return ['Password is required.']
  }

  return getPasswordValidationChecks(rawPassword)
    .filter((check) => !check.isValid)
    .map((check) => `Password must include ${check.label.toLowerCase()}.`)
}

export const getPasswordValidationError = (password) => {
  return getPasswordValidationErrors(password)[0] || ''
}

export const setSession = (session) => {
  try {
    const normalizedSession = buildSession(session)
    localStorage.setItem(SESSION_KEY, JSON.stringify(normalizedSession))
  } catch (error) {
    console.warn('Unable to persist the active session locally:', error)
  }
}

export const getAuthRequestHeaders = (headers = {}) => {
  const session = getSession()
  const token = String(session?.token || '').trim()

  if (!token) {
    return headers
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  }
}

export const signUp = async ({ email, password, name }) => {
  const normalizedEmail = normalizeEmail(email)
  const emailError = getEmailValidationError(normalizedEmail)

  if (emailError) {
    throw new Error(emailError)
  }

  const passwordError = getPasswordValidationError(password)

  if (passwordError) {
    throw new Error(passwordError)
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
      id: session.id,
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
      id: session.id,
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
  const authHeaders = getAuthRequestHeaders()
  localStorage.removeItem(SESSION_KEY)

  void fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: authHeaders,
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
  return saveCurrentUserProfile(
    { interests },
    {
      completeOnboarding: true,
      fallbackEmail: email,
    },
  )
}
