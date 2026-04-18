export const routes = {
  events: '/events',
  createEvent: '/events/create',
  eventDetail: (eventId) => `/events/${eventId}`,
  people: '/people',
  profile: (username) => `/profile/${username}`,
  signin: '/signin',
}

export const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const resolveRoute = (pathname) => {
  const cleanPath = pathname === '/' ? '/events' : pathname.replace(/\/$/, '') || '/events'
  const parts = cleanPath.split('/').filter(Boolean)

  if (cleanPath === '/events') {
    return { key: 'events', params: {} }
  }

  if (cleanPath === '/events/create') {
    return { key: 'create-event', params: {} }
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

  return { key: 'events', params: {} }
}
