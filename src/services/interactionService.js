import { API_BASE_URL } from './apiBase.js'
import { getAuthRequestHeaders } from './authService.js'
import { buildGoogleMapsSearchUrl, createPosterDataUri } from '../utils/formatters.js'

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

  return {
    id: String(record.eventId || record.id || '').trim(),
    title,
    category,
    startDate: normalizedStartDate,
    rawDate: normalizedStartDate ? '' : dateLabel,
    timeLabel: pickText(record.time),
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

const normalizeInteractionState = (payload = {}) => {
  const records = Array.isArray(payload.records) ? payload.records : []
  const normalizedRecords = records
    .map((record) => ({
      ...record,
      eventId: String(record.eventId || record.id || '').trim(),
    }))
    .filter((record) => record.eventId)
  const interactions = payload.interactions || {}

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

  return normalizeInteractionState(data.data || data)
}

export const fetchInteractionState = async () => requestInteractionState()

export const updateInteractionState = async (event, nextState) => {
  const eventId = String(event?.id || '').trim()

  if (!eventId) {
    throw new Error('Event id is required to save the interaction state.')
  }

  return requestInteractionState(`/${encodeURIComponent(eventId)}`, {
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
}
