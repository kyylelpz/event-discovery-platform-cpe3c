import { API_BASE_URL } from './apiBase.js'
import { getKnownUsers, getSession } from './authService.js'
import { provinces } from '../data/mockData.js'

let communityUsersApiMode = 'unknown'
let publicProfileApiMode = 'unknown'
const GENERATED_COMMUNITY_USER_COUNT = 36
const GENERATED_FIRST_NAMES = [
  'Ava', 'Nico', 'Dana', 'Luis', 'Mia', 'Carlo', 'Ivy', 'Jules', 'Kara', 'Paolo',
  'Sage', 'Toni', 'Lara', 'Eli', 'Noah', 'Celine', 'Rafa', 'Aya',
]
const GENERATED_LAST_NAMES = [
  'Dizon', 'Garcia', 'Mendoza', 'Lopez', 'Ramos', 'Fernandez', 'Navarro', 'Salonga',
  'Castillo', 'Soriano', 'Torres', 'Villanueva', 'Gutierrez', 'Delos Santos',
]
const GENERATED_INTERESTS = [
  'Music',
  'Art & Culture',
  'Food & Drink',
  'Sports',
  'Tech',
  'Business',
  'Wellness',
  'Education',
  'Community',
  'Travel',
]

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

const normalizeUsernameValue = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

export const normalizePublicUser = (rawUser = {}) => ({
  id: String(rawUser.id || rawUser._id || '').trim(),
  email: pickText(rawUser.email).toLowerCase(),
  name: pickText(rawUser.name, rawUser.username) || 'Eventcinity user',
  username: pickText(rawUser.username),
  location: pickText(rawUser.location) || 'Philippines',
  bio:
    pickText(rawUser.bio) ||
    'New to Eventcinity and ready to discover events in the community.',
  phone: pickText(rawUser.phone, rawUser.contact),
  contact: pickText(rawUser.contact, rawUser.phone),
  interests: Array.isArray(rawUser.interests)
    ? rawUser.interests
        .map((interest) => pickText(interest))
        .filter(Boolean)
    : [],
  profilePic: pickText(rawUser.profilePic, rawUser.avatar, rawUser.imageUrl),
  avatar: pickText(rawUser.avatar, rawUser.profilePic, rawUser.imageUrl),
  createdAt: pickText(rawUser.createdAt),
  createdEventsCount: Number(rawUser.createdEventsCount || 0),
})

const buildGeneratedCommunityUsers = (existingUsers = []) => {
  const reservedUsernames = new Set(
    existingUsers.map((user) => normalizeUsernameValue(user?.username)).filter(Boolean),
  )
  const generatedUsers = []
  let seedIndex = 0

  while (generatedUsers.length < GENERATED_COMMUNITY_USER_COUNT) {
    const firstName = GENERATED_FIRST_NAMES[seedIndex % GENERATED_FIRST_NAMES.length]
    const lastName =
      GENERATED_LAST_NAMES[
        Math.floor(seedIndex / GENERATED_FIRST_NAMES.length) % GENERATED_LAST_NAMES.length
      ]
    const location = provinces[seedIndex % provinces.length]
    const username = normalizeUsernameValue(`${firstName}-${lastName}-${seedIndex + 1}`)

    if (!reservedUsernames.has(username)) {
      const interests = Array.from({ length: 3 }, (_, offset) =>
        GENERATED_INTERESTS[(seedIndex + offset * 3) % GENERATED_INTERESTS.length],
      )

      generatedUsers.push(
        normalizePublicUser({
          id: `generated-user-${seedIndex + 1}`,
          email: `${username}@eventcinity-demo.com`,
          name: `${firstName} ${lastName}`,
          username,
          location,
          bio: `${firstName} curates ${interests[0].toLowerCase()}, ${interests[1].toLowerCase()}, and ${interests[2].toLowerCase()} plans around ${location}.`,
          interests,
          createdAt: new Date(2025, seedIndex % 12, (seedIndex % 27) + 1).toISOString(),
          createdEventsCount: (seedIndex % 5) + 1,
        }),
      )

      reservedUsernames.add(username)
    }

    seedIndex += 1
  }

  return generatedUsers
}

const appendGeneratedCommunityUsers = (users = []) => [
  ...users,
  ...buildGeneratedCommunityUsers(users),
]

const isRecoverableUserError = (error) =>
  error?.name === 'TypeError' ||
  [404, 405, 502, 503, 504].includes(error?.status)

const buildLocalCommunityUsers = () => {
  const currentSession = getSession()

  return appendGeneratedCommunityUsers([
    ...(currentSession ? [currentSession] : []),
    ...getKnownUsers(),
  ])
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

    return appendGeneratedCommunityUsers(
      users
        .map((user) => normalizePublicUser(user))
        .filter((user) => user.username),
    )
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
