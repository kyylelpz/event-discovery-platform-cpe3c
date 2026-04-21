import { API_BASE_URL } from './apiBase.js'

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
  const payload = await requestUserPayload('/api/users')
  const users = Array.isArray(payload.users)
    ? payload.users
    : Array.isArray(payload.data)
      ? payload.data
      : []

  return users
    .map((user) => normalizePublicUser(user))
    .filter((user) => user.username)
}

export const fetchPublicProfile = async (username) => {
  const payload = await requestUserPayload(
    `/api/profile/${encodeURIComponent(username)}`,
  )

  return normalizePublicUser(payload.user || payload.data || payload)
}
