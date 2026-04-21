import { API_BASE_URL } from './apiBase.js'
import { getKnownUsers, getSession } from './authService.js'

let communityUsersApiMode = 'unknown'
let publicProfileApiMode = 'unknown'

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

const pickText = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

export const normalizePublicUser = (rawUser = {}) => ({
  id: String(rawUser.id || rawUser._id || '').trim(),
  name: pickText(rawUser.name, rawUser.username) || 'Eventcinity user',
  username: pickText(rawUser.username),
  location: pickText(rawUser.location) || 'Philippines',
  bio:
    pickText(rawUser.bio) ||
    'New to Eventcinity and ready to discover events in the community.',
  profilePic: pickText(rawUser.profilePic, rawUser.avatar, rawUser.imageUrl),
  avatar: pickText(rawUser.avatar, rawUser.profilePic, rawUser.imageUrl),
  createdAt: pickText(rawUser.createdAt),
  createdEventsCount: Number(rawUser.createdEventsCount || 0),
})

const isRecoverableUserError = (error) =>
  error?.name === 'TypeError' ||
  [404, 405, 502, 503, 504].includes(error?.status)

const buildLocalCommunityUsers = () => {
  const currentSession = getSession()

  return [
    ...(currentSession ? [currentSession] : []),
    ...getKnownUsers(),
  ]
    .map((user) => normalizePublicUser(user))
    .filter((user) => user.username)
}

const requestUserPayload = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })
  const data = await readResponseData(response)

  if (!response.ok) {
    const error = new Error(data.message || 'Unable to load users.')
    error.status = response.status
    throw error
  }

  return data
}

export const fetchCommunityUsers = async () => {
  if (communityUsersApiMode === 'missing') {
    return buildLocalCommunityUsers()
  }

  try {
    const payload = await requestUserPayload('/api/users')
    const users = Array.isArray(payload.users)
      ? payload.users
      : Array.isArray(payload.data)
        ? payload.data
        : []

    return users
      .map((user) => normalizePublicUser(user))
      .filter((user) => user.username)
  } catch (error) {
    if (!isRecoverableUserError(error)) {
      throw error
    }

    if ([404, 405].includes(error?.status)) {
      communityUsersApiMode = 'missing'
    }

    return buildLocalCommunityUsers()
  }
}

export const fetchPublicProfile = async (username) => {
  if (publicProfileApiMode === 'missing') {
    const localMatch = buildLocalCommunityUsers().find(
      (user) => user.username === String(username || '').trim(),
    )

    if (localMatch) {
      return localMatch
    }

    const error = new Error('Unable to load users.')
    error.status = 404
    throw error
  }

  try {
    const payload = await requestUserPayload(
      `/api/profile/${encodeURIComponent(username)}`,
    )

    publicProfileApiMode = 'available'
    return normalizePublicUser(payload.user || payload.data || payload)
  } catch (error) {
    if (!isRecoverableUserError(error)) {
      throw error
    }

    if ([404, 405].includes(error?.status)) {
      publicProfileApiMode = 'missing'
    }

    const localMatch = buildLocalCommunityUsers().find(
      (user) => user.username === String(username || '').trim(),
    )

    if (localMatch) {
      return localMatch
    }

    throw error
  }
}
