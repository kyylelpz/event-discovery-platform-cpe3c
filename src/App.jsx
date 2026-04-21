import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  categoryOptions,
  dateFilterOptions,
  featuredUsers,
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
import {
  clearSession,
  getKnownUsers,
  getSession,
  isHostedAuthEnvironment,
  saveInterests,
  setSession,
  signOut,
  syncStoredUser,
} from './services/authService.js'
import {
  buildEmptyInteractionState,
  fetchInteractionState,
  updateInteractionState,
} from './services/interactionService.js'
import { fetchCurrentUserProfile } from './services/profileService.js'
import {
  buildGoogleMapsSearchUrl,
  createPosterDataUri,
  eventOccursOnDate,
  formatDateKey,
  getEventDateKeys,
  matchesDateFilter,
  parseEventDate,
} from './utils/formatters.js'
import { normalizeRoutePath, resolveRoute, routes, slugify } from './utils/routing.js'

const EVENTS_PER_PAGE = 15

const mergeEvents = (...eventGroups) => {
  const merged = new Map()
  eventGroups.flat().forEach((event) => merged.set(event.id, event))
  return [...merged.values()]
}

const normalizeInterestList = (values) =>
  Array.isArray(values)
    ? values
        .map((value) => String(value || '').trim().toLowerCase())
        .filter(Boolean)
    : []

const scoreEventForInterests = (event, interests = []) => {
  if (!interests.length || !event) {
    return 0
  }

  const category = String(event.category || '').trim().toLowerCase()
  const searchableText = [
    event.title,
    event.category,
    event.description,
    event.host,
    event.location,
    event.province,
  ]
    .join(' ')
    .toLowerCase()

  return interests.reduce((score, interest) => {
    if (!interest) {
      return score
    }

    if (category === interest) {
      return score + 12
    }

    if (category.includes(interest) || interest.includes(category)) {
      return score + 8
    }

    if (searchableText.includes(interest)) {
      return score + 3
    }

    return score
  }, 0)
}

const getUserProfileSlug = (user) => {
  const baseValue =
    user?.username ||
    user?.name ||
    String(user?.email || '').split('@')[0] ||
    'me'

  return slugify(String(baseValue).trim() || 'me') || 'me'
}

const getUserProfilePath = (user) => routes.profile(getUserProfileSlug(user))

const normalizeCommunityUser = (user = {}) => ({
  ...user,
  email: String(user.email || '').trim().toLowerCase(),
  name:
    String(user.name || user.username || String(user.email || '').split('@')[0] || '').trim() ||
    'Eventcinity user',
  username: String(user.username || getUserProfileSlug(user)).trim() || getUserProfileSlug(user),
  location: String(user.location || 'Philippines').trim(),
  bio:
    String(user.bio || '').trim() ||
    'New to Eventcinity and ready to discover events in the community.',
  interests: Array.isArray(user.interests)
    ? user.interests.map((interest) => String(interest || '').trim()).filter(Boolean)
    : [],
  profilePic: String(user.profilePic || user.avatar || '').trim(),
})

const mergeCommunityUsers = (...userGroups) => {
  const merged = new Map()

  userGroups
    .flat()
    .filter(Boolean)
    .forEach((user) => {
      const normalizedUser = normalizeCommunityUser(user)
      const userKey =
        normalizedUser.email ||
        normalizedUser.username ||
        normalizedUser.name.toLowerCase()
      const existingUser = merged.get(userKey)

      merged.set(userKey, {
        ...existingUser,
        ...normalizedUser,
        interests:
          normalizedUser.interests.length > 0
            ? normalizedUser.interests
            : existingUser?.interests || [],
      })
    })

  return [...merged.values()]
}

function App() {
  const [pathname, setPathname] = useState(() => normalizeRoutePath(window.location.pathname))
  const [currentUser, setCurrentUser] = useState(() => getSession())
  const [showInterests, setShowInterests] = useState(
    () => Boolean(getSession()?.shouldShowInterestsPrompt),
  )

  const [selectedLocation, setSelectedLocation] = useState('All Philippines')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Events')
  const [selectedDateFilter, setSelectedDateFilter] = useState('Any time')
  const [selectedSort, setSelectedSort] = useState('Nearest date')
  const [remoteEvents, setRemoteEvents] = useState([])
  const [createdEvents, setCreatedEvents] = useState([])
  const [interactionState, setInteractionState] = useState(() => buildEmptyInteractionState())
  const [activeProfileTab, setActiveProfileTab] = useState('Created Events')
  const [currentEventsPage, setCurrentEventsPage] = useState(1)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const currentUserRef = useRef(currentUser)
  const recentAuthSuccessAtRef = useRef(0)
  const {
    interactions,
    savedEvents: savedInteractionEvents,
    likedEvents: likedInteractionEvents,
    attendingEvents: attendingInteractionEvents,
  } = interactionState

  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

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

  useEffect(() => {
    const activeUser = currentUserRef.current

    if (!activeUser?.email) {
      return undefined
    }

    const shouldSyncRemoteProfile =
      activeUser.authProvider === 'remote' || isHostedAuthEnvironment()

    if (!shouldSyncRemoteProfile) {
      return undefined
    }

    let isActive = true

    const syncCurrentUserProfile = async () => {
      try {
        const profile = await fetchCurrentUserProfile(activeUser)

        if (!isActive) {
          return
        }

        const nextSession = { ...activeUser, ...profile }
        setCurrentUser(nextSession)
        setSession(nextSession)
        void syncStoredUser(nextSession)
      } catch (error) {
        if (!isActive) {
          return
        }

        if ([401, 403].includes(error?.status)) {
          const recentlyAuthenticated =
            Date.now() - recentAuthSuccessAtRef.current < 30_000
          const shouldPreserveFreshSession =
            recentlyAuthenticated || Boolean(activeUser.needsInterestsSelection)

          if (shouldPreserveFreshSession) {
            const fallbackSession = { ...activeUser, authProvider: 'local' }
            setCurrentUser(fallbackSession)
            setSession(fallbackSession)
            setShowInterests(Boolean(fallbackSession.shouldShowInterestsPrompt))
            void syncStoredUser(fallbackSession)
            return
          }

          if (isHostedAuthEnvironment()) {
            clearSession()
            setCurrentUser(null)
            setInteractionState(buildEmptyInteractionState())
            setShowInterests(false)
            return
          }

          const fallbackSession = { ...activeUser, authProvider: 'local' }
          setCurrentUser(fallbackSession)
          setSession(fallbackSession)
          void syncStoredUser(fallbackSession)
          return
        }

        if (error?.status === 404) {
          console.warn(
            'Profile sync endpoint was not found. Preserving the current session from auth response.',
            error,
          )
          return
        }

        console.warn('Unable to sync current user profile:', error)
      }
    }

    void syncCurrentUserProfile()

    return () => {
      isActive = false
    }
  }, [currentUser?.email, currentUser?.authProvider])

  useEffect(() => {
    if (!currentUser?.email) {
      return undefined
    }

    let isActive = true

    const syncInteractionState = async () => {
      try {
        const nextInteractionState = await fetchInteractionState()

        if (!isActive) {
          return
        }

        setInteractionState(nextInteractionState)
      } catch (error) {
        if (!isActive) {
          return
        }

        console.warn('Unable to load the current user interaction state:', error)
        setInteractionState(buildEmptyInteractionState())
      }
    }

    void syncInteractionState()

    return () => {
      isActive = false
    }
  }, [currentUser?.email])

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
    const nextUser =
      type === 'new'
        ? {
            ...session,
            needsInterestsSelection: true,
            hasCompletedOnboarding: false,
            shouldShowInterestsPrompt: true,
          }
        : {
            ...session,
            shouldShowInterestsPrompt: false,
          }

    recentAuthSuccessAtRef.current = Date.now()
    setCurrentUser(nextUser)
    setInteractionState(buildEmptyInteractionState())
    setSession(nextUser)
    if (type === 'new' || nextUser.shouldShowInterestsPrompt) {
      setShowInterests(true)
      navigate(routes.events)
      return
    }

    setShowInterests(false)
    navigate(getUserProfilePath(nextUser))
  }

  // Called after interests are picked
  const handleInterestsDone = async (interests) => {
    if (currentUser) {
      await saveInterests(currentUser.email, interests)
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              interests,
              needsInterestsSelection: false,
              hasCompletedOnboarding: true,
              shouldShowInterestsPrompt: false,
            }
          : prev,
      )
    }
    setShowInterests(false)
    navigate(routes.events)
  }

  const handleSignOut = () => {
    recentAuthSuccessAtRef.current = 0
    signOut()
    setCurrentUser(null)
    setInteractionState(buildEmptyInteractionState())
    setShowInterests(false)
    navigate(routes.events)
  }

  const route = resolveRoute(pathname)
  const currentUserEmail = String(currentUser?.email || '').trim().toLowerCase()
  const currentUserInterestLabels = Array.isArray(currentUser?.interests)
    ? currentUser.interests
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    : []
  const currentUserInterests = normalizeInterestList(currentUserInterestLabels)
  const communityPeople = useMemo(
    () =>
      mergeCommunityUsers(currentUser ? [currentUser] : [], getKnownUsers(), featuredUsers).map(
        (user) => {
          const isCurrentUserEntry =
            currentUserEmail && user.email === currentUserEmail

          if (isCurrentUserEntry) {
            return user
          }

          return {
            ...user,
            email: '',
            phone: '',
            interests: [],
            isPrivateProfile: true,
          }
        },
      ),
    [currentUser, currentUserEmail],
  )

  const selectedCalendarDate =
    route.key === 'events-date' ? parseEventDate(route.params?.dateKey) : null
  const allEvents = mergeEvents(
    savedInteractionEvents,
    likedInteractionEvents,
    attendingInteractionEvents,
    remoteEvents,
    createdEvents,
  )
  const normalizedSearch = deferredSearchTerm.trim().toLowerCase()
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

  const featuredEvent = useMemo(
    () =>
      [...allEvents].sort((leftEvent, rightEvent) => {
        const interestDifference =
          scoreEventForInterests(rightEvent, currentUserInterests) -
          scoreEventForInterests(leftEvent, currentUserInterests)

        if (interestDifference !== 0) {
          return interestDifference
        }

        const featuredDifference =
          Number(Boolean(rightEvent.isFeatured)) - Number(Boolean(leftEvent.isFeatured))

        if (featuredDifference !== 0) {
          return featuredDifference
        }

        return compareByNearestDate(leftEvent, rightEvent)
      })[0] || null,
    [allEvents, currentUserInterests],
  )
  const featuredInterestLabel =
    featuredEvent && currentUserInterestLabels.length
      ? currentUserInterestLabels.find(
          (interest) =>
            scoreEventForInterests(featuredEvent, normalizeInterestList([interest])) > 0,
        ) || ''
      : ''

  const searchResults = !normalizedSearch
    ? []
    : [...filteredEvents]
        .sort((leftEvent, rightEvent) => {
          const relevanceDifference =
            scoreEventRelevance(rightEvent) - scoreEventRelevance(leftEvent)

          if (relevanceDifference !== 0) {
            return relevanceDifference
          }

          return compareByNearestDate(leftEvent, rightEvent)
        })
        .slice(0, 6)

  const showSearchResults = isSearchFocused && normalizedSearch.length > 0
  const currentEvent = allEvents.find((event) => event.id === route.params?.eventId)
  const isViewingCurrentUserProfile =
    route.key === 'profile' &&
    currentUser &&
    ['me', getUserProfileSlug(currentUser)].includes(route.params?.username)
  const activeProfile = isViewingCurrentUserProfile
    ? {
        ...currentUser,
        username: currentUser.username || getUserProfileSlug(currentUser),
      }
    : communityPeople.find((user) => user.username === route.params?.username) ||
      communityPeople[0]

  const createdByProfile = allEvents.filter((e) => e.createdBy === activeProfile?.username)
  const savedByUser = isViewingCurrentUserProfile
    ? savedInteractionEvents
    : []
  const likedByUser = isViewingCurrentUserProfile
    ? likedInteractionEvents
    : []
  const relatedEvents = currentEvent
    ? allEvents.filter((e) =>
        e.id !== currentEvent.id &&
        (e.category === currentEvent.category || e.province === currentEvent.province)
      )
    : []

  const toggleInteraction = async (key, event) => {
    if (!currentUser?.email) {
      navigate(routes.signin)
      return
    }

    const eventId = String(event?.id || '').trim()

    if (!eventId) {
      return
    }

    const nextFlags = {
      hearted:
        key === 'hearted'
          ? !interactions.hearted.includes(eventId)
          : interactions.hearted.includes(eventId),
      saved:
        key === 'saved'
          ? !interactions.saved.includes(eventId)
          : interactions.saved.includes(eventId),
      attending:
        key === 'attending'
          ? !interactions.attending.includes(eventId)
          : interactions.attending.includes(eventId),
    }

    try {
      const nextInteractionState = await updateInteractionState(event, nextFlags)
      setInteractionState(nextInteractionState)
    } catch (error) {
      console.warn('Unable to update the current user interaction state:', error)
      window.alert('Unable to save that event action right now. Please try again.')
    }
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
          createdBy: currentUser ? getUserProfileSlug(currentUser) : '',
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
    onOpenProfile: () => {
      if (!currentUser) {
        navigate(routes.signin)
        return
      }

      navigate(getUserProfilePath(currentUser))
    },
    onSignOut: handleSignOut,
  }

  const sharedPageProps = {
    interactions,
    onToggleHeart: (event) => toggleInteraction('hearted', event),
    onToggleSave: (event) => toggleInteraction('saved', event),
    onToggleAttend: (event) => toggleInteraction('attending', event),
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
        people={communityPeople}
        onOpenProfile={(username) => navigate(routes.profile(username))}
      />
    )
  } else if (route.key === 'profile') {
    page = (
      <ProfilePage
        user={activeProfile}
        createdEvents={createdByProfile}
        savedEvents={savedByUser}
        likedEvents={likedByUser}
        isCurrentUser={isViewingCurrentUserProfile}
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
        featuredInterestLabel={featuredInterestLabel}
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
