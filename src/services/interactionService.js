import { API_BASE_URL } from './apiBase.js'
import { getAuthRequestHeaders, getSession } from './authService.js'
import {
  buildGoogleMapsSearchUrl,
  createPosterDataUri,
  formatTimeLabel,
  normalizeTimeInputValue,
} from '../utils/formatters.js'

const INTERACTION_STORAGE_KEY = 'eventcinity_interactions'
let interactionApiMode = 'unknown'

const normalizeIdList = (values) =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => String(value || '').trim())
        .filter(Boolean),
    ),
  )

const pickText = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

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

const buildFallbackEventImage = ({ title, location, category }) =>
  createPosterDataUri({
    title,
    location,
    category,
  })

const mapInteractionRecordToEvent = (record = {}) => {
  const title = pickText(record.title) || 'Saved Event'
  const category = pickText(record.category) || 'Community'
  const location = pickText(record.location) || 'Philippines'
  const province = pickText(record.province)
  const dateLabel = pickText(record.date)
  const imageUrl = pickText(record.imageUrl)
  const fallbackImage = buildFallbackEventImage({
    title,
    location,
    category,
  })
  const mapLabel = pickText(location, province) || location
  const normalizedStartDate = /^\d{4}-\d{2}-\d{2}/.test(dateLabel) ? dateLabel : ''
  const normalizedTimeValue = normalizeTimeInputValue(pickText(record.time))

  return {
    id: String(record.eventId || record.id || '').trim(),
    title,
    category,
    startDate: normalizedStartDate,
    rawDate: normalizedStartDate ? '' : dateLabel,
    timeLabel: normalizedTimeValue ? formatTimeLabel(normalizedTimeValue) : pickText(record.time),
    timeValue: normalizedTimeValue,
    location,
    province,
    host: pickText(record.host) || 'Eventcinity',
    description: pickText(record.description) || 'Saved from your Eventcinity activity.',
    attendeeCount: 0,
    savedCount: 0,
    reactions: 0,
    createdBy: '',
    source: 'interaction',
    image: imageUrl || fallbackImage,
    fallbackImage,
    imageLabel: `${title} event artwork`,
    mapLabel,
    mapUrl: buildGoogleMapsSearchUrl(mapLabel),
    eventUrl: pickText(record.eventUrl),
  }
}

const mapAttendeeUser = (user = {}) => ({
  id: String(user.id || user._id || '').trim(),
  username: String(user.username || '').trim().toLowerCase(),
  name: pickText(user.name, user.username) || 'Eventcinity user',
  profilePic: pickText(user.profilePic, user.avatar),
  attendedAt: String(user.attendedAt || '').trim(),
})

export const buildEmptyInteractionState = () => ({
  interactions: {
    hearted: [],
    saved: [],
    attending: [],
  },
  records: [],
  savedEvents: [],
  likedEvents: [],
  attendingEvents: [],
})

const buildInteractionSummary = (records = []) =>
  records.reduce(
    (summary, record) => {
      if (record.hearted) {
        summary.hearted.push(record.eventId)
      }

      if (record.saved) {
        summary.saved.push(record.eventId)
      }

      if (record.attending) {
        summary.attending.push(record.eventId)
      }

      return summary
    },
    {
      hearted: [],
      saved: [],
      attending: [],
    },
  )

const getInteractionOwnerKey = () => {
  const session = getSession()

  if (session?.id) {
    return `id:${session.id}`
  }

  if (session?.email) {
    return `email:${String(session.email).trim().toLowerCase()}`
  }

  return ''
}

const readInteractionStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(INTERACTION_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

const writeInteractionStorage = (value) => {
  try {
    localStorage.setItem(INTERACTION_STORAGE_KEY, JSON.stringify(value))
  } catch (error) {
    console.warn('Unable to cache interaction state locally:', error)
  }
}

const normalizeInteractionState = (payload = {}) => {
  const records = Array.isArray(payload.records) ? payload.records : []
  const normalizedRecords = records
    .map((record) => ({
      ...record,
      eventId: String(record.eventId || record.id || '').trim(),
    }))
    .filter((record) => record.eventId)
  const interactions =
    payload.interactions && typeof payload.interactions === 'object'
      ? payload.interactions
      : buildInteractionSummary(normalizedRecords)

  return {
    interactions: {
      hearted: normalizeIdList(interactions.hearted),
      saved: normalizeIdList(interactions.saved),
      attending: normalizeIdList(interactions.attending),
    },
    records: normalizedRecords,
    savedEvents: normalizedRecords
      .filter((record) => record.saved)
      .map((record) => mapInteractionRecordToEvent(record)),
    likedEvents: normalizedRecords
      .filter((record) => record.hearted)
      .map((record) => mapInteractionRecordToEvent(record)),
    attendingEvents: normalizedRecords
      .filter((record) => record.attending)
      .map((record) => mapInteractionRecordToEvent(record)),
  }
}

const readLocalInteractionState = () => {
  const ownerKey = getInteractionOwnerKey()

  if (!ownerKey) {
    return buildEmptyInteractionState()
  }

  const storage = readInteractionStorage()
  return normalizeInteractionState(storage[ownerKey] || {})
}

const persistLocalInteractionState = (state) => {
  const ownerKey = getInteractionOwnerKey()

  if (!ownerKey) {
    return state
  }

  const storage = readInteractionStorage()
  storage[ownerKey] = {
    interactions: state.interactions,
    records: state.records,
  }
  writeInteractionStorage(storage)
  return state
}

const isRecoverableInteractionError = (error) =>
  error?.name === 'TypeError' ||
  [401, 403, 404, 405, 502, 503, 504].includes(error?.status)

const buildLocalInteractionState = (event, nextState) => {
  const currentState = readLocalInteractionState()
  const eventId = String(event?.id || '').trim()

  if (!eventId) {
    return currentState
  }

  const nextFlags = {
    hearted: Boolean(nextState?.hearted),
    saved: Boolean(nextState?.saved),
    attending: Boolean(nextState?.attending),
  }
  const hasActiveInteraction = Object.values(nextFlags).some(Boolean)
  const existingRecords = Array.isArray(currentState.records) ? currentState.records : []
  const remainingRecords = existingRecords.filter((record) => record.eventId !== eventId)

  if (!hasActiveInteraction) {
    return persistLocalInteractionState(
      normalizeInteractionState({
        records: remainingRecords,
      }),
    )
  }

  return persistLocalInteractionState(
    normalizeInteractionState({
      records: [
        {
          eventId,
          ...nextFlags,
          title: event.title || '',
          location: event.location || '',
          date: event.startDate || event.rawDate || '',
          time: event.timeLabel || '',
          category: event.category || '',
          description: event.description || '',
          imageUrl: event.image || event.imageUrl || '',
          eventUrl: event.eventUrl || '',
          province: event.province || '',
          host: event.host || '',
        },
        ...remainingRecords,
      ],
    }),
  )
}

const requestInteractionState = async (path = '', options = {}) => {
  const response = await fetch(`${API_BASE_URL}/api/interactions${path}`, {
    credentials: 'include',
    headers: getAuthRequestHeaders({
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }),
    ...options,
  })
  const data = await readResponseData(response)

  if (!response.ok || data?.success === false) {
    const error = new Error(data.message || 'Unable to sync event interactions.')
    error.status = response.status
    throw error
  }

  return persistLocalInteractionState(normalizeInteractionState(data.data || data))
}

export const fetchInteractionState = async () => {
  if (interactionApiMode === 'missing') {
    return readLocalInteractionState()
  }

  try {
    const state = await requestInteractionState()
    interactionApiMode = 'available'
    return state
  } catch (error) {
    if (!isRecoverableInteractionError(error)) {
      throw error
    }

    if ([404, 405].includes(error?.status)) {
      interactionApiMode = 'missing'
    }

    return readLocalInteractionState()
  }
}

export const updateInteractionState = async (event, nextState) => {
  const eventId = String(event?.id || '').trim()

  if (!eventId) {
    throw new Error('Event id is required to save the interaction state.')
  }

  try {
    if (interactionApiMode === 'missing') {
      return buildLocalInteractionState(event, nextState)
    }

    const state = await requestInteractionState(`/${encodeURIComponent(eventId)}`, {
      method: 'PUT',
      body: JSON.stringify({
        eventId,
        hearted: Boolean(nextState?.hearted),
        saved: Boolean(nextState?.saved),
        attending: Boolean(nextState?.attending),
        title: event.title,
        location: event.location,
        date: event.startDate || event.rawDate || '',
        time: event.timeLabel || '',
        category: event.category,
        description: event.description,
        imageUrl: event.image || event.imageUrl || '',
        eventUrl: event.eventUrl || '',
        province: event.province || '',
        host: event.host || '',
      }),
    })
    interactionApiMode = 'available'
    return state
  } catch (error) {
    if (!isRecoverableInteractionError(error)) {
      throw error
    }

    if ([404, 405].includes(error?.status)) {
      interactionApiMode = 'missing'
    }

    return buildLocalInteractionState(event, nextState)
  }
}

export const fetchPublicAttendingEvents = async (username) => {
  const normalizedUsername = String(username || '').trim()

  if (!normalizedUsername) {
    return []
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/interactions/public/${encodeURIComponent(normalizedUsername)}/attending`,
      {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      },
    )
    const data = await readResponseData(response)

    if (!response.ok || data?.success === false) {
      const error = new Error(data.message || 'Unable to load public attending events.')
      error.status = response.status
      throw error
    }

    const records = Array.isArray(data?.data?.records)
      ? data.data.records
      : Array.isArray(data?.records)
        ? data.records
        : []

    return records.map((record) => mapInteractionRecordToEvent(record))
  } catch (error) {
    if (!isRecoverableInteractionError(error)) {
      throw error
    }

    return []
  }
}

export const fetchFollowingAttendees = async (eventId) => {
  const normalizedEventId = String(eventId || '').trim()

  if (!normalizedEventId) {
    return []
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/interactions/${encodeURIComponent(normalizedEventId)}/following-attendees`,
      {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          ...getAuthRequestHeaders(),
        },
      },
    )
    const data = await readResponseData(response)

    if (!response.ok || data?.success === false) {
      const error = new Error(data.message || 'Unable to load followed attendees.')
      error.status = response.status
      throw error
    }

    const records = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.attendees)
        ? data.attendees
        : []

    return records.map((user) => mapAttendeeUser(user)).filter((user) => user.id)
  } catch (error) {
    if (!isRecoverableInteractionError(error)) {
      throw error
    }

    return []
  }
}
