const palette = {
  background: '#FCFCFC',
  accent: '#2D3B15',
  neutral: '#C0C0C1',
  muted: '#696258',
  text: '#020202',
}

const eventDateFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
})

const eventDateHeadingFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const calendarMonthFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'long',
  year: 'numeric',
})

const eventMonthFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
})

const eventDayFormatter = new Intl.DateTimeFormat('en-PH', {
  day: '2-digit',
})

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const monthIndexMap = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
}

export const formatDateKey = (dateValue) => {
  const parsedDate = parseEventDate(dateValue)

  if (!parsedDate) {
    return ''
  }

  const year = parsedDate.getFullYear()
  const month = `${parsedDate.getMonth() + 1}`.padStart(2, '0')
  const day = `${parsedDate.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const parseEventDate = (dateValue) => {
  if (!dateValue) {
    return null
  }

  if (dateValue instanceof Date) {
    return Number.isNaN(dateValue.getTime()) ? null : dateValue
  }

  const rawValue = String(dateValue).trim()

  if (!rawValue) {
    return null
  }

  const monthDayMatch = rawValue.match(
    /^(?:[A-Za-z]{3,9},?\s+)?([A-Za-z]{3,9})\s+(\d{1,2})(?:,\s*(\d{4}))?(?:,\s*\d{1,2}:\d{2}(?::\d{2})?\s*[AP]M)?$/i,
  )

  if (monthDayMatch) {
    const [, monthText, dayText, yearText] = monthDayMatch
    const monthIndex = monthIndexMap[monthText.slice(0, 3).toLowerCase()]

    if (monthIndex !== undefined) {
      return new Date(
        Number(yearText || new Date().getFullYear()),
        monthIndex,
        Number(dayText),
      )
    }
  }

  const isoMatch = rawValue.match(/(\d{4})-(\d{2})-(\d{2})/)

  if (isoMatch) {
    const [, year, month, day] = isoMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const sanitizedValue = rawValue.replace(/(\d+)(st|nd|rd|th)/gi, '$1')
  const parsedValue = new Date(sanitizedValue)

  return Number.isNaN(parsedValue.getTime()) ? null : parsedValue
}

const parseLooseMonthDate = (value, fallbackYear = new Date().getFullYear()) => {
  if (!value) {
    return null
  }

  const match = String(value)
    .trim()
    .match(/(?:[A-Za-z]{3,9},?\s+)?([A-Za-z]{3,9})\s+(\d{1,2})(?:,\s*(\d{4}))?/i)

  if (!match) {
    return null
  }

  const [, monthText, dayText, explicitYear] = match
  const monthIndex = monthIndexMap[monthText.slice(0, 3).toLowerCase()]

  if (monthIndex === undefined) {
    return null
  }

  return new Date(Number(explicitYear || fallbackYear), monthIndex, Number(dayText))
}

const extractRangeDatesFromText = (textValue, fallbackYear) => {
  if (!textValue) {
    return { startDate: null, endDate: null }
  }

  const normalizedText = String(textValue)
    .replace(/[|]/g, ' ')
    .replace(/[–—]/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim()

  const rangeMatch = normalizedText.match(
    /([A-Za-z]{3,9},?\s+[A-Za-z]{3,9}\s+\d{1,2}(?:,\s*\d{4})?(?:,\s*\d{1,2}:\d{2}\s*[AP]M)?)\s*-\s*([A-Za-z]{3,9},?\s+[A-Za-z]{3,9}\s+\d{1,2}(?:,\s*\d{4})?(?:,\s*\d{1,2}:\d{2}\s*[AP]M)?)/i,
  )

  if (rangeMatch) {
    const startDate = parseEventDate(rangeMatch[1]) || parseLooseMonthDate(rangeMatch[1], fallbackYear)
    const endDate = parseEventDate(rangeMatch[2]) || parseLooseMonthDate(rangeMatch[2], fallbackYear)
    return { startDate, endDate }
  }

  const dateMatches = normalizedText.match(
    /([A-Za-z]{3,9},?\s+[A-Za-z]{3,9}\s+\d{1,2}(?:,\s*\d{4})?)/gi,
  )

  if (dateMatches?.length) {
    const parsedDates = dateMatches
      .map((item) => parseEventDate(item) || parseLooseMonthDate(item, fallbackYear))
      .filter(Boolean)

    if (parsedDates.length) {
      return {
        startDate: parsedDates[0],
        endDate: parsedDates[parsedDates.length - 1],
      }
    }
  }

  return { startDate: null, endDate: null }
}

const deriveRangeFromEventText = (event) => {
  const directStartDate = parseEventDate(event?.startDate)
  const fallbackYear = directStartDate?.getFullYear() || new Date().getFullYear()
  const candidateRanges = [
    extractRangeDatesFromText(event?.rawDate, fallbackYear),
    extractRangeDatesFromText(event?.timeLabel, fallbackYear),
    extractRangeDatesFromText(event?.dateText, fallbackYear),
  ]

  return candidateRanges.reduce(
    (bestRange, candidate) => {
      if (!candidate.startDate && !candidate.endDate) {
        return bestRange
      }

      if (!bestRange.startDate && !bestRange.endDate) {
        return candidate
      }

      const bestStart = bestRange.startDate || bestRange.endDate
      const bestEnd = bestRange.endDate || bestRange.startDate
      const candidateStart = candidate.startDate || candidate.endDate
      const candidateEnd = candidate.endDate || candidate.startDate

      if (!bestStart || !bestEnd) {
        return candidate
      }

      if (!candidateStart || !candidateEnd) {
        return bestRange
      }

      const bestDuration = bestEnd.getTime() - bestStart.getTime()
      const candidateDuration = candidateEnd.getTime() - candidateStart.getTime()

      if (candidateDuration > bestDuration) {
        return candidate
      }

      return bestRange
    }
    ,
    { startDate: null, endDate: null },
  )
}

export const getEventDateRange = (event) => {
  const directStartDate = parseEventDate(event?.startDate)
  const rawEndDate =
    event?.endDate ||
    event?.endTime ||
    event?.end_time ||
    event?.endLocal ||
    event?.end_local
  const directEndDate = parseEventDate(rawEndDate)
  const derivedRange = deriveRangeFromEventText(event)
  const startDate = derivedRange.startDate || directStartDate
  const parsedEndDate = directEndDate || derivedRange.endDate

  if (!startDate) {
    return { startDate: null, endDate: null }
  }

  if (!parsedEndDate) {
    return {
      startDate: startOfDay(startDate),
      endDate: startOfDay(startDate),
    }
  }

  const normalizedStartDate = startOfDay(startDate)
  const normalizedEndDate = startOfDay(parsedEndDate)

  return {
    startDate: normalizedStartDate,
    endDate:
      normalizedEndDate.getTime() >= normalizedStartDate.getTime()
        ? normalizedEndDate
        : normalizedStartDate,
  }
}

export const formatEventDate = (dateValue) => {
  const parsedDate = parseEventDate(dateValue)
  return parsedDate ? eventDateFormatter.format(parsedDate) : String(dateValue || 'Date to be announced')
}

export const formatEventSchedule = (event) => {
  if (!event) {
    return 'Date to be announced'
  }

  const rawDate = typeof event.rawDate === 'string' ? event.rawDate.trim() : ''
  const timeLabel = typeof event.timeLabel === 'string' ? event.timeLabel.trim() : ''

  if (rawDate) {
    return rawDate
  }

  if (
    timeLabel &&
    /(?:mon|tue|wed|thu|fri|sat|sun|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(
      timeLabel,
    )
  ) {
    return timeLabel
  }

  const startDate = parseEventDate(event.startDate)
  const endDate = parseEventDate(event.endDate)

  if (startDate && endDate && endDate.getTime() !== startDate.getTime()) {
    if (timeLabel) {
      return `${formatEventDate(startDate)} - ${formatEventDate(endDate)} | ${timeLabel}`
    }

    return `${formatEventDate(startDate)} - ${formatEventDate(endDate)}`
  }

  if (startDate && timeLabel) {
    return `${formatEventDate(startDate)} | ${timeLabel}`
  }

  if (startDate) {
    return formatEventDate(startDate)
  }

  if (timeLabel) {
    return timeLabel
  }

  return 'Date to be announced'
}

export const formatEventDateHeading = (dateValue) => {
  const parsedDate = parseEventDate(dateValue)
  return parsedDate ? eventDateHeadingFormatter.format(parsedDate) : 'Selected date'
}

export const formatCalendarMonth = (dateValue) => {
  const parsedDate = parseEventDate(dateValue)
  return parsedDate ? calendarMonthFormatter.format(parsedDate) : ''
}

export const formatEventMonth = (dateValue) => {
  const parsedDate = parseEventDate(dateValue)
  return parsedDate ? eventMonthFormatter.format(parsedDate) : '--'
}

export const formatEventDay = (dateValue) => {
  const parsedDate = parseEventDate(dateValue)
  return parsedDate ? eventDayFormatter.format(parsedDate) : '--'
}

export const matchesDateFilter = (dateValue, filter) => {
  if (filter === 'Any time') {
    return true
  }

  const parsedEventDate = parseEventDate(dateValue)

  if (!parsedEventDate) {
    return false
  }

  const today = startOfDay(new Date())
  const eventDate = startOfDay(parsedEventDate)
  const differenceInDays = Math.round(
    (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
  const weekendEnd = new Date(today)
  const daysUntilSunday = (7 - today.getDay()) % 7
  weekendEnd.setDate(today.getDate() + daysUntilSunday)

  if (filter === 'Next 7 days') {
    return differenceInDays >= 0 && differenceInDays <= 7
  }

  if (filter === 'This month') {
    return (
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    )
  }

  if (filter === 'This weekend') {
    const eventDay = eventDate.getDay()
    return eventDate >= today && eventDate <= weekendEnd && (eventDay === 0 || eventDay === 6)
  }

  return true
}

export const isSameCalendarDate = (leftValue, rightValue) => {
  const leftDate = parseEventDate(leftValue)
  const rightDate = parseEventDate(rightValue)

  if (!leftDate || !rightDate) {
    return false
  }

  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  )
}

export const eventOccursOnDate = (event, targetDateValue) => {
  const targetDate = parseEventDate(targetDateValue)
  const { startDate, endDate } = getEventDateRange(event)

  if (!targetDate || !startDate || !endDate) {
    return false
  }

  const normalizedTargetDate = startOfDay(targetDate)

  return (
    normalizedTargetDate.getTime() >= startDate.getTime() &&
    normalizedTargetDate.getTime() <= endDate.getTime()
  )
}

export const getEventDateKeys = (event) => {
  const { startDate, endDate } = getEventDateRange(event)

  if (!startDate || !endDate) {
    return []
  }

  const dateKeys = []
  const cursor = new Date(startDate)

  while (cursor.getTime() <= endDate.getTime()) {
    dateKeys.push(formatDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return dateKeys
}

const normalizeImageProtocol = (imageUrl) => {
  if (typeof imageUrl !== 'string') {
    return imageUrl
  }

  return imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl
}

const updateNumericSearchParams = (searchParams, keys, nextValue) => {
  let updated = false

  keys.forEach((key) => {
    if (searchParams.has(key)) {
      searchParams.set(key, String(nextValue))
      updated = true
    }
  })

  return updated
}

const optimizeCloudinaryImageUrl = (imageUrl, width) => {
  if (!imageUrl.includes('/image/upload/')) {
    return imageUrl
  }

  const [prefix, suffix] = imageUrl.split('/image/upload/')

  if (!suffix) {
    return imageUrl
  }

  const firstSegment = suffix.split('/')[0]
  const alreadyHasTransforms = firstSegment && !/^v\d+$/i.test(firstSegment)

  if (alreadyHasTransforms) {
    return imageUrl
  }

  return `${prefix}/image/upload/f_auto,q_auto:good,w_${width}/${suffix}`
}

const optimizeGoogleHostedImageUrl = (imageUrl, width) => {
  const targetHeight = Math.max(900, Math.round(width * 0.625))

  try {
    const url = new URL(imageUrl)
    const isGoogleHosted = /(googleusercontent\.com|ggpht\.com|googleapis\.com|gstatic\.com)$/i.test(
      url.hostname,
    )

    if (!isGoogleHosted) {
      return imageUrl
    }

    const updatedWidth = updateNumericSearchParams(url.searchParams, ['w', 'width', 'sz', 's'], width)
    const updatedHeight = updateNumericSearchParams(url.searchParams, ['h', 'height'], targetHeight)
    const updatedQuality = updateNumericSearchParams(url.searchParams, ['q', 'quality'], 90)

    if (updatedWidth || updatedHeight || updatedQuality) {
      return url.toString()
    }
  } catch {
    return imageUrl
  }

  if (/=([a-z0-9,_-]+)$/i.test(imageUrl)) {
    return imageUrl.replace(/=([a-z0-9,_-]+)$/i, `=w${width}-h${targetHeight}-p-k-no-nu`)
  }

  return imageUrl
}

const optimizeGenericImageUrl = (imageUrl, width) => {
  const targetHeight = Math.max(900, Math.round(width * 0.625))

  try {
    const url = new URL(imageUrl)
    const isKnownResizableHost =
      /(images\.ctfassets\.net|images\.prismic\.io|images\.contentstack\.io|cdn\.shopify\.com)$/i.test(
        url.hostname,
      )

    if (!isKnownResizableHost) {
      return imageUrl
    }

    let updated = false

    updated = updateNumericSearchParams(
      url.searchParams,
      ['w', 'width', 'maxwidth', 'imwidth'],
      width,
    ) || updated
    updated = updateNumericSearchParams(
      url.searchParams,
      ['h', 'height', 'maxheight'],
      targetHeight,
    ) || updated
    updated = updateNumericSearchParams(url.searchParams, ['q', 'quality'], 90) || updated

    return updated ? url.toString() : imageUrl
  } catch {
    return imageUrl
  }
}

export const getOptimizedImageUrl = (imageUrl, width = 1600) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return ''
  }

  const normalizedUrl = normalizeImageProtocol(imageUrl.trim())

  if (/^data:/i.test(normalizedUrl)) {
    return normalizedUrl
  }

  try {
    const url = new URL(normalizedUrl)

    if (url.hostname.includes('images.unsplash.com')) {
      url.searchParams.set('auto', 'format')
      url.searchParams.set('fit', 'max')
      url.searchParams.set('fm', 'jpg')
      url.searchParams.set('q', '90')
      url.searchParams.set('w', String(width))
      return url.toString()
    }
  } catch {
    return normalizedUrl
  }

  const cloudinaryUrl = optimizeCloudinaryImageUrl(normalizedUrl, width)
  const googleHostedUrl = optimizeGoogleHostedImageUrl(cloudinaryUrl, width)

  return optimizeGenericImageUrl(googleHostedUrl, width)
}

export const buildGoogleMapsSearchUrl = (query) => {
  const normalizedQuery = typeof query === 'string' ? query.trim() : ''

  if (!normalizedQuery) {
    return ''
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(normalizedQuery)}`
}

export const getResponsiveImageProps = (imageUrl, widths = [1600]) => {
  if (!imageUrl || typeof imageUrl !== 'string' || /^data:/i.test(String(imageUrl))) {
    return {
      src: getOptimizedImageUrl(imageUrl),
      srcSet: undefined,
    }
  }

  const sortedWidths = Array.from(
    new Set(widths.filter((value) => Number.isFinite(value) && value > 0)),
  ).sort((left, right) => left - right)

  if (!sortedWidths.length) {
    return {
      src: getOptimizedImageUrl(imageUrl),
      srcSet: undefined,
    }
  }

  return {
    src: getOptimizedImageUrl(imageUrl, sortedWidths[sortedWidths.length - 1]),
    srcSet: sortedWidths
      .map((currentWidth) => `${getOptimizedImageUrl(imageUrl, currentWidth)} ${currentWidth}w`)
      .join(', '),
  }
}

export const createPosterDataUri = ({ title, location, category }) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520" fill="none">
      <rect width="800" height="520" rx="40" fill="${palette.background}"/>
      <rect x="32" y="32" width="736" height="456" rx="28" fill="${palette.background}" stroke="${palette.neutral}" stroke-width="4"/>
      <rect x="64" y="64" width="148" height="32" rx="16" fill="${palette.accent}"/>
      <text x="138" y="85" font-family="Avenir, Avenir Next, sans-serif" font-size="16" font-weight="700" text-anchor="middle" fill="${palette.background}">
        ${category}
      </text>
      <text x="64" y="180" font-family="Avenir, Avenir Next, sans-serif" font-size="54" font-weight="800" fill="${palette.text}">
        ${title}
      </text>
      <text x="64" y="360" font-family="Avenir, Avenir Next, sans-serif" font-size="22" font-weight="500" fill="${palette.muted}">
        ${location}
      </text>
      <line x1="64" y1="404" x2="736" y2="404" stroke="${palette.neutral}" stroke-width="3"/>
      <text x="64" y="450" font-family="Avenir, Avenir Next, sans-serif" font-size="18" font-weight="500" fill="${palette.accent}">
        Eventcinity editorial preview
      </text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
