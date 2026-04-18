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

const mergeEvents = (...eventGroups) => {
  const merged = new Map()

  eventGroups.flat().forEach((event) => {
    merged.set(event.id, event)
  })

  return [...merged.values()]
}

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [selectedLocation, setSelectedLocation] = useState('Metro Manila')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Events')
  const [selectedDateFilter, setSelectedDateFilter] = useState('Any time')
  const [remoteEvents, setRemoteEvents] = useState(seedEvents)
  const [createdEvents, setCreatedEvents] = useState([])
  const [interactions, setInteractions] = useState(initialInteractions)
  const [activeProfileTab, setActiveProfileTab] = useState('Created Events')
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [feedMode, setFeedMode] = useState('mock')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    let isActive = true

    const syncEvents = async () => {
      setIsLoadingEvents(true)
      const { events, mode } = await loadEventsByLocation(selectedLocation)

      if (!isActive) {
        return
      }

      setRemoteEvents(events)
      setFeedMode(mode)
      setIsLoadingEvents(false)
    }

    syncEvents()

    return () => {
      isActive = false
    }
  }, [selectedLocation])

  const navigate = (nextPath) => {
    if (nextPath === pathname) {
      return
    }

    window.history.pushState({}, '', nextPath)
    startTransition(() => {
      setPathname(nextPath)
    })
  }

  const route = resolveRoute(pathname)
  const allEvents = mergeEvents(createdEvents, remoteEvents)
  const normalizedSearch = deferredSearchTerm.trim().toLowerCase()

  const filteredEvents = allEvents.filter((event) => {
    const locationMatches =
      selectedLocation === 'All Luzon' || event.province === selectedLocation
    const categoryMatches =
      selectedCategory === 'All Events' || event.category === selectedCategory
    const dateMatches = matchesDateFilter(event.startDate, selectedDateFilter)

    if (!normalizedSearch) {
      return locationMatches && categoryMatches && dateMatches
    }

    const searchableText = [
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
      locationMatches &&
      categoryMatches &&
      dateMatches &&
      searchableText.includes(normalizedSearch)
    )
  })

  const featuredEvent =
    filteredEvents.find((event) => event.isFeatured) || filteredEvents[0] || allEvents[0]
  const currentEvent = allEvents.find((event) => event.id === route.params?.eventId)
  const activeProfile =
    featuredUsers.find((user) => user.username === route.params?.username) ||
    featuredUsers[0]

  const createdByProfile = allEvents.filter(
    (event) => event.createdBy === activeProfile.username,
  )
  const savedByUser = allEvents.filter((event) =>
    interactions.saved.includes(event.id),
  )
  const relatedEvents = currentEvent
    ? allEvents.filter(
        (event) =>
          event.id !== currentEvent.id &&
          (event.category === currentEvent.category ||
            event.province === currentEvent.province),
      )
    : []

  const toggleInteraction = (key, eventId) => {
    setInteractions((currentState) => {
      const hasEvent = currentState[key].includes(eventId)

      return {
        ...currentState,
        [key]: hasEvent
          ? currentState[key].filter((id) => id !== eventId)
          : [...currentState[key], eventId],
      }
    })
  }

  const handleCreateEvent = (formData) => {
    const eventId = `${slugify(formData.title)}-${Date.now()}`

    const newEvent = {
      id: eventId,
      title: formData.title,
      category: formData.category,
      startDate: formData.date,
      timeLabel: formData.time,
      location: `${formData.venue}, ${formData.location}`,
      province: formData.location,
      host: 'Eventcinity Community',
      description: formData.description,
      attendeeCount: 1,
      savedCount: 1,
      reactions: 1,
      createdBy: featuredUsers[0].username,
      attendees: [featuredUsers[0].name, 'You'],
      mapLabel: `${formData.venue}, ${formData.location}`,
      source: 'community',
      image: createPosterDataUri({
        title: formData.title,
        location: `${formData.venue}, ${formData.location}`,
        category: formData.category,
      }),
      imageLabel: 'Community-created event artwork',
    }

    setCreatedEvents((currentEvents) => [newEvent, ...currentEvents])
    setSelectedLocation(formData.location)
    setInteractions((currentState) => ({
      hearted: [...new Set([...currentState.hearted, eventId])],
      saved: [...new Set([...currentState.saved, eventId])],
      attending: [...new Set([...currentState.attending, eventId])],
    }))

    navigate(routes.eventDetail(eventId))
  }

  const navProps = {
    currentPath: pathname === '/' ? routes.events : pathname,
    onNavigate: navigate,
    searchTerm,
    onSearchChange: setSearchTerm,
    locations: luzonLocations,
    selectedLocation,
    onLocationChange: setSelectedLocation,
  }

  const sharedPageProps = {
    interactions,
    onToggleHeart: (eventId) => toggleInteraction('hearted', eventId),
    onToggleSave: (eventId) => toggleInteraction('saved', eventId),
    onToggleAttend: (eventId) => toggleInteraction('attending', eventId),
    onOpenEvent: (eventId) => navigate(routes.eventDetail(eventId)),
  }

  let page

  if (route.key === 'create-event') {
    page = (
      <CreateEventPage
        categories={categoryOptions.filter((item) => item !== 'All Events')}
        locations={luzonLocations.filter((item) => item !== 'All Luzon')}
        onCreateEvent={handleCreateEvent}
      />
    )
  } else if (route.key === 'event-detail' && currentEvent) {
    page = (
      <EventDetailPage
        event={currentEvent}
        relatedEvents={relatedEvents.slice(0, 3)}
        onNavigate={navigate}
        {...sharedPageProps}
      />
    )
  } else if (route.key === 'people') {
    page = (
      <PeoplePage
        people={featuredUsers}
        onOpenProfile={(username) => navigate(routes.profile(username))}
      />
    )
  } else if (route.key === 'profile') {
    page = (
      <ProfilePage
        user={activeProfile}
        createdEvents={createdByProfile}
        savedEvents={savedByUser}
        activeTab={activeProfileTab}
        onTabChange={setActiveProfileTab}
        {...sharedPageProps}
      />
    )
  } else if (route.key === 'signin') {
    page = <SignInPage onContinue={() => navigate(routes.events)} />
  } else {
    page = (
      <EventDiscoveryPage
        featuredEvent={featuredEvent}
        events={filteredEvents}
        categoryOptions={categoryOptions}
        dateFilterOptions={dateFilterOptions}
        selectedCategory={selectedCategory}
        selectedDateFilter={selectedDateFilter}
        onCategoryChange={setSelectedCategory}
        onDateFilterChange={setSelectedDateFilter}
        selectedLocation={selectedLocation}
        isLoadingEvents={isLoadingEvents}
        feedMode={feedMode}
        totalEvents={allEvents.length}
        onNavigate={navigate}
        {...sharedPageProps}
      />
    )
  }

  return <MainLayout navProps={navProps}>{page}</MainLayout>
}

export default App
