import { API_BASE_URL } from './apiBase.js'
import { buildGoogleMapsSearchUrl, createPosterDataUri } from '../utils/formatters.js'

const getFallbackLocationLabel = (fallbackLocation) =>
  fallbackLocation === 'All Philippines'
    ? 'Philippines'
    : `${fallbackLocation}, Philippines`

const normalizeExternalUrl = (value) =>
  value.startsWith('//') ? `https:${value}` : value

const invalidEventImagePatterns = [
  /googleapis\.com\/maps/i,
  /maps\.google/i,
  /staticmap/i,
  /maps\.gstatic/i,
  /gstatic\.com\/map/i,
  /streetview/i,
  /encrypted-tbn/i,
  /placehold/i,
]

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

const collectImageCandidates = (value) => {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectImageCandidates(item))
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim()
    return normalizedValue ? [normalizeExternalUrl(normalizedValue)] : []
  }

  if (typeof value === 'object') {
    return [
      value.url,
      value.src,
      value.image,
      value.imageUrl,
      value.thumbnail,
      value.thumbnail_url,
      value.original,
      value.original?.url,
      value.large,
      value.large?.url,
      value.full,
      value.full?.url,
      value.logo,
      value.poster,
      value.poster?.url,
    ].flatMap((item) => collectImageCandidates(item))
  }

  return []
}

const isUsableEventImage = (imageUrl) =>
  Boolean(imageUrl) && !invalidEventImagePatterns.some((pattern) => pattern.test(imageUrl))

const pickImageUrl = (...values) => {
  const candidates = Array.from(new Set(values.flatMap((value) => collectImageCandidates(value))))

  return candidates.find((candidate) => isUsableEventImage(candidate)) || ''
}

const joinUniqueText = (...values) => {
  const uniqueValues = []
  const seen = new Set()

  values.forEach((value) => {
    const normalizedValue = typeof value === 'string' ? value.trim() : ''

    if (!normalizedValue) {
      return
    }

    const key = normalizedValue.toLowerCase()

    if (seen.has(key)) {
      return
    }

    seen.add(key)
    uniqueValues.push(normalizedValue)
  })

  return uniqueValues.join(', ')
}

const normalizeRemoteEvent = (event, fallbackLocation) => {
  const title = event.name || event.title || 'Untitled Event'
  const category = event.category || event.segment || 'Community'
  const venueLabel = pickText(
    event.venue,
    event.venue?.name,
    event.rawPayload?.venue?.name,
    event.rawPayload?.venue,
  )
  const addressLabel = pickText(
    event.address,
    event.rawPayload?.address,
    event.venue?.address,
    event.formatted_address,
  )
  const locationLabel =
    pickText(
      event.location,
      addressLabel,
      venueLabel,
      event.rawPayload?.location,
      event.rawPayload?.venue?.name,
    ) || getFallbackLocationLabel(fallbackLocation)
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
  const fallbackImage = createPosterDataUri({
    title,
    location: locationLabel,
    category,
  })
  const mapLabel =
    joinUniqueText(venueLabel, addressLabel, locationLabel) || getFallbackLocationLabel(fallbackLocation)
  const imageUrl =
    pickImageUrl(
      event.image,
      event.imageUrl,
      event.rawPayload?.image,
      event.rawPayload?.images,
      event.rawPayload?.thumbnail,
      event.rawPayload?.thumbnail_url,
      event.logo,
      event.media,
    ) || fallbackImage

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
    location: locationLabel,
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
    mapLabel,
    mapUrl: buildGoogleMapsSearchUrl(mapLabel),
    createdBy: 'lia-tan',
    source: event.source || 'live',
    image: imageUrl,
    fallbackImage,
    imageLabel: `${title} event artwork`,
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
