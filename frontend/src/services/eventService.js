import { seedEvents } from '../data/mockData.js'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000').replace(
  /\/$/,
  '',
)

const normalizeRemoteEvent = (event, fallbackLocation) => ({
  id: event.id,
  title: event.title,
  category: event.category,
  startDate: event.startDate,
  timeLabel: event.timeLabel,
  location: event.location,
  province: event.province || fallbackLocation,
  host: event.host,
  description: event.description,
  attendeeCount: Number(event.attendeeCount || 0),
  savedCount: Number(event.savedCount || 0),
  reactions: Number(event.reactions || 0),
  attendees: Array.isArray(event.attendees) ? event.attendees : [],
  mapLabel: event.mapLabel || event.location,
  createdBy: event.createdBy || 'lia-tan',
  source: event.source || 'live',
  image: event.image,
  imageLabel: event.imageLabel || 'Imported event artwork',
  eventUrl: event.eventUrl || '',
})

const hasCanonicalEventShape = (event) =>
  Boolean(
    event &&
      typeof event.id === 'string' &&
      typeof event.title === 'string' &&
      typeof event.startDate === 'string' &&
      typeof event.location === 'string',
  )

export const loadEventsByLocation = async (location) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/events?location=${encodeURIComponent(location)}`,
    )

    if (!response.ok) {
      throw new Error('Failed to load live events')
    }

    const payload = await response.json()

    if (!Array.isArray(payload.events)) {
      throw new Error('Invalid event payload')
    }

    if (!payload.events.every(hasCanonicalEventShape)) {
      throw new Error('Invalid event payload')
    }

    return {
      events: payload.events.map((event) => normalizeRemoteEvent(event, location)),
      mode: 'live',
    }
  } catch {
    return {
      events:
        location === 'All Luzon'
          ? seedEvents
          : seedEvents.filter((event) => event.province === location),
      mode: 'mock',
    }
  }
}
