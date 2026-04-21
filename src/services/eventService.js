import { API_BASE_URL } from './apiBase.js'
import { createPosterDataUri } from '../utils/formatters.js'

const getFallbackLocationLabel = (fallbackLocation) =>
  fallbackLocation === 'All Philippines'
    ? 'Philippines'
    : `${fallbackLocation}, Philippines`

const pickText = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }

    if (value && typeof value === 'object') {
      const nestedText = pickText(
        value.text,
        value.label,
        value.name,
        value.title,
        value.description,
        value.snippet,
        value.display,
        value.formatted,
        value.formatted_address,
        value.address,
        value.value,
      )

      if (nestedText) {
        return nestedText
      }
    }
  }

  return ''
}

const normalizeRemoteEvent = (event, fallbackLocation) => ({
  id:
    event.eventId ||
    event.id ||
    event._id ||
    `${(event.name || event.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  title: event.name || event.title || 'Untitled Event',
  category: event.category || event.segment || 'Community',
  startDate: event.startDate || event.start_time || event.date || '2026-05-01',
  endDate:
    event.endDate ||
    event.end_time ||
    event.end ||
    event.end_local ||
    event.endLocal ||
    '',
  rawDate:
    pickText(
      event.rawDate,
      event.date,
      event.dateText,
      event.when,
      event.schedule,
      event.date_range,
      event.event_dates,
    ) || '',
  timeLabel:
    pickText(event.timeLabel, event.time, event.start_time, event.when, event.schedule) ||
    'Time to be announced',
  location:
    pickText(
      event.location,
      event.address,
      event.venue,
      event.venue?.name,
      event.venue?.address,
      event.formatted_address,
    ) || getFallbackLocationLabel(fallbackLocation),
  province: event.province || (fallbackLocation === 'All Philippines' ? '' : fallbackLocation),
  host: pickText(event.host, event.organizer, event.organizer_name) || 'Eventcinity Partner',
  description:
    pickText(
      event.description,
      event.summary,
      event.snippet,
      event.details,
      event.about,
    ) ||
    'Imported from a live events source. This mapping can be swapped for Eventbrite payloads later without changing the JSX UI.',
  attendeeCount: event.attendeeCount || event.going_count || 0,
  savedCount: event.savedCount || 0,
  reactions: event.reactions || 0,
  attendees: [],
  mapLabel:
    pickText(
      event.mapLabel,
      event.location,
      event.address,
      event.venue,
      event.venue?.name,
      event.venue?.address,
    ) || getFallbackLocationLabel(fallbackLocation),
  createdBy: 'lia-tan',
  source: event.source || 'live',
  image:
    event.image ||
    event.imageUrl ||
    event.logo?.url ||
    createPosterDataUri({
      title: event.name || event.title || 'Imported Event',
      location:
        pickText(event.location, event.venue?.name, event.address) ||
        getFallbackLocationLabel(fallbackLocation),
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

    if (!Array.isArray(events)) {
      throw new Error('Malformed event payload')
    }

    return {
      events: events.map((event) => normalizeRemoteEvent(event, location)),
      mode: 'live',
    }
  } catch (error) {
    console.warn('Falling back to mock events:', error)
    return {
      events: [],
      mode: 'mock',
    }
  }
}
