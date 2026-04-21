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

  const isoMatch = rawValue.match(/(\d{4})-(\d{2})-(\d{2})/)

  if (isoMatch) {
    const [, year, month, day] = isoMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const sanitizedValue = rawValue.replace(/(\d+)(st|nd|rd|th)/gi, '$1')
  const parsedValue = new Date(sanitizedValue)

  return Number.isNaN(parsedValue.getTime()) ? null : parsedValue
}

export const getEventDateRange = (event) => {
  const startDate = parseEventDate(event?.startDate)
  const rawEndDate =
    event?.endDate ||
    event?.endTime ||
    event?.end_time ||
    event?.endLocal ||
    event?.end_local
  const parsedEndDate = parseEventDate(rawEndDate)

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

export const getOptimizedImageUrl = (imageUrl, width = 1600) => {
  if (!imageUrl) {
    return ''
  }

  try {
    const url = new URL(imageUrl)

    if (url.hostname.includes('images.unsplash.com')) {
      url.searchParams.set('auto', 'format')
      url.searchParams.set('fit', 'max')
      url.searchParams.set('fm', 'jpg')
      url.searchParams.set('q', '90')
      url.searchParams.set('w', String(width))
      return url.toString()
    }

    return imageUrl
  } catch {
    return imageUrl
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
