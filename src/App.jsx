import { useDeferredValue, useEffect, useState } from 'react'
import './App.css'
import {
  categoryOptions,
  dateFilterOptions,
  featuredUsers,
  initialInteractions,
  luzonLocations,
  seedEvents,
} from './data/mockData.js'
import axios from 'axios';
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
import { createPosterDataUri, matchesDateFilter } from './utils/formatters.js'
import { resolveRoute, routes } from './utils/routing.js'

const mergeEvents = (...eventGroups) => {
  const merged = new Map()
  eventGroups.flat().forEach((event) => merged.set(event.id, event))
  return [...merged.values()]
}

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [currentUser, setCurrentUser] = useState(() => getSession())
  const [showInterests, setShowInterests] = useState(false)

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
    const handlePopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    let isActive = true
    const syncEvents = async () => {
      setIsLoadingEvents(true)
      const { events, mode } = await loadEventsByLocation(selectedLocation)
      if (!isActive) return
      setRemoteEvents(events)
      setFeedMode(mode)
      setIsLoadingEvents(false)
    }
    syncEvents()
    return () => { isActive = false }
  }, [selectedLocation])

  const navigate = (nextPath) => {
    if (!nextPath || nextPath === pathname) return
    window.history.pushState({}, '', nextPath)
    setPathname(nextPath)
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
  const allEvents = mergeEvents(createdEvents, remoteEvents)
  const normalizedSearch = deferredSearchTerm.trim().toLowerCase()

  // If user has interests, filter by them on the default category
  const userInterests = currentUser?.interests || []

  const filteredEvents = allEvents.filter((event) => {
    const locationMatches =
      selectedLocation === 'All Luzon' || event.province === selectedLocation
    const categoryMatches =
      selectedCategory === 'All Events'
        ? userInterests.length === 0 || userInterests.includes(event.category)
        : event.category === selectedCategory
    const dateMatches = matchesDateFilter(event.startDate, selectedDateFilter)

    if (!normalizedSearch) return locationMatches && categoryMatches && dateMatches

    const searchableText = [
      event.title, event.location, event.province,
      event.host, event.category, event.description,
    ].join(' ').toLowerCase()

    return locationMatches && categoryMatches && dateMatches && searchableText.includes(normalizedSearch)
  })

  const featuredEvent =
    filteredEvents.find((event) => event.isFeatured) ||
    filteredEvents[0] ||
    allEvents[0]
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
      setIsLoadingEvents(true)

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
            createPosterDataUri({
              title: dbEvent.title,
              location: dbEvent.location || formData.province,
              category: dbEvent.category || 'Community',
            }),
          source: 'community',
        }

        setCreatedEvents((prev) => [newEvent, ...prev])
        navigate(routes.eventDetail(newEvent.id))
      }
    } catch (err) {
      console.error('Upload failed:', err.response?.data || err.message)
      alert('Failed to create event. Check console for details.')
    } finally {
      setIsLoadingEvents(false)
    }
  }


  const navProps = {
    currentPath: pathname === '/' ? routes.events : pathname,
    onNavigate: navigate,
    searchTerm,
    onSearchChange: setSearchTerm,
    locations: luzonLocations,
    selectedLocation,
    onLocationChange: setSelectedLocation,
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
        currentUser={currentUser}
        {...sharedPageProps}
      />
    )
  }

  return <MainLayout navProps={navProps}>{page}</MainLayout>
}

export default App
