import { seedEvents } from '../data/mockData.js'
import { API_BASE_URL } from './apiBase.js'
import { createPosterDataUri } from '../utils/formatters.js'

const normalizeRemoteEvent = (event, fallbackLocation) => ({
  id:
    event.eventId ||
    event.id ||
    event._id ||
    `${(event.name || event.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  title: event.name || event.title || 'Untitled Event',
  category: event.category || event.segment || 'Community',
  startDate: event.startDate || event.start_time || event.date || '2026-05-01',
  timeLabel: event.timeLabel || event.time || event.start_time || 'Time to be announced',
  location:
    event.location ||
    event.address ||
    event.venue ||
    event.venue?.name ||
    `${fallbackLocation}, Philippines`,
  province: event.province || fallbackLocation,
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
    event.address ||
    event.venue ||
    event.venue?.name ||
    `${fallbackLocation}, Philippines`,
  createdBy: 'lia-tan',
  source: event.source || 'live',
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

    const events = Array.isArray(payload.events)
      ? payload.events
      : Array.isArray(payload.data)
        ? payload.data
        : []

    if (events.length === 0) {
      throw new Error('Empty event payload')
    }

    return {
      events: events.map((event) => normalizeRemoteEvent(event, location)),
      mode: 'live',
    }
  } catch (error) {
    console.warn('Falling back to mock events:', error)
    return {
      events:
        location === 'All Luzon'
          ? seedEvents
          : seedEvents.filter((event) => event.province === location),
      mode: 'mock',
    }
  }
}
