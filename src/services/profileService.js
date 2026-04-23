import { API_BASE_URL } from './apiBase.js'
import { getAuthRequestHeaders } from './authService.js'
import { normalizeProfilePrivacy, resolveProfilePrivacy } from '../utils/privacy.js'

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

const extractInterestLabel = (value) => {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (value && typeof value === 'object') {
    return String(value.label || value.name || value.title || '').trim()
  }

  return ''
}

const normalizeInterests = (values) => {
  if (!Array.isArray(values)) {
    return []
  }

  return values
    .map((value) => extractInterestLabel(value))
    .filter(Boolean)
}

const parseResponseData = async (response) => {
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

const getDefaultName = (email) => normalizeEmail(email).split('@')[0] || 'Eventcinity user'
const PROFILE_PATHS = ['/api/profile/me', '/api/profile', '/api/auth/me']
let preferredProfilePath = PROFILE_PATHS[0]

const isRecoverableProfileError = (error) =>
  error?.name === 'TypeError' ||
  [404, 405, 502, 503, 504].includes(error?.status)

const requestProfile = async (path, fallbackSession = {}, headers = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: getAuthRequestHeaders({
      Accept: 'application/json',
      ...headers,
    }),
  })

  const data = await parseResponseData(response)

  if (!response.ok) {
    const error = new Error(data.message || 'Unable to load the signed-in user profile.')
    error.status = response.status
    throw error
  }

  const rawProfile = data.user || data.data?.user || data.data || data
  return normalizeProfile(rawProfile, fallbackSession)
}

export const normalizeProfile = (rawProfile, fallbackSession = {}) => {
  const email = normalizeEmail(rawProfile?.email || fallbackSession.email)
  const fallbackInterests = normalizeInterests(fallbackSession.interests)
  const remoteInterests = normalizeInterests(rawProfile?.interests)
  const interests = remoteInterests.length > 0 ? remoteInterests : fallbackInterests
  const needsInterestsSelection =
    typeof rawProfile?.needsInterestsSelection === 'boolean'
      ? rawProfile.needsInterestsSelection
      : typeof fallbackSession.needsInterestsSelection === 'boolean'
        ? fallbackSession.needsInterestsSelection
        : interests.length === 0
  const hasCompletedOnboarding =
    typeof rawProfile?.hasCompletedOnboarding === 'boolean'
      ? rawProfile.hasCompletedOnboarding
      : typeof fallbackSession.hasCompletedOnboarding === 'boolean'
        ? fallbackSession.hasCompletedOnboarding
        : !needsInterestsSelection

  return {
    id: String(rawProfile?.id || rawProfile?._id || fallbackSession.id || '').trim(),
    email,
    name:
      String(rawProfile?.name || rawProfile?.username || fallbackSession.name || '').trim() ||
      getDefaultName(email),
    username: String(rawProfile?.username || fallbackSession.username || '').trim(),
    interests,
    location: String(rawProfile?.location || fallbackSession.location || 'Philippines').trim(),
    phone: String(rawProfile?.phone || fallbackSession.phone || '').trim(),
    bio: String(rawProfile?.bio || fallbackSession.bio || '').trim(),
    profilePic: String(
      rawProfile?.profilePic ||
        rawProfile?.avatar ||
        rawProfile?.imageUrl ||
        fallbackSession.profilePic ||
        '',
    ).trim(),
    privacy: resolveProfilePrivacy(rawProfile, normalizeProfilePrivacy(fallbackSession.privacy)),
    createdAt: String(rawProfile?.createdAt || fallbackSession.createdAt || '').trim(),
    followersCount: Number(rawProfile?.followersCount ?? fallbackSession.followersCount ?? 0),
    followingCount: Number(rawProfile?.followingCount ?? fallbackSession.followingCount ?? 0),
    followerUsernames: Array.isArray(rawProfile?.followerUsernames)
      ? rawProfile.followerUsernames.map((value) => String(value || '').trim().toLowerCase()).filter(Boolean)
      : Array.isArray(fallbackSession.followerUsernames)
        ? fallbackSession.followerUsernames
        : [],
    followingUsernames: Array.isArray(rawProfile?.followingUsernames)
      ? rawProfile.followingUsernames.map((value) => String(value || '').trim().toLowerCase()).filter(Boolean)
      : Array.isArray(fallbackSession.followingUsernames)
        ? fallbackSession.followingUsernames
        : [],
    authProvider:
      rawProfile?.authProvider ||
      rawProfile?.provider ||
      fallbackSession.authProvider ||
      'remote',
    needsInterestsSelection,
    hasCompletedOnboarding,
  }
}

export const fetchCurrentUserProfile = async (fallbackSession = {}) => {
  if (preferredProfilePath === 'local') {
    return normalizeProfile({}, fallbackSession)
  }

  const candidatePaths = [
    preferredProfilePath,
    ...PROFILE_PATHS.filter((path) => path !== preferredProfilePath),
  ]

  for (const path of candidatePaths) {
    try {
      const profile = await requestProfile(path, fallbackSession)
      preferredProfilePath = path
      return profile
    } catch (error) {
      if (!isRecoverableProfileError(error)) {
        throw error
      }
    }
  }

  preferredProfilePath = 'local'
  return normalizeProfile({}, fallbackSession)
}

export const formatMemberSince = (createdAt) => {
  if (!createdAt) {
    return 'Recently joined'
  }

  const parsedDate = new Date(createdAt)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Recently joined'
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'long',
    year: 'numeric',
  }).format(parsedDate)
}
