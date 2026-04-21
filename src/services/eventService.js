import { API_BASE_URL } from './apiBase.js'
import { createPosterDataUri } from '../utils/formatters.js'

const getFallbackLocationLabel = (fallbackLocation) =>
  fallbackLocation === 'All Philippines'
    ? 'Philippines'
    : `${fallbackLocation}, Philippines`

const pickValue = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return ''
}

const pickText = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) {
      const arrayText = value
        .map((item) => pickText(item))
        .filter(Boolean)
        .join(', ')
        .trim()

      if (arrayText) {
        return arrayText
      }
    }

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }

    if (value && typeof value === 'object') {
      const nestedText = pickText(
        value.rawPayload,
        value.start,
        value.end,
        value.local,
        value.utc,
        value.datetime,
        value.date,
        value.when,
        value.range,
        value.start_date,
        value.end_date,
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

const normalizeRemoteEvent = (event, fallbackLocation) => {
  const title = event.name || event.title || 'Untitled Event'
  const category = event.category || event.segment || 'Community'
  const startDate = pickValue(
    event.startDate,
    event.start_time,
    event.start,
    event.rawPayload?.date?.start_date,
    event.rawPayload?.date?.start,
    event.date?.start_date,
    event.date?.start,
    event.date?.local,
    event.when?.start_date,
    event.when?.start,
    event.schedule?.start,
    event.event_dates?.start,
    event.date,
    '',
  )
  const endDate = pickValue(
    event.endDate,
    event.end_time,
    event.end,
    event.end_local,
    event.endLocal,
    event.rawPayload?.date?.end_date,
    event.rawPayload?.date?.end,
    event.date?.end_date,
    event.date?.end,
    event.when?.end_date,
    event.when?.end,
    event.schedule?.end,
    event.event_dates?.end,
    '',
  )
  const rawDate = pickText(
    event.rawDate,
    event.dateText,
    event.date_range,
    event.rawPayload?.date?.when,
    event.rawPayload?.date?.text,
    event.rawPayload?.date,
    event.event_dates?.text,
    event.event_dates,
    event.when,
    event.schedule,
    event.date,
    event.date_label,
  )

  return {
    id:
      event.eventId ||
      event.id ||
      event._id ||
      `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title,
    category,
    startDate: startDate || '2026-05-01',
    endDate,
    rawDate,
    timeLabel:
      pickText(
        event.timeLabel,
        event.time,
        event.start_time,
        event.rawPayload?.date?.when,
        event.when?.text,
        event.schedule?.text,
        event.schedule,
      ) || 'Time to be announced',
    location:
      pickText(
        event.location,
        event.address,
        event.rawPayload?.address,
        event.venue,
        event.venue?.name,
        event.rawPayload?.venue?.name,
        event.venue?.address,
        event.formatted_address,
      ) || getFallbackLocationLabel(fallbackLocation),
    province: event.province || (fallbackLocation === 'All Philippines' ? '' : fallbackLocation),
    host: pickText(event.host, event.organizer, event.organizer_name) || 'Eventcinity Partner',
    description:
      pickText(
        event.description,
        event.rawPayload?.description,
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
        event.rawPayload?.address,
        event.venue,
        event.venue?.name,
        event.rawPayload?.venue?.name,
        event.venue?.address,
      ) || getFallbackLocationLabel(fallbackLocation),
    createdBy: 'lia-tan',
    source: event.source || 'live',
    image:
      event.image ||
      event.imageUrl ||
      event.rawPayload?.image ||
      event.rawPayload?.thumbnail ||
      event.logo?.url ||
      createPosterDataUri({
        title,
        location:
          pickText(
            event.location,
            event.rawPayload?.venue?.name,
            event.venue?.name,
            event.address,
            event.rawPayload?.address,
          ) ||
          getFallbackLocationLabel(fallbackLocation),
        category,
      }),
    imageLabel: 'Imported event artwork',
  }
}

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
