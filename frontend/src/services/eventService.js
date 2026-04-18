import { seedEvents } from '../data/mockData.js'
import { createPosterDataUri } from '../utils/formatters.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

const normalizeRemoteEvent = (event, fallbackLocation) => ({
  id:
    event.id ||
    `${(event.name || event.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  title: event.name || event.title || 'Untitled Event',
  category: event.category || event.segment || 'Community',
  startDate: event.startDate || event.start_time || event.date || '2026-05-01',
  timeLabel: event.timeLabel || event.start_time || 'Time to be announced',
  location:
    event.location ||
    event.venue?.name ||
    event.address ||
    `${fallbackLocation}, Philippines`,
  province: fallbackLocation,
  host: event.host || event.organizer || 'Eventcinity Partner',
  description:
    event.description ||
    'Imported from a live events source. This mapping can be swapped for Eventbrite payloads later without changing the JSX UI.',
  attendeeCount: event.attendeeCount || event.going_count || 0,
  savedCount: event.savedCount || 0,
  reactions: event.reactions || 0,
  attendees: [],
  mapLabel:
    event.mapLabel ||
    event.location ||
    event.venue?.name ||
    `${fallbackLocation}, Philippines`,
  createdBy: 'lia-tan',
  source: 'live',
  image:
    event.image ||
    event.imageUrl ||
    event.logo?.url ||
    createPosterDataUri({
      title: event.name || event.title || 'Imported Event',
      location:
        event.location ||
        event.venue?.name ||
        event.address ||
        `${fallbackLocation}, Philippines`,
      category: event.category || event.segment || 'Community',
    }),
  imageLabel: 'Imported event artwork',
})

export const loadEventsByLocation = async (location) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/events?location=${encodeURIComponent(location)}`,
    )

    if (!response.ok) {
      throw new Error('Failed to load live events')
    }

    const payload = await response.json()

    if (!Array.isArray(payload.events) || payload.events.length === 0) {
      throw new Error('Empty event payload')
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
