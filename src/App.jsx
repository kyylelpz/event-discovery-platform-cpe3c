import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  categoryOptions,
  dateFilterOptions,
  featuredUsers,
  initialInteractions,
  locationOptions,
} from './data/mockData.js'
import axios from 'axios'
import MainLayout from './layouts/MainLayout.jsx'
import SignInPage from './pages/auth/SignInPage.jsx'
import InterestsPage from './pages/auth/InterestsPage.jsx'
import AboutProgrammersPage from './pages/about/AboutProgrammersPage.jsx'
import CreateEventPage from './pages/events/CreateEventPage.jsx'
import EventDetailPage from './pages/events/EventDetailPage.jsx'
import EventDiscoveryPage from './pages/events/EventDiscoveryPage.jsx'
import PeoplePage from './pages/people/PeoplePage.jsx'
import ProfilePage from './pages/profile/ProfilePage.jsx'
import EventPlanningPage from './pages/info/EventPlanningPage.jsx'
import CommunityHostsPage from './pages/info/CommunityHostsPage.jsx'
import LocationGuidesPage from './pages/info/LocationGuidesPage.jsx'
import HelpCenterPage from './pages/info/HelpCenterPage.jsx'
import ContactSupportPage from './pages/info/ContactSupportPage.jsx'
import { API_BASE_URL } from './services/apiBase.js'
import { loadEventsByLocation } from './services/eventService.js'
import { getSession, saveInterests, signOut } from './services/authService.js'
import {
  buildGoogleMapsSearchUrl,
  createPosterDataUri,
  eventOccursOnDate,
  formatDateKey,
  getEventDateKeys,
  matchesDateFilter,
  parseEventDate,
} from './utils/formatters.js'
import { normalizeRoutePath, resolveRoute, routes } from './utils/routing.js'

const EVENTS_PER_PAGE = 15

const mergeEvents = (...eventGroups) => {
  const merged = new Map()
  eventGroups.flat().forEach((event) => merged.set(event.id, event))
  return [...merged.values()]
}

function App() {
  const [pathname, setPathname] = useState(() => normalizeRoutePath(window.location.pathname))
  const [currentUser, setCurrentUser] = useState(() => getSession())
  const [showInterests, setShowInterests] = useState(false)

  const [selectedLocation, setSelectedLocation] = useState('All Philippines')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Events')
  const [selectedDateFilter, setSelectedDateFilter] = useState('Any time')
  const [selectedSort, setSelectedSort] = useState('Nearest date')
  const [remoteEvents, setRemoteEvents] = useState([])
  const [createdEvents, setCreatedEvents] = useState([])
  const [interactions, setInteractions] = useState(initialInteractions)
  const [activeProfileTab, setActiveProfileTab] = useState('Created Events')
  const [currentEventsPage, setCurrentEventsPage] = useState(1)
  const [featuredEventId, setFeaturedEventId] = useState(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const previousRouteKeyRef = useRef(null)

  useEffect(() => {
    const syncPathname = () => {
      const normalizedPath = normalizeRoutePath(window.location.pathname)

      if (normalizedPath !== window.location.pathname) {
        window.history.replaceState(window.history.state, '', normalizedPath)
      }

      setPathname(normalizedPath)
    }

    syncPathname()
    const handlePopState = () => syncPathname()
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  useEffect(() => {
    let isActive = true
    const syncEvents = async () => {
      const { events } = await loadEventsByLocation(selectedLocation)
      if (!isActive) return
      setRemoteEvents(events)
    }
    syncEvents()
    return () => { isActive = false }
  }, [selectedLocation])

  const navigate = (nextPath) => {
    const normalizedPath = normalizeRoutePath(nextPath)

    if (!normalizedPath || normalizedPath === pathname) return

    window.history.pushState({}, '', normalizedPath)
    setPathname(normalizedPath)
  }

  const handleSearchChange = (value) => {
    setCurrentEventsPage(1)
    setSearchTerm(value)
  }

  const handleLocationChange = (value) => {
    setCurrentEventsPage(1)
    setSelectedLocation(value)
  }

  const handleCategoryChange = (value) => {
    setCurrentEventsPage(1)
    setSelectedCategory(value)
  }

  const handleDateFilterChange = (value) => {
    setCurrentEventsPage(1)
    setSelectedDateFilter(value)
  }

  const handleSortChange = (value) => {
    setCurrentEventsPage(1)
    setSelectedSort(value)
  }

  // Called after sign in or sign up
  const handleAuthSuccess = (session, type) => {
    setCurrentUser(session)
    if (type === 'new') {
      setShowInterests(true) // new user → show interests picker
    } else {
      navigate(routes.events) // returning user → go to homepage
    }
  }

  // Called after interests are picked
  const handleInterestsDone = (interests) => {
    if (currentUser) {
      saveInterests(currentUser.email, interests)
      setCurrentUser((prev) => ({ ...prev, interests }))
    }
    setShowInterests(false)
    navigate(routes.events)
  }

  const handleSignOut = () => {
    signOut()
    setCurrentUser(null)
    navigate(routes.events)
  }

  const route = resolveRoute(pathname)
  const selectedCalendarDate =
    route.key === 'events-date' ? parseEventDate(route.params?.dateKey) : null
  const allEvents = mergeEvents(remoteEvents, createdEvents)
  const normalizedSearch = deferredSearchTerm.trim().toLowerCase()
  const featuredPool = allEvents
  const isCalendarDateMode = Boolean(selectedCalendarDate)
  const availableDateCounts = useMemo(() => {
    return allEvents.reduce((counts, event) => {
      getEventDateKeys(event).forEach((dateKey) => {
        counts[dateKey] = (counts[dateKey] || 0) + 1
      })

      return counts
    }, {})
  }, [allEvents])

  const filteredEvents = allEvents.filter((event) => {
    if (isCalendarDateMode) {
      return eventOccursOnDate(event, selectedCalendarDate)
    }

    const locationMatches =
      selectedLocation === 'All Philippines' || event.province === selectedLocation
    const categoryMatches =
      selectedCategory === 'All Events' ? true : event.category === selectedCategory
    const dateMatches = matchesDateFilter(event.startDate, selectedDateFilter)

    if (!normalizedSearch) return locationMatches && categoryMatches && dateMatches

    const searchableText = [
      event.title, event.location, event.province,
      event.host, event.category, event.description,
    ].join(' ').toLowerCase()

    return locationMatches && categoryMatches && dateMatches && searchableText.includes(normalizedSearch)
  })

  const scoreEventRelevance = (event) => {
    let score = 0
    const searchableText = [
      event.title,
      event.location,
      event.province,
      event.host,
      event.category,
      event.description,
    ].join(' ').toLowerCase()
    const titleText = `${event.title || ''}`.toLowerCase()
    const locationText = `${event.location || ''} ${event.province || ''}`.toLowerCase()

    if (normalizedSearch) {
      if (titleText.includes(normalizedSearch)) score += 8
      if (searchableText.includes(normalizedSearch)) score += 5
    }

    if (!isCalendarDateMode && selectedCategory !== 'All Events' && event.category === selectedCategory) {
      score += 4
    }

    if (!isCalendarDateMode && selectedLocation !== 'All Philippines') {
      if (event.province === selectedLocation) score += 4
      if (locationText.includes(selectedLocation.toLowerCase())) score += 2
    }

    if (event.isFeatured) {
      score += 1
    }

    return score
  }

  const compareByNearestDate = (leftEvent, rightEvent) => {
    const leftDate = parseEventDate(leftEvent.startDate)
    const rightDate = parseEventDate(rightEvent.startDate)

    if (leftDate && rightDate) {
      return leftDate.getTime() - rightDate.getTime()
    }

    if (leftDate) return -1
    if (rightDate) return 1

    return `${leftEvent.title}`.localeCompare(`${rightEvent.title}`)
  }

  const sortedEvents = [...filteredEvents].sort((leftEvent, rightEvent) => {
    if (isCalendarDateMode) {
      return `${leftEvent.title}`.localeCompare(`${rightEvent.title}`)
    }

    if (selectedSort === 'Relevance') {
      const relevanceDifference =
        scoreEventRelevance(rightEvent) - scoreEventRelevance(leftEvent)

      if (relevanceDifference !== 0) {
        return relevanceDifference
      }
    }

    return compareByNearestDate(leftEvent, rightEvent)
  })

  const totalEventPages = Math.max(1, Math.ceil(sortedEvents.length / EVENTS_PER_PAGE))
  const activeEventPage = Math.min(currentEventsPage, totalEventPages)
  const paginatedEvents = sortedEvents.slice(
    (activeEventPage - 1) * EVENTS_PER_PAGE,
    activeEventPage * EVENTS_PER_PAGE,
  )

  useEffect(() => {
    if (!featuredPool.length) {
      setFeaturedEventId(null)
      return
    }

    const shouldPickRandomFeature =
      route.key === 'events' &&
      (previousRouteKeyRef.current !== 'events' ||
        !featuredPool.some((event) => event.id === featuredEventId))

    if (shouldPickRandomFeature) {
      const randomIndex = Math.floor(Math.random() * featuredPool.length)
      setFeaturedEventId(featuredPool[randomIndex].id)
    }

    previousRouteKeyRef.current = route.key
  }, [featuredEventId, featuredPool, route.key])

  const featuredEvent = useMemo(
    () =>
      featuredPool.find((event) => event.id === featuredEventId) ||
      featuredPool.find((event) => event.isFeatured) ||
      featuredPool[0] ||
      null,
    [featuredEventId, featuredPool],
  )

  const searchResults = useMemo(() => {
    if (!normalizedSearch) {
      return []
    }

    return [...filteredEvents]
      .sort((leftEvent, rightEvent) => {
        const relevanceDifference =
          scoreEventRelevance(rightEvent) - scoreEventRelevance(leftEvent)

        if (relevanceDifference !== 0) {
          return relevanceDifference
        }

        return compareByNearestDate(leftEvent, rightEvent)
      })
      .slice(0, 6)
  }, [filteredEvents, normalizedSearch])

  const showSearchResults = isSearchFocused && normalizedSearch.length > 0
  const currentEvent = allEvents.find((event) => event.id === route.params?.eventId)
  const activeProfile =
    featuredUsers.find((user) => user.username === route.params?.username) ||
    featuredUsers[0]

  const createdByProfile = allEvents.filter((e) => e.createdBy === activeProfile.username)
  const savedByUser = allEvents.filter((e) => interactions.saved.includes(e.id))
  const relatedEvents = currentEvent
    ? allEvents.filter((e) =>
        e.id !== currentEvent.id &&
        (e.category === currentEvent.category || e.province === currentEvent.province)
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

  const handleCreateEvent = async (formData) => {
    try {
      const payload = new FormData()
      payload.append('title', formData.title)
      payload.append('description', formData.description)
      payload.append('date', formData.date)
      payload.append('time', formData.time)
      payload.append('venue', formData.venue)
      payload.append('province', formData.province)
      payload.append('category', formData.category)
      if (formData.imageFile) {
        payload.append('image', formData.imageFile)
      }

      const response = await axios.post(`${API_BASE_URL}/api/events/create`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      })

      if (response.data.success) {
        const dbEvent = response.data.data
        const fallbackImage = createPosterDataUri({
          title: dbEvent.title,
          location: dbEvent.location || formData.province,
          category: dbEvent.category || 'Community',
        })
        const mapLabel = dbEvent.location || formData.venue || formData.province

        const newEvent = {
          id: dbEvent.eventId,
          title: dbEvent.title,
          category: dbEvent.category || 'Community',
          startDate: dbEvent.date,
          timeLabel: dbEvent.time || '',
          location: dbEvent.location,
          province: formData.province,
          host: currentUser?.name || 'Community Host',
          description: dbEvent.description || '',
          attendeeCount: 1,
          savedCount: 1,
          reactions: 1,
          image:
            dbEvent.imageUrl ||
            formData.imagePreview ||
            fallbackImage,
          fallbackImage,
          mapLabel,
          mapUrl: buildGoogleMapsSearchUrl(mapLabel),
          source: 'community',
        }

        setCreatedEvents((prev) => [newEvent, ...prev])
        navigate(routes.eventDetail(newEvent.id))
      }
    } catch (err) {
      console.error('Upload failed:', err.response?.data || err.message)
      alert('Failed to create event. Check console for details.')
    }
  }


  const navProps = {
    currentPath: pathname === '/' ? routes.events : pathname,
    onNavigate: navigate,
    onGoToDashboard: () => {
      setCurrentEventsPage(1)
      navigate(routes.events)
    },
    searchTerm,
    onSearchChange: handleSearchChange,
    searchResults,
    onSearchSelect: (event) => {
      setIsSearchFocused(false)
      navigate(routes.eventDetail(event.id))
    },
    onSearchFocus: () => setIsSearchFocused(true),
    onSearchBlur: () => {
      window.setTimeout(() => setIsSearchFocused(false), 120)
    },
    showSearchResults,
    locations: locationOptions,
    selectedLocation,
    onLocationChange: handleLocationChange,
    availableDateCounts,
    selectedCalendarDate,
    onCalendarDateChange: (value) => {
      const parsedDate = parseEventDate(value)
      if (!parsedDate) return
      setCurrentEventsPage(1)
      setSearchTerm('')
      setSelectedCategory('All Events')
      setSelectedDateFilter('Any time')
      setSelectedLocation('All Philippines')
      navigate(routes.eventsByDate(formatDateKey(parsedDate)))
    },
    onCalendarDateClear: () => {
      setCurrentEventsPage(1)
      navigate(routes.events)
    },
    currentUser,
    onSignOut: handleSignOut,
  }

  const sharedPageProps = {
    interactions,
    onToggleHeart: (eventId) => toggleInteraction('hearted', eventId),
    onToggleSave: (eventId) => toggleInteraction('saved', eventId),
    onToggleAttend: (eventId) => toggleInteraction('attending', eventId),
    onOpenEvent: (eventId) => navigate(routes.eventDetail(eventId)),
  }

  // Show interests page right after signup
  if (showInterests && currentUser) {
    return <InterestsPage user={currentUser} onDone={handleInterestsDone} />
  }

  let page

  if (route.key === 'create-event') {
    page = (
      <CreateEventPage
        categories={categoryOptions.filter((item) => item !== 'All Events')}
        locations={locationOptions.filter((item) => item !== 'All Philippines')}
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
    page = <SignInPage onAuthSuccess={handleAuthSuccess} />
  } else if (route.key === 'about-programmers') {
    page = <AboutProgrammersPage />
  } else if (route.key === 'event-planning') {
    page = <EventPlanningPage />
  } else if (route.key === 'community-hosts') {
    page = <CommunityHostsPage />
  } else if (route.key === 'location-guides') {
    page = <LocationGuidesPage />
  } else if (route.key === 'help-center') {
    page = <HelpCenterPage />
  } else if (route.key === 'contact-support') {
    page = <ContactSupportPage />
  } else {
    page = (
      <EventDiscoveryPage
        featuredEvent={featuredEvent}
        events={isCalendarDateMode ? sortedEvents : paginatedEvents}
        filteredCount={filteredEvents.length}
        currentPage={activeEventPage}
        totalPages={totalEventPages}
        onPageChange={setCurrentEventsPage}
        dateFilterOptions={dateFilterOptions}
        selectedCategory={selectedCategory}
        selectedDateFilter={selectedDateFilter}
        selectedSort={selectedSort}
        onCategoryChange={handleCategoryChange}
        onDateFilterChange={handleDateFilterChange}
        onSortChange={handleSortChange}
        selectedLocation={selectedLocation}
        selectedCalendarDate={selectedCalendarDate}
        onClearCalendarDate={() => navigate(routes.events)}
        onNavigate={navigate}
        {...sharedPageProps}
      />
    )
  }

  return <MainLayout navProps={navProps}>{page}</MainLayout>
}

export default App
