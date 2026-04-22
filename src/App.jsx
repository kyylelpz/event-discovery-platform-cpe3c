import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  categoryOptions,
  dateFilterOptions,
  locationOptions,
} from './data/mockData.js'
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
import {
  fetchCreatedEventsByCurrentUser,
  fetchCreatedEventsByUsername,
  loadEventsByLocation,
} from './services/eventService.js'
import {
  clearSession,
  getAuthRequestHeaders,
  getSession,
  isHostedAuthEnvironment,
  saveCurrentUserProfile,
  setSession,
  signOut,
  syncStoredUser,
} from './services/authService.js'
import {
  buildEmptyInteractionState,
  fetchPublicAttendingEvents,
  fetchInteractionState,
  updateInteractionState,
} from './services/interactionService.js'
import { fetchCurrentUserProfile } from './services/profileService.js'
import { fetchCommunityUsers, fetchPublicProfile } from './services/userService.js'
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
const PEOPLE_PER_PAGE = 15
const THEME_STORAGE_KEY = 'eventcinity_theme'

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

const compareEventsByNearestDate = (leftEvent, rightEvent) => {
  const leftDate = parseEventDate(leftEvent.startDate)
  const rightDate = parseEventDate(rightEvent.startDate)

  if (leftDate && rightDate) {
    return leftDate.getTime() - rightDate.getTime()
  }

  if (leftDate) return -1
  if (rightDate) return 1

  return `${leftEvent.title}`.localeCompare(`${rightEvent.title}`)
}

const getSeededIndex = (length, seedSource) => {
  if (!length) {
    return 0
  }

  const seed = String(seedSource || 'eventcinity')
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }

  return hash % length
}

const selectFeaturedEvent = (events, interests = [], seedSource = '') => {
  if (!Array.isArray(events) || events.length === 0) {
    return null
  }

  const scoredEvents = events
    .map((event) => ({
      event,
      interestScore: scoreEventForInterests(event, interests),
      featuredScore: Number(Boolean(event.isFeatured)),
    }))
    .sort((leftEvent, rightEvent) => {
      const interestDifference = rightEvent.interestScore - leftEvent.interestScore

      if (interestDifference !== 0) {
        return interestDifference
      }

      const featuredDifference = rightEvent.featuredScore - leftEvent.featuredScore

      if (featuredDifference !== 0) {
        return featuredDifference
      }

      return compareEventsByNearestDate(leftEvent.event, rightEvent.event)
    })

  const matchingEvents = scoredEvents.filter(({ interestScore }) => interestScore > 0)
  const candidateEvents = (matchingEvents.length ? matchingEvents : scoredEvents).slice(0, 6)

  return candidateEvents[getSeededIndex(candidateEvents.length, seedSource)]?.event || null
}

const getUserProfileSlug = (user) => {
  const baseValue =
    user?.username ||
    user?.name ||
    String(user?.email || '').split('@')[0] ||
    'me'

  return slugify(String(baseValue).trim() || 'me') || 'me'
}

const normalizeCommunityUser = (user = {}) => ({
  ...user,
  id: String(user.id || user._id || '').trim(),
  email: String(user.email || '').trim().toLowerCase(),
  name:
    String(user.name || user.username || String(user.email || '').split('@')[0] || '').trim() ||
    'Eventcinity user',
  username: String(user.username || getUserProfileSlug(user)).trim() || getUserProfileSlug(user),
  location: String(user.location || 'Philippines').trim(),
  bio:
    String(user.bio || '').trim() ||
    'New to Eventcinity and ready to discover events in the community.',
  phone: String(user.phone || user.contact || '').trim(),
  contact: String(user.contact || user.phone || '').trim(),
  interests: Array.isArray(user.interests)
    ? user.interests.map((interest) => String(interest || '').trim()).filter(Boolean)
    : [],
  profilePic: String(user.profilePic || user.avatar || '').trim(),
  createdEventsCount: Number(user.createdEventsCount || 0),
})

const mergeCommunityUsers = (...userGroups) => {
  const merged = new Map()

  userGroups
    .flat()
    .filter(Boolean)
    .forEach((user) => {
      const normalizedUser = normalizeCommunityUser(user)
      const userKey =
        normalizedUser.id ||
        normalizedUser.username ||
        normalizedUser.email ||
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

const compareCommunityUsers = (leftUser, rightUser) => {
  const createdDifference =
    Number(rightUser.createdEventsCount || 0) - Number(leftUser.createdEventsCount || 0)

  if (createdDifference !== 0) {
    return createdDifference
  }

  return String(leftUser.name || '').localeCompare(String(rightUser.name || ''))
}

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    const storedTheme = String(window.localStorage.getItem(THEME_STORAGE_KEY) || '').trim()

    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [pathname, setPathname] = useState(() => normalizeRoutePath(window.location.pathname))
  const [currentUser, setCurrentUser] = useState(() => getSession())
  const [showInterests, setShowInterests] = useState(
    () => Boolean(getSession()?.shouldShowInterestsPrompt),
  )

  const [selectedLocation, setSelectedLocation] = useState('All Philippines')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Events')
  const [selectedDateFilter, setSelectedDateFilter] = useState('Any time')
  const [remoteEvents, setRemoteEvents] = useState([])
  const [createdEvents, setCreatedEvents] = useState([])
  const [profileCreatedEvents, setProfileCreatedEvents] = useState([])
  const [profileAttendingEvents, setProfileAttendingEvents] = useState([])
  const [communityUsers, setCommunityUsers] = useState([])
  const [activePublicProfile, setActivePublicProfile] = useState(null)
  const [isPublicProfileLoading, setIsPublicProfileLoading] = useState(false)
  const [interactionState, setInteractionState] = useState(() => buildEmptyInteractionState())
  const [activeProfileTab, setActiveProfileTab] = useState('Created Events')
  const [currentEventsPage, setCurrentEventsPage] = useState(1)
  const [currentPeoplePage, setCurrentPeoplePage] = useState(1)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [featuredShuffleSeed, setFeaturedShuffleSeed] = useState(
    () => `${Date.now()}:${Math.random()}`,
  )
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const currentUserRef = useRef(currentUser)
  const recentAuthSuccessAtRef = useRef(0)
  const hostedSessionRestoreAttemptedRef = useRef(false)
  const {
    interactions,
    savedEvents: savedInteractionEvents,
    likedEvents: likedInteractionEvents,
    attendingEvents: attendingInteractionEvents,
  } = interactionState

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

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
    if (
      currentUser?.email ||
      !isHostedAuthEnvironment() ||
      hostedSessionRestoreAttemptedRef.current
    ) {
      return undefined
    }

    let isActive = true
    hostedSessionRestoreAttemptedRef.current = true

    const restoreHostedSession = async () => {
      try {
        const profile = await fetchCurrentUserProfile({ authProvider: 'remote' })

        if (!isActive || !profile?.email) {
          return
        }

        const nextSession = {
          ...profile,
          authProvider: profile.authProvider || 'remote',
          shouldShowInterestsPrompt: Boolean(profile.needsInterestsSelection),
        }

        recentAuthSuccessAtRef.current = Date.now()
        setCurrentUser(nextSession)
        setSession(nextSession)
        setShowInterests(Boolean(nextSession.shouldShowInterestsPrompt))
        void syncStoredUser(nextSession)
      } catch (error) {
        if (!isActive || [401, 403, 404].includes(error?.status)) {
          return
        }

        console.warn('Unable to restore the hosted session:', error)
      }
    }

    void restoreHostedSession()

    return () => {
      isActive = false
    }
  }, [currentUser?.email])

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
            recentlyAuthenticated && !isHostedAuthEnvironment()

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

  useEffect(() => {
    let isActive = true

    const loadCommunityDirectory = async () => {
      try {
        const users = await fetchCommunityUsers()

        if (!isActive) {
          return
        }

        setCommunityUsers(users)
      } catch (error) {
        if (!isActive) {
          return
        }

        console.warn('Unable to load the community directory:', error)
      }
    }

    void loadCommunityDirectory()

    return () => {
      isActive = false
    }
  }, [
    currentUser?.id,
    currentUser?.username,
    currentUser?.profilePic,
    currentUser?.bio,
    currentUser?.location,
    currentUser?.phone,
    JSON.stringify(currentUser?.interests || []),
  ])

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

  // Called after sign in or sign up
  const handleAuthSuccess = (session, type) => {
    const shouldShowInterestsPrompt =
      type === 'new' || Boolean(session?.needsInterestsSelection)
    const nextUser =
      shouldShowInterestsPrompt
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
    if (nextUser.shouldShowInterestsPrompt) {
      setShowInterests(true)
      navigate(routes.events)
      return
    }

    setShowInterests(false)
    navigate(routes.profile('me'))
  }

  // Called after interests are picked
  const handleInterestsDone = async ({ interests, username }) => {
    try {
      if (currentUser) {
        const nextSession = await saveCurrentUserProfile(
          { interests, username },
          {
            completeOnboarding: true,
            fallbackEmail: currentUser.email,
          },
        )
        setCurrentUser(nextSession)
      }
    } catch (error) {
      if ([401, 403].includes(error?.status)) {
        recentAuthSuccessAtRef.current = 0
        clearSession()
        setCurrentUser(null)
        setInteractionState(buildEmptyInteractionState())
        setShowInterests(false)
        navigate(routes.signin)
        return
      }

      throw error
    }

    setShowInterests(false)
    navigate(routes.events)
  }

  const handleProfileUpdate = async (updates) => {
    const nextSession = await saveCurrentUserProfile(updates, {
      fallbackEmail: currentUser?.email,
    })

    setCurrentUser(nextSession)
    setCommunityUsers((prevUsers) => mergeCommunityUsers(prevUsers, [nextSession]))

    return nextSession
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
  const currentUserProfileSlug = currentUser ? getUserProfileSlug(currentUser) : ''
  const currentUserInterestLabels = Array.isArray(currentUser?.interests)
    ? currentUser.interests
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    : []
  const currentUserInterests = normalizeInterestList(currentUserInterestLabels)
  const communityDirectory = useMemo(
    () =>
      mergeCommunityUsers(currentUser ? [currentUser] : [], communityUsers).map(
        (user) => {
          const isCurrentUserEntry =
            (currentUser?.id && user.id === currentUser.id) ||
            (currentUser?.username && user.username === currentUser.username) ||
            (currentUserEmail && user.email === currentUserEmail)

          if (isCurrentUserEntry) {
            return {
              ...user,
              ...currentUser,
            }
          }

          return {
            ...user,
            email: '',
          }
        },
      ).sort(compareCommunityUsers),
    [communityUsers, currentUser, currentUserEmail],
  )
  const connectPeople = useMemo(
    () =>
      communityDirectory.filter((user) => {
        const isCurrentUserEntry =
          (currentUser?.id && user.id === currentUser.id) ||
          (currentUser?.username && user.username === currentUser.username) ||
          (currentUserEmail && user.email === currentUserEmail)

        return !isCurrentUserEntry
      }),
    [communityDirectory, currentUser?.id, currentUser?.username, currentUserEmail],
  )
  const totalPeoplePages = Math.max(1, Math.ceil(connectPeople.length / PEOPLE_PER_PAGE))
  const activePeoplePage = Math.min(currentPeoplePage, totalPeoplePages)
  const paginatedPeople = connectPeople.slice(
    (activePeoplePage - 1) * PEOPLE_PER_PAGE,
    activePeoplePage * PEOPLE_PER_PAGE,
  )

  const selectedCalendarDate =
    route.key === 'events-date' ? parseEventDate(route.params?.dateKey) : null
  const allEvents = mergeEvents(
    savedInteractionEvents,
    likedInteractionEvents,
    attendingInteractionEvents,
    remoteEvents,
    createdEvents,
    profileCreatedEvents,
    profileAttendingEvents,
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

  const compareByNearestDate = compareEventsByNearestDate

  const sortedEvents = [...filteredEvents].sort((leftEvent, rightEvent) => {
    if (isCalendarDateMode) {
      return `${leftEvent.title}`.localeCompare(`${rightEvent.title}`)
    }

    return compareByNearestDate(leftEvent, rightEvent)
  })

  const totalEventPages = Math.max(1, Math.ceil(sortedEvents.length / EVENTS_PER_PAGE))
  const activeEventPage = Math.min(currentEventsPage, totalEventPages)
  const paginatedEvents = sortedEvents.slice(
    (activeEventPage - 1) * EVENTS_PER_PAGE,
    activeEventPage * EVENTS_PER_PAGE,
  )

  const featuredRotationSeed = [
    currentUser?.id || currentUser?.username || currentUser?.email || 'guest',
    featuredShuffleSeed,
  ].join(':')
  const featuredEvent = useMemo(
    () => selectFeaturedEvent(allEvents, currentUserInterests, featuredRotationSeed),
    [allEvents, currentUserInterests, featuredRotationSeed],
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
    ['me', currentUserProfileSlug].includes(route.params?.username)

  useEffect(() => {
    if (route.key !== 'profile') {
      setActivePublicProfile(null)
      setIsPublicProfileLoading(false)
      return undefined
    }

    const requestedUsername = String(route.params?.username || '').trim()

    if (!requestedUsername || requestedUsername === 'me' || isViewingCurrentUserProfile) {
      setActivePublicProfile(null)
      setIsPublicProfileLoading(false)
      return undefined
    }

    const fallbackProfile =
      communityDirectory.find((user) => user.username === requestedUsername) || null

    if (fallbackProfile) {
      setActivePublicProfile(fallbackProfile)
    }

    let isActive = true
    setIsPublicProfileLoading(true)

    const loadPublicProfile = async () => {
      try {
        const profile = await fetchPublicProfile(requestedUsername)

        if (!isActive) {
          return
        }

        setActivePublicProfile(profile)
      } catch (error) {
        if (!isActive) {
          return
        }

        console.warn('Unable to load the selected public profile:', error)
        setActivePublicProfile(fallbackProfile)
      } finally {
        if (isActive) {
          setIsPublicProfileLoading(false)
        }
      }
    }

    void loadPublicProfile()

    return () => {
      isActive = false
    }
  }, [route.key, route.params?.username, isViewingCurrentUserProfile, communityDirectory])

  useEffect(() => {
    if (route.key !== 'profile') {
      setProfileCreatedEvents([])
      return undefined
    }

    const requestedUsername = String(route.params?.username || '').trim()
    const shouldLoadCurrentUserEvents = isViewingCurrentUserProfile && currentUser?.email
    const shouldLoadPublicEvents =
      requestedUsername && requestedUsername !== 'me' && !isViewingCurrentUserProfile

    if (!shouldLoadCurrentUserEvents && !shouldLoadPublicEvents) {
      setProfileCreatedEvents([])
      return undefined
    }

    let isActive = true

    const loadCreatedEventsForProfile = async () => {
      try {
        const events = shouldLoadCurrentUserEvents
          ? await fetchCreatedEventsByCurrentUser()
          : await fetchCreatedEventsByUsername(requestedUsername)

        if (!isActive) {
          return
        }

        setProfileCreatedEvents(events)
      } catch (error) {
        if (!isActive) {
          return
        }

        console.warn('Unable to load created events for the selected profile:', error)
        setProfileCreatedEvents([])
      }
    }

    void loadCreatedEventsForProfile()

    return () => {
      isActive = false
    }
  }, [route.key, route.params?.username, isViewingCurrentUserProfile, currentUser?.email])

  useEffect(() => {
    if (route.key !== 'profile') {
      setProfileAttendingEvents([])
      return undefined
    }

    const requestedUsername = String(route.params?.username || '').trim()
    const shouldLoadPublicAttending =
      requestedUsername && requestedUsername !== 'me' && !isViewingCurrentUserProfile

    if (!shouldLoadPublicAttending) {
      setProfileAttendingEvents([])
      return undefined
    }

    let isActive = true

    const loadPublicAttendingEvents = async () => {
      try {
        const events = await fetchPublicAttendingEvents(requestedUsername)

        if (!isActive) {
          return
        }

        setProfileAttendingEvents(events)
      } catch (error) {
        if (!isActive) {
          return
        }

        console.warn('Unable to load public attending events for the selected profile:', error)
        setProfileAttendingEvents([])
      }
    }

    void loadPublicAttendingEvents()

    return () => {
      isActive = false
    }
  }, [route.key, route.params?.username, isViewingCurrentUserProfile])

  useEffect(() => {
    if (route.key === 'profile') {
      setActiveProfileTab('Created Events')
    }
  }, [route.key, route.params?.username])

  useEffect(() => {
    if (route.key !== 'people') {
      setCurrentPeoplePage(1)
    }
  }, [route.key])

  useEffect(() => {
    setCurrentPeoplePage((currentPage) => Math.min(currentPage, totalPeoplePages))
  }, [totalPeoplePages])

  const activeProfile = isViewingCurrentUserProfile
    ? {
        ...currentUser,
        username: currentUser.username || currentUserProfileSlug,
      }
    : activePublicProfile

  const createdByProfile = profileCreatedEvents
  const savedByUser = isViewingCurrentUserProfile
    ? savedInteractionEvents
    : []
  const likedByUser = isViewingCurrentUserProfile
    ? likedInteractionEvents
    : []
  const attendingByUser = isViewingCurrentUserProfile
    ? attendingInteractionEvents
    : profileAttendingEvents
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
    if (!currentUser?.email) {
      navigate(routes.signin)
      throw new Error('Sign in to create an event.')
    }

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

      const response = await fetch(`${API_BASE_URL}/api/events/create`, {
        method: 'POST',
        headers: getAuthRequestHeaders(),
        credentials: 'include',
        body: payload,
      })
      const responseData = await response.json()

      if (!response.ok || !responseData.success) {
        if ([401, 403].includes(response.status)) {
          navigate(routes.signin)
          throw new Error('Sign in to create an event.')
        }

        throw new Error(responseData.message || 'Failed to create event.')
      }

      if (responseData.success) {
        const dbEvent = responseData.data
        const fallbackImage = createPosterDataUri({
          title: dbEvent.title,
          location: dbEvent.location || dbEvent.venue || formData.province,
          category: dbEvent.category || 'Community',
        })
        const mapLabel =
          dbEvent.location ||
          dbEvent.venue ||
          formData.venue ||
          formData.province

        const newEvent = {
          id: dbEvent.eventId,
          title: dbEvent.title,
          category: dbEvent.category || formData.category || 'Community',
          startDate: dbEvent.startDate || dbEvent.date || formData.date,
          timeLabel: dbEvent.timeLabel || dbEvent.time || formData.time || '',
          location: dbEvent.location || dbEvent.venue || formData.venue || formData.province,
          province: dbEvent.province || formData.province,
          host: dbEvent.organizer || dbEvent.creatorName || currentUser?.name || 'Community Host',
          createdBy: dbEvent.createdBy || currentUser?.username || '',
          description: dbEvent.description || '',
          attendeeCount: Number(dbEvent.attendeeCount || 0),
          savedCount: Number(dbEvent.savedCount || 0),
          reactions: Number(dbEvent.reactions || 0),
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
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                createdEventsCount: Number(prev.createdEventsCount || 0) + 1,
              }
            : prev,
        )
        setCommunityUsers((prevUsers) =>
          mergeCommunityUsers(prevUsers, [
            {
              ...currentUser,
              createdEventsCount: Number(currentUser?.createdEventsCount || 0) + 1,
            },
          ]),
        )
        navigate(routes.eventDetail(newEvent.id))
      }
    } catch (err) {
      console.error('Upload failed:', err.message)
      throw err
    }
  }


  const navProps = {
    currentPath: pathname === '/' ? routes.events : pathname,
    onNavigate: navigate,
    onGoToDashboard: () => {
      setCurrentEventsPage(1)
      setFeaturedShuffleSeed(`${Date.now()}:${Math.random()}`)
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
    theme,
    onToggleTheme: () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark')),
    onOpenProfile: () => {
      if (!currentUser) {
        navigate(routes.signin)
        return
      }

      navigate(routes.profile('me'))
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
    page = currentUser ? (
      <CreateEventPage
        categories={categoryOptions.filter((item) => item !== 'All Events')}
        locations={locationOptions.filter((item) => item !== 'All Philippines')}
        onCreateEvent={handleCreateEvent}
      />
    ) : (
      <SignInPage onAuthSuccess={handleAuthSuccess} />
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
        people={paginatedPeople}
        currentPage={activePeoplePage}
        totalPages={totalPeoplePages}
        totalPeople={connectPeople.length}
        onPageChange={setCurrentPeoplePage}
        onOpenProfile={(username) => navigate(routes.profile(username))}
      />
    )
  } else if (route.key === 'profile') {
    if (route.params?.username === 'me' && !currentUser) {
      page = <SignInPage onAuthSuccess={handleAuthSuccess} />
    } else if (isPublicProfileLoading && !activeProfile) {
      page = (
        <div className="profile-page">
          <section className="profile-card">
            <div className="section-block__heading">
              <h2>Loading profile</h2>
              <p>Pulling the latest account data from the database.</p>
            </div>
          </section>
        </div>
      )
    } else if (!activeProfile) {
      page = (
        <div className="profile-page">
          <section className="profile-card">
            <div className="section-block__heading">
              <h2>Profile not found</h2>
              <p>That user account could not be found.</p>
            </div>
          </section>
        </div>
      )
    } else {
      page = (
        <ProfilePage
          user={activeProfile}
          createdEvents={createdByProfile}
          savedEvents={savedByUser}
          likedEvents={likedByUser}
          attendingEvents={attendingByUser}
          isCurrentUser={isViewingCurrentUserProfile}
          onSaveProfile={handleProfileUpdate}
          activeTab={activeProfileTab}
          onTabChange={setActiveProfileTab}
          {...sharedPageProps}
        />
      )
    }
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
        onCategoryChange={handleCategoryChange}
        onDateFilterChange={handleDateFilterChange}
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
