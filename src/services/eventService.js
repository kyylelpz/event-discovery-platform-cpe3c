import { API_BASE_URL } from './apiBase.js'
import { getAuthRequestHeaders } from './authService.js'
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

const getImageCandidateScore = (imageUrl) => {
  let score = 0
  const widthHints = Array.from(
    imageUrl.matchAll(/(?:[?&](?:w|width|sz|s)=|=w|=s)(\d{2,4})/gi),
  ).map((match) => Number(match[1]))

  if (widthHints.length > 0) {
    score += Math.max(...widthHints) / 400
  }

  if (/original|full|maxres|hero|banner/i.test(imageUrl)) {
    score += 5
  }

  if (/thumbnail|thumb|small|icon/i.test(imageUrl)) {
    score -= 5
  }

  try {
    const url = new URL(imageUrl)

    if (url.hostname.includes('images.unsplash.com')) {
      score += 6
    }

    if (url.hostname.includes('cloudinary.com')) {
      score += 5
    }

    if (/(googleusercontent\.com|ggpht\.com|googleapis\.com)$/i.test(url.hostname)) {
      score += 4
    }

    if (url.hostname.includes('encrypted-tbn') || url.hostname.includes('gstatic.com')) {
      score -= 4
    }
  } catch {
    return score
  }

  return score
}

const pickImageUrl = (...values) => {
  const candidates = Array.from(new Set(values.flatMap((value) => collectImageCandidates(value))))

  const usableCandidates = candidates.filter((candidate) => isUsableEventImage(candidate))

  if (usableCandidates.length > 0) {
    return usableCandidates.sort(
      (leftCandidate, rightCandidate) =>
        getImageCandidateScore(rightCandidate) - getImageCandidateScore(leftCandidate),
    )[0]
  }

  if (!candidates.length) {
    return ''
  }

  return candidates.sort(
    (leftCandidate, rightCandidate) =>
      getImageCandidateScore(rightCandidate) - getImageCandidateScore(leftCandidate),
  )[0]
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

export const normalizeEventRecord = (event, fallbackLocation) => {
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
      event.rawPayload?.image_url,
      event.rawPayload?.images,
      event.rawPayload?.photos,
      event.rawPayload?.thumbnail,
      event.rawPayload?.thumbnail_url,
      event.rawPayload?.original,
      event.rawPayload?.large,
      event.rawPayload?.full,
      event.logo,
      event.media,
    ) || fallbackImage
  const eventUrl = pickText(
    event.eventUrl,
    event.url,
    event.link,
    event.rawPayload?.link,
    event.rawPayload?.event_link,
    event.rawPayload?.url,
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
    location: locationLabel,
    province:
      pickText(event.province) ||
      (fallbackLocation === 'All Philippines' ? '' : fallbackLocation),
    host:
      pickText(
        event.host,
        event.organizer,
        event.organizer_name,
        event.creatorName,
      ) || 'Eventcinity Partner',
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
    eventUrl,
    createdBy: pickText(event.createdBy, event.creatorUsername, event.username),
    source: event.source || 'live',
    image: imageUrl,
    fallbackImage,
    imageLabel: `${title} event artwork`,
  }
}

const normalizeEventPayload = (payload, fallbackLocation) => {
  const events = Array.isArray(payload.events)
    ? payload.events
    : Array.isArray(payload.data)
      ? payload.data
      : []

  if (!Array.isArray(events)) {
    throw new Error('Malformed event payload')
  }

  return events.map((event) => normalizeEventRecord(event, fallbackLocation))
}

const requestEventCollection = async (path, fallbackLocation, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.requiresAuth ? getAuthRequestHeaders() : {}),
      ...(options.headers || {}),
    },
    ...options,
  })
  const payload = await readResponseData(response)

  if (!response.ok) {
    const error = new Error(payload.message || 'Failed to load live events')
    error.status = response.status
    throw error
  }

  return normalizeEventPayload(payload, fallbackLocation)
}

export const loadEventsByLocation = async (location) => {
  try {
    return {
      events: await requestEventCollection(
        `/api/events?location=${encodeURIComponent(location)}`,
        location,
      ),
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

export const fetchCreatedEventsByCurrentUser = async () =>
  requestEventCollection('/api/events/created/me', 'All Philippines', {
    requiresAuth: true,
  })

export const fetchCreatedEventsByUsername = async (username) =>
  requestEventCollection(
    `/api/events/created/by/${encodeURIComponent(username)}`,
    'All Philippines',
  )
