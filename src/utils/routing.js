export const routes = {
  events: '/events',
  eventsByDate: (dateKey) => `/events/date/${dateKey}`,
  createEvent: '/events/create',
  eventDetail: (eventId) => `/events/${eventId}`,
  people: '/people',
  profile: (username) => `/profile/${username}`,
  signin: '/signin',
  eventPlanning: '/event-planning',
  communityHosts: '/community-hosts',
  locationGuides: '/location-guides',
  helpCenter: '/help-center',
  contactSupport: '/contact-support',
  aboutProgrammers: '/about-the-programmers',
}

export const normalizeRoutePath = (pathname) => {
  if (!pathname) {
    return '/'
  }

  const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '') || '/'

  if (cleanPath === '/event') {
    return routes.events
  }

  if (cleanPath.startsWith('/event/')) {
    return `/events/${cleanPath.slice('/event/'.length)}`
  }

  return cleanPath
}

export const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const resolveRoute = (pathname) => {
  const cleanPath = normalizeRoutePath(pathname === '/' ? '/events' : pathname || '/events')
  const parts = cleanPath.split('/').filter(Boolean)

  if (cleanPath === '/events') {
    return { key: 'events', params: {} }
  }

  if (cleanPath === '/events/create') {
    return { key: 'create-event', params: {} }
  }

  if (parts[0] === 'events' && parts[1] === 'date' && parts[2]) {
    return { key: 'events-date', params: { dateKey: parts[2] } }
  }

  if (parts[0] === 'events' && parts[1]) {
    return { key: 'event-detail', params: { eventId: parts[1] } }
  }

  if (parts[0] === 'profile' && parts[1]) {
    return { key: 'profile', params: { username: parts[1] } }
  }

  if (cleanPath === '/people') {
    return { key: 'people', params: {} }
  }

  if (cleanPath === '/signin') {
    return { key: 'signin', params: {} }
  }

  if (cleanPath === '/event-planning') {
    return { key: 'event-planning', params: {} }
  }

  if (cleanPath === '/community-hosts') {
    return { key: 'community-hosts', params: {} }
  }

  if (cleanPath === '/location-guides') {
    return { key: 'location-guides', params: {} }
  }

  if (cleanPath === '/help-center') {
    return { key: 'help-center', params: {} }
  }

  if (cleanPath === '/contact-support') {
    return { key: 'contact-support', params: {} }
  }

  if (cleanPath === '/about-the-programmers') {
    return { key: 'about-programmers', params: {} }
  }

  return { key: 'events', params: {} }
}
