const palette = {
  background: '#FCFCFC',
  accent: '#2D3B15',
  neutral: '#C0C0C1',
  muted: '#696258',
  text: '#020202',
}

export const formatEventDate = (dateValue) =>
  new Intl.DateTimeFormat('en-PH', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(dateValue))

export const formatEventMonth = (dateValue) =>
  new Intl.DateTimeFormat('en-PH', {
    month: 'short',
  }).format(new Date(dateValue))

export const formatEventDay = (dateValue) =>
  new Intl.DateTimeFormat('en-PH', {
    day: '2-digit',
  }).format(new Date(dateValue))

export const matchesDateFilter = (dateValue, filter) => {
  if (filter === 'Any time') {
    return true
  }

  const today = new Date()
  const eventDate = new Date(dateValue)
  const differenceInDays = Math.ceil(
    (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )

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
    return differenceInDays >= 0 && differenceInDays <= 7 && (eventDay === 0 || eventDay === 6)
  }

  return true
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
