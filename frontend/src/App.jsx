import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import './App.css'

import {
  categoryOptions,
  dateFilterOptions,
  featuredUsers,
  initialInteractions,
  luzonLocations,
  seedEvents,
} from './data/mockData.js'

import MainLayout from './layouts/MainLayout.jsx'
import SignInPage from './pages/auth/SignInPage.jsx'
import CreateEventPage from './pages/events/CreateEventPage.jsx'
import EventDetailPage from './pages/events/EventDetailPage.jsx'
import EventDiscoveryPage from './pages/events/EventDiscoveryPage.jsx'
import PeoplePage from './pages/people/PeoplePage.jsx'
import ProfilePage from './pages/profile/ProfilePage.jsx'

import { loadEventsByLocation } from './services/eventService.js'
import { createPosterDataUri, matchesDateFilter } from './utils/formatters.js'
import { resolveRoute, routes, slugify } from './utils/routing.js'

// quick helper to dedupe events by id when merging local + remote
const mergeEvents = (...batches) => {
  const map = new Map()
  batches.flat().forEach((e) => map.set(e.id, e))
  return [...map.values()]
}

function App() {
  // routing
  const [pathname, setPathname] = useState(() => window.location.pathname)

  // filters
  const [location, setLocation] = useState('Metro Manila')
  const [category, setCategory] = useState('All Events')
  const [dateFilter, setDateFilter] = useState('Any time')
  const [search, setSearch] = useState('')

  // data
  const [remoteEvents, setRemoteEvents] = useState(seedEvents)
  const [createdEvents, setCreatedEvents] = useState([])
  const [interactions, setInteractions] = useState(initialInteractions)
  const [profileTab, setProfileTab] = useState('Created Events')

  // loading
  const [isLoading, setIsLoading] = useState(false)
  const [feedMode, setFeedMode] = useState('mock')

  const deferredSearch = useDeferredValue(search)

  // sync with browser back/forward
  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // fetch events when location changes
  useEffect(() => {
    let cancelled = false

    const fetchEvents = async () => {
      setIsLoading(true)
      const { events, mode } = await loadEventsByLocation(location)
      if (cancelled) return
      setRemoteEvents(events)
      setFeedMode(mode)
      setIsLoading(false)
    }

    fetchEvents()

    return () => {
      cancelled = true
    }
  }, [location])

  const goTo = (path) => {
    if (path === pathname) return
    window.history.pushState({}, '', path)
    startTransition(() => setPathname(path))
  }

  const route = resolveRoute(pathname)
  const allEvents = mergeEvents(createdEvents, remoteEvents)
  const query = deferredSearch.trim().toLowerCase()

  const events = allEvents.filter((event) => {
    const matchLocation =
      location === 'All Luzon' || event.province === location
    const matchCategory =
      category === 'All Events' || event.category === category
    const matchDate = matchesDateFilter(event.startDate, dateFilter)

    if (!query) return matchLocation && matchCategory && matchDate

    const text = [
      event.title,
      event.location,
      event.province,
      event.host,
      event.category,
      event.description,
    ]
      .join(' ')
      .toLowerCase()

    return (
      matchLocation && matchCategory && matchDate && text.includes(query)
    )
  })

  const featured = events.find((e) => e.isFeatured) || events[0] || allEvents[0]
  const activeEvent = allEvents.find((e) => e.id === route.params?.eventId)

  const activeUser =
    featuredUsers.find((u) => u.username === route.params?.username) ||
    featuredUsers[0]

  const userCreated = allEvents.filter(
    (e) => e.createdBy === activeUser.username,
  )
  const userSaved = allEvents.filter((e) => interactions.saved.includes(e.id))

  const related = activeEvent
    ? allEvents.filter(
        (e) =>
          e.id !== activeEvent.id &&
          (e.category === activeEvent.category ||
            e.province === activeEvent.province),
      )
    : []

  const toggle = (type, eventId) => {
    setInteractions((prev) => {
      const has = prev[type].includes(eventId)
      return {
        ...prev,
        [type]: has
          ? prev[type].filter((id) => id !== eventId)
          : [...prev[type], eventId],
      }
    })
  }

  const publishEvent = (data) => {
    const id = `${slugify(data.title)}-${Date.now()}`

    const newEvent = {
      id,
      title: data.title,
      category: data.category,
      startDate: data.date,
      timeLabel: data.time,
      location: `${data.venue}, ${data.location}`,
      province: data.location,
      host: 'Eventcinity Community',
      description: data.description,
      attendeeCount: 1,
      savedCount: 1,
      reactions: 1,
      createdBy: featuredUsers[0].username,
      attendees: [featuredUsers[0].name, 'You'],
      mapLabel: `${data.venue}, ${data.location}`,
      source: 'community',
      image: createPosterDataUri({
        title: data.title,
        location: `${data.venue}, ${data.location}`,
        category: data.category,
      }),
      imageLabel: 'Community-created event artwork',
    }

    setCreatedEvents((prev) => [newEvent, ...prev])
    setLocation(data.location)

    setInteractions((prev) => ({
      hearted: [...new Set([...prev.hearted, id])],
      saved: [...new Set([...prev.saved, id])],
      attending: [...new Set([...prev.attending, id])],
    }))

    goTo(routes.eventDetail(id))
  }

  // --- render helpers ---

  const navProps = {
    currentPath: pathname === '/' ? routes.events : pathname,
    onNavigate: goTo,
    searchTerm: search,
    onSearchChange: setSearch,
    locations: luzonLocations,
    selectedLocation: location,
    onLocationChange: setLocation,
  }

  const sharedProps = {
    interactions,
    onToggleHeart: (id) => toggle('hearted', id),
    onToggleSave: (id) => toggle('saved', id),
    onToggleAttend: (id) => toggle('attending', id),
    onOpenEvent: (id) => goTo(routes.eventDetail(id)),
  }

  let content

  switch (route.key) {
    case 'create-event':
      content = (
        <CreateEventPage
          categories={categoryOptions.filter((c) => c !== 'All Events')}
          locations={luzonLocations.filter((l) => l !== 'All Luzon')}
          onCreateEvent={publishEvent}
        />
      )
      break

    case 'event-detail':
      content = activeEvent ? (
        <EventDetailPage
          event={activeEvent}
          relatedEvents={related.slice(0, 3)}
          onNavigate={goTo}
          {...sharedProps}
        />
      ) : null
      break

    case 'people':
      content = (
        <PeoplePage
          people={featuredUsers}
          onOpenProfile={(u) => goTo(routes.profile(u))}
        />
      )
      break

    case 'profile':
      content = (
        <ProfilePage
          user={activeUser}
          createdEvents={userCreated}
          savedEvents={userSaved}
          activeTab={profileTab}
          onTabChange={setProfileTab}
          {...sharedProps}
        />
      )
      break

    case 'signin':
      content = <SignInPage onContinue={() => goTo(routes.events)} />
      break

    default:
      content = (
        <EventDiscoveryPage
          featuredEvent={featured}
          events={events}
          categoryOptions={categoryOptions}
          dateFilterOptions={dateFilterOptions}
          selectedCategory={category}
          selectedDateFilter={dateFilter}
          onCategoryChange={setCategory}
          onDateFilterChange={setDateFilter}
          selectedLocation={location}
          isLoadingEvents={isLoading}
          feedMode={feedMode}
          totalEvents={allEvents.length}
          onNavigate={goTo}
          {...sharedProps}
        />
      )
  }

  return <MainLayout navProps={navProps}>{content}</MainLayout>
}

export default App
