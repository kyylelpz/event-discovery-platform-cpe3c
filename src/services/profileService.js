import { API_BASE_URL } from './apiBase.js'
import { getAuthRequestHeaders } from './authService.js'

const PROFILE_API_KEY = 'eventcinityAPIprofileBRO'

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
    email,
    name:
      String(rawProfile?.name || rawProfile?.username || fallbackSession.name || '').trim() ||
      getDefaultName(email),
    username: String(rawProfile?.username || fallbackSession.username || '').trim(),
    interests,
    phone: String(rawProfile?.phone || fallbackSession.phone || '').trim(),
    bio: String(rawProfile?.bio || fallbackSession.bio || '').trim(),
    profilePic: String(
      rawProfile?.profilePic ||
        rawProfile?.avatar ||
        rawProfile?.imageUrl ||
        fallbackSession.profilePic ||
        '',
    ).trim(),
    createdAt: String(rawProfile?.createdAt || fallbackSession.createdAt || '').trim(),
    authProvider: rawProfile?.authProvider || fallbackSession.authProvider || 'remote',
    needsInterestsSelection,
    hasCompletedOnboarding,
  }
}

export const fetchCurrentUserProfile = async (fallbackSession = {}) => {
  try {
    return await requestProfile('/api/profile', fallbackSession, {
      'x-api-key': PROFILE_API_KEY,
    })
  } catch (error) {
    if (error?.status !== 404) {
      throw error
    }
  }

  return requestProfile('/api/auth/me', fallbackSession)
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
