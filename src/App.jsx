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
import {
  createCreatedEvent,
  fetchCreatedEventsByCurrentUser,
  fetchCreatedEventsByUsername,
  fetchEventById,
  loadEventsByLocation,
  updateCreatedEvent,
} from './services/eventService.js'
import {
  clearSession,
  consumeHostedAuthRedirect,
  getSession,
  isHostedAuthEnvironment,
  saveCurrentUserProfile,
  setSession,
  signOut,
  syncStoredUser,
} from './services/authService.js'
import {
  buildEmptyInteractionState,
  fetchFollowingAttendees,
  fetchPublicAttendingEvents,
  fetchInteractionState,
  updateInteractionState,
} from './services/interactionService.js'
import {
  fetchNotifications,
  markNotificationAsRead,
  removeNotification as removePersistentNotification,
} from './services/notificationService.js'
import { fetchCurrentUserProfile } from './services/profileService.js'
import {
  fetchCommunityUsers,
  fetchPublicProfile,
  followUser,
  unfollowUser,
  normalizePublicUser,
} from './services/userService.js'
import {
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
const NOTIFICATION_READ_STORAGE_KEY = 'eventcinity_read_notifications'
const NOTIFICATION_DISMISSED_STORAGE_KEY = 'eventcinity_dismissed_notifications'

const mergeEvents = (...eventGroups) => {
  const merged = new Map()
  eventGroups.flat().forEach((event) => merged.set(event.id, event))
  return [...merged.values()]
}

const matchesEventId = (event, eventId) => {
  const normalizedEventId = String(eventId || '').trim()

  if (!normalizedEventId) {
    return false
  }

  return (
    String(event?.id || '').trim() === normalizedEventId ||
    String(event?.eventId || '').trim() === normalizedEventId
  )
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

const getFeaturedEventInterestLabel = (event, interestLabels = []) =>
  interestLabels.find(
    (interest) => scoreEventForInterests(event, normalizeInterestList([interest])) > 0,
  ) || ''

const buildFeaturedEventSlides = (
  events,
  interests = [],
  interestLabels = [],
  seedSource = '',
) => {
  if (!Array.isArray(events) || events.length === 0) {
    return []
  }

  const categoryEventMap = new Map()

  events.forEach((event) => {
    const normalizedCategory = String(event?.category || 'Community').trim().toLowerCase()

    if (!categoryEventMap.has(normalizedCategory)) {
      categoryEventMap.set(normalizedCategory, [])
    }

    categoryEventMap.get(normalizedCategory).push(event)
  })

  const scoredEvents = [...categoryEventMap.entries()]
    .map(([categoryKey, categoryEvents]) => {
      const rankedCategoryEvents = [...categoryEvents]
        .map((event) => ({
          event,
          interestScore: scoreEventForInterests(event, interests),
          featuredScore: Number(Boolean(event.isFeatured)),
          randomRank: getSeededIndex(
            Math.max(events.length * 97, 1),
            `${seedSource}:${categoryKey}:${event.id || event.title || 'event'}`,
          ),
          matchedInterest: getFeaturedEventInterestLabel(event, interestLabels),
        }))
        .sort((leftEvent, rightEvent) => {
          const randomDifference = leftEvent.randomRank - rightEvent.randomRank

          if (randomDifference !== 0) {
            return randomDifference
          }

          return compareEventsByNearestDate(leftEvent.event, rightEvent.event)
        })

      return rankedCategoryEvents[0]
    })
    .filter(Boolean)
    .sort((leftEvent, rightEvent) => {
      const interestDifference = rightEvent.interestScore - leftEvent.interestScore

      if (interestDifference !== 0) {
        return interestDifference
      }

      const featuredDifference = rightEvent.featuredScore - leftEvent.featuredScore

      if (featuredDifference !== 0) {
        return featuredDifference
      }

      const randomDifference = leftEvent.randomRank - rightEvent.randomRank

      if (randomDifference !== 0) {
        return randomDifference
      }

      return compareEventsByNearestDate(leftEvent.event, rightEvent.event)
    })
    .map(({ event, matchedInterest }) => ({
      event,
      matchedInterest,
    }))

  const startIndex = getSeededIndex(scoredEvents.length, seedSource)

  return [...scoredEvents.slice(startIndex), ...scoredEvents.slice(0, startIndex)]
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
  followersCount: Number(user.followersCount || 0),
  followingCount: Number(user.followingCount || 0),
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

const scorePersonSearchRelevance = (user, normalizedSearch) => {
  if (!normalizedSearch) {
    return 0
  }

  let score = 0
  const nameText = String(user.name || '').toLowerCase()
  const usernameText = String(user.username || '').toLowerCase()
  const locationText = String(user.location || '').toLowerCase()
  const bioText = String(user.bio || '').toLowerCase()
  const interestsText = Array.isArray(user.interests)
    ? user.interests.join(' ').toLowerCase()
    : ''
  const searchableText = [nameText, usernameText, locationText, bioText, interestsText].join(' ')

  if (nameText.includes(normalizedSearch)) {
    score += 8
  }

  if (usernameText.includes(normalizedSearch)) {
    score += 7
  }

  if (locationText.includes(normalizedSearch)) {
    score += 4
  }

  if (interestsText.includes(normalizedSearch)) {
    score += 3
  }

  if (searchableText.includes(normalizedSearch)) {
    score += 2
  }

  return score
}

const eventHasStartedAlready = (event) => {
  const eventDate = parseEventDate(event?.startDate)

  if (!eventDate) {
    return false
  }

  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const normalizedEventDate = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate(),
  )

  return normalizedEventDate.getTime() < startOfToday.getTime()
}

const buildNotificationId = (...parts) => parts.filter(Boolean).join(':')

const buildUpcomingNotificationBody = (type, timingLabel) => {
  if (type === 'created') {
    return `Your hosted event is happening ${timingLabel}.`
  }

  const actionLabel =
    type === 'saved'
      ? 'bookmarked'
      : type === 'hearted'
        ? 'favorited'
        : 'attending'

  return `Your ${actionLabel} event is happening ${timingLabel}.`
}

const buildUpcomingEventNotifications = (events, type) => {
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const nextWeek = new Date(startOfToday)
  nextWeek.setDate(startOfToday.getDate() + 7)

  return events
    .map((event) => {
      const eventDate = parseEventDate(event?.startDate)

      if (!eventDate) {
        return null
      }

      const normalizedEventDate = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate(),
      )

      if (
        normalizedEventDate.getTime() < startOfToday.getTime() ||
        normalizedEventDate.getTime() > nextWeek.getTime()
      ) {
        return null
      }

      const differenceInDays = Math.round(
        (normalizedEventDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
      )
      const timingLabel =
        differenceInDays === 0
          ? 'today'
          : differenceInDays === 1
            ? 'tomorrow'
            : `in ${differenceInDays} days`

      return {
        id: buildNotificationId(type, event.id || event.eventId),
        kind: 'event',
        title: event.title,
        body: buildUpcomingNotificationBody(type, timingLabel),
        eventId: event.id || event.eventId,
        dateSortKey: normalizedEventDate.getTime(),
      }
    })
    .filter(Boolean)
}

const getNotificationUserKey = (user) =>
  String(user?.email || user?.username || user?.id || '')
    .trim()
    .toLowerCase()

const readStoredNotificationMap = (storageKey) => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const parsedValue = JSON.parse(window.localStorage.getItem(storageKey) || '{}')

    return parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)
      ? parsedValue
      : {}
  } catch {
    return {}
  }
}

const readNotificationIdBucket = (storageKey, userKey) => {
  if (!userKey) {
    return []
  }

  const storedNotificationMap = readStoredNotificationMap(storageKey)
  const storedIds = storedNotificationMap[userKey]

  return Array.isArray(storedIds)
    ? storedIds.map((value) => String(value || '').trim()).filter(Boolean)
    : []
}

const persistNotificationIdBucket = (storageKey, userKey, notificationIds) => {
  if (typeof window === 'undefined' || !userKey) {
    return
  }

  const storedNotificationMap = readStoredNotificationMap(storageKey)
  storedNotificationMap[userKey] = Array.from(
    new Set(
      notificationIds
        .map((value) => String(value || '').trim())
        .filter(Boolean),
    ),
  ).slice(-200)

  window.localStorage.setItem(storageKey, JSON.stringify(storedNotificationMap))
}

const scoreUserForInterests = (user, interests = []) => {
  if (!interests.length || !user) {
    return 0
  }

  const userInterests = normalizeInterestList(user.interests)
  const searchableText = [user.name, user.username, user.location, user.bio]
    .join(' ')
    .toLowerCase()

  return interests.reduce((score, interest) => {
    if (!interest) {
      return score
    }

    if (userInterests.includes(interest)) {
      return score + 10
    }

    if (userInterests.some((userInterest) => userInterest.includes(interest) || interest.includes(userInterest))) {
      return score + 6
    }

    if (searchableText.includes(interest)) {
      return score + 2
    }

    return score
  }, 0)
}

function App() {
  const hostedRedirectSession = typeof window !== 'undefined' ? consumeHostedAuthRedirect() : null
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
  const [currentUser, setCurrentUser] = useState(() => hostedRedirectSession || getSession())
  const [showInterests, setShowInterests] = useState(
    () => Boolean((hostedRedirectSession || getSession())?.shouldShowInterestsPrompt),
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
  const [persistentNotifications, setPersistentNotifications] = useState([])
  const [readNotificationIds, setReadNotificationIds] = useState([])
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState([])
  const [activeProfileTab, setActiveProfileTab] = useState('Created Events')
  const [currentEventsPage, setCurrentEventsPage] = useState(1)
  const [currentPeoplePage, setCurrentPeoplePage] = useState(1)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [featuredShuffleSeed, setFeaturedShuffleSeed] = useState(
    () => `${Date.now()}:${Math.random()}`,
  )
  const [eventDetailRecord, setEventDetailRecord] = useState(null)
  const [isEventDetailLoading, setIsEventDetailLoading] = useState(false)
  const [followingAttendees, setFollowingAttendees] = useState([])
  const [isFollowingAttendeesLoading, setIsFollowingAttendeesLoading] = useState(false)
  const [pendingDashboardSection, setPendingDashboardSection] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const currentUserRef = useRef(currentUser)
  const recentAuthSuccessAtRef = useRef(0)
  const hostedSessionRestoreAttemptedRef = useRef(false)
  const route = resolveRoute(pathname)
  const {
    interactions,
    savedEvents: savedInteractionEvents,
    likedEvents: likedInteractionEvents,
    attendingEvents: attendingInteractionEvents,
  } = interactionState

  useEffect(() => {
    if (!hostedRedirectSession?.email) {
      return
    }

    recentAuthSuccessAtRef.current = Date.now()
    setCurrentUser(hostedRedirectSession)
    setShowInterests(Boolean(hostedRedirectSession.shouldShowInterestsPrompt))
    void syncStoredUser(hostedRedirectSession)
  }, [hostedRedirectSession])

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
    if (!pendingDashboardSection || route.key !== 'events') {
      return
    }

    const scrollTarget = window.document.getElementById(pendingDashboardSection)

    if (!scrollTarget) {
      return
    }

    scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setPendingDashboardSection('')
  }, [pendingDashboardSection, route.key, pathname])

  useEffect(() => {
    setSearchTerm('')
    setIsSearchFocused(false)
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
    const waitForRetry = (delayMs) =>
      new Promise((resolve) => {
        window.setTimeout(resolve, delayMs)
      })

    const restoreHostedSession = async () => {
      for (let attempt = 0; attempt < 3; attempt += 1) {
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
          return
        } catch (error) {
          const isRetryableAuthMiss = [401, 403, 404].includes(error?.status)

          if (!isActive) {
            return
          }

          if (!isRetryableAuthMiss || attempt === 2) {
            if (!isRetryableAuthMiss) {
              console.warn('Unable to restore the hosted session:', error)
            }
            return
          }

          await waitForRetry(450)
        }
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
      const latestUser = currentUserRef.current || activeUser

      try {
        const profile = await fetchCurrentUserProfile(latestUser)

        if (!isActive) {
          return
        }

        const nextSession = { ...latestUser, ...profile }
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

    const handleWindowFocus = () => {
      if (document.visibilityState === 'visible') {
        void syncCurrentUserProfile()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncCurrentUserProfile()
      }
    }

    const profileRefreshInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void syncCurrentUserProfile()
      }
    }, 30_000)

    window.addEventListener('focus', handleWindowFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isActive = false
      window.removeEventListener('focus', handleWindowFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.clearInterval(profileRefreshInterval)
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
    if (!currentUser?.email) {
      setCreatedEvents([])
      return undefined
    }

    let isActive = true

    const loadCurrentUserCreatedEvents = async () => {
      try {
        const events = await fetchCreatedEventsByCurrentUser()

        if (!isActive) {
          return
        }

        setCreatedEvents(events)
      } catch (error) {
        if (!isActive) {
          return
        }

        console.warn('Unable to load created events for notification reminders:', error)
      }
    }

    void loadCurrentUserCreatedEvents()

    return () => {
      isActive = false
    }
  }, [currentUser?.email])

  useEffect(() => {
    if (!currentUser?.email) {
      setPersistentNotifications([])
      return undefined
    }

    let isActive = true

    const syncNotifications = async () => {
      try {
        const nextNotifications = await fetchNotifications()

        if (!isActive) {
          return
        }

        setPersistentNotifications(nextNotifications)
      } catch (error) {
        if (!isActive) {
          return
        }

        console.warn('Unable to load notifications:', error)
        setPersistentNotifications([])
      }
    }

    void syncNotifications()

    const handleWindowFocus = () => {
      if (document.visibilityState === 'visible') {
        void syncNotifications()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncNotifications()
      }
    }

    const notificationRefreshInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void syncNotifications()
      }
    }, 30_000)

    window.addEventListener('focus', handleWindowFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isActive = false
      window.removeEventListener('focus', handleWindowFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.clearInterval(notificationRefreshInterval)
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

  const navigateToDashboardSection = (sectionId) => {
    setCurrentEventsPage(1)
    setPendingDashboardSection(sectionId)
    navigate(routes.events)
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
    navigate(routes.events)
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
    const previousUsername = String(currentUser?.username || '').trim()
    const nextSession = await saveCurrentUserProfile(updates, {
      fallbackEmail: currentUser?.email,
    })

    setCurrentUser(nextSession)
    setCommunityUsers((prevUsers) => mergeCommunityUsers(prevUsers, [nextSession]))

    if (
      route.key === 'profile' &&
      isViewingCurrentUserProfile &&
      nextSession.username &&
      nextSession.username !== previousUsername
    ) {
      navigate(routes.profile(nextSession.username))
    }

    return nextSession
  }

  const handleToggleFollow = async (targetUser) => {
    if (!currentUser?.email) {
      navigate(routes.signin)
      return
    }

    const targetUsername = String(targetUser?.username || '').trim().toLowerCase()

    if (!targetUsername || targetUsername === String(currentUser?.username || '').trim().toLowerCase()) {
      return
    }

    const isFollowing = Array.isArray(currentUser?.followingUsernames)
      ? currentUser.followingUsernames.includes(targetUsername)
      : false

    const response = isFollowing
      ? await unfollowUser(targetUsername)
      : await followUser(targetUsername)

    const nextCurrentUser = response?.currentUser ? { ...currentUser, ...response.currentUser } : currentUser
    const nextTargetUser = response?.targetUser ? normalizePublicUser(response.targetUser) : null

    if (nextCurrentUser) {
      setCurrentUser(nextCurrentUser)
      setSession(nextCurrentUser)
      void syncStoredUser(nextCurrentUser)
    }

    if (nextTargetUser) {
      setCommunityUsers((prevUsers) => mergeCommunityUsers(prevUsers, [nextTargetUser]))
      if (
        activePublicProfile &&
        String(activePublicProfile.username || '').trim().toLowerCase() === targetUsername
      ) {
        setActivePublicProfile((currentProfile) =>
          currentProfile ? { ...currentProfile, ...nextTargetUser } : nextTargetUser,
        )
      }
    }
  }

  const handleSignOut = () => {
    recentAuthSuccessAtRef.current = 0
    signOut()
    setCurrentUser(null)
    setInteractionState(buildEmptyInteractionState())
    setPersistentNotifications([])
    setFollowingAttendees([])
    setShowInterests(false)
    navigate(routes.events)
  }

  const currentUserEmail = String(currentUser?.email || '').trim().toLowerCase()
  const currentNotificationUserKey = getNotificationUserKey(currentUser)
  const currentUserProfileSlug = currentUser ? getUserProfileSlug(currentUser) : ''
  const currentFollowingUsernames = useMemo(
    () =>
      new Set(
        Array.isArray(currentUser?.followingUsernames)
          ? currentUser.followingUsernames
              .map((value) => String(value || '').trim().toLowerCase())
              .filter(Boolean)
          : [],
      ),
    [currentUser?.followingUsernames],
  )
  const currentFollowerUsernames = useMemo(
    () =>
      Array.isArray(currentUser?.followerUsernames)
        ? currentUser.followerUsernames
            .map((value) => String(value || '').trim().toLowerCase())
            .filter(Boolean)
        : [],
    [currentUser?.followerUsernames],
  )
  const currentUserInterestLabels = Array.isArray(currentUser?.interests)
    ? currentUser.interests
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    : []
  const currentUserInterests = normalizeInterestList(currentUserInterestLabels)
  const currentUserCreatedEvents = useMemo(
    () => (currentUser?.email ? mergeEvents(createdEvents, profileCreatedEvents) : []),
    [createdEvents, currentUser?.email, profileCreatedEvents],
  )

  useEffect(() => {
    setReadNotificationIds(
      readNotificationIdBucket(NOTIFICATION_READ_STORAGE_KEY, currentNotificationUserKey),
    )
    setDismissedNotificationIds(
      readNotificationIdBucket(
        NOTIFICATION_DISMISSED_STORAGE_KEY,
        currentNotificationUserKey,
      ),
    )
  }, [currentNotificationUserKey])

  const handleReadNotification = async (notification) => {
    const normalizedNotificationId = String(notification?.id || notification || '').trim()

    if (!normalizedNotificationId || !currentNotificationUserKey) {
      return
    }

    if (notification?.isPersistent) {
      try {
        const nextNotification = await markNotificationAsRead(normalizedNotificationId)

        if (nextNotification) {
          setPersistentNotifications((currentNotifications) =>
            currentNotifications.map((item) =>
              item.id === normalizedNotificationId ? nextNotification : item,
            ),
          )
        }
      } catch (error) {
        console.warn('Unable to mark the notification as read:', error)
      }
    }

    setReadNotificationIds((currentIds) => {
      if (currentIds.includes(normalizedNotificationId)) {
        return currentIds
      }

      const nextIds = [...currentIds, normalizedNotificationId]
      persistNotificationIdBucket(
        NOTIFICATION_READ_STORAGE_KEY,
        currentNotificationUserKey,
        nextIds,
      )
      return nextIds
    })
  }

  const handleRemoveNotification = async (notification) => {
    const normalizedNotificationId = String(notification?.id || notification || '').trim()

    if (!normalizedNotificationId || !currentNotificationUserKey) {
      return
    }

    if (notification?.isPersistent) {
      let removed = false

      try {
        removed = await removePersistentNotification(normalizedNotificationId)
      } catch (error) {
        console.warn('Unable to remove the notification:', error)
      }

      if (!removed) {
        return
      }

      setPersistentNotifications((currentNotifications) =>
        currentNotifications.filter((item) => item.id !== normalizedNotificationId),
      )
    }

    setDismissedNotificationIds((currentIds) => {
      if (currentIds.includes(normalizedNotificationId)) {
        return currentIds
      }

      const nextIds = [...currentIds, normalizedNotificationId]
      persistNotificationIdBucket(
        NOTIFICATION_DISMISSED_STORAGE_KEY,
        currentNotificationUserKey,
        nextIds,
      )
      return nextIds
    })
  }

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
      [...communityDirectory.filter((user) => {
        const isCurrentUserEntry =
          (currentUser?.id && user.id === currentUser.id) ||
          (currentUser?.username && user.username === currentUser.username) ||
          (currentUserEmail && user.email === currentUserEmail)

        return !isCurrentUserEntry
      })].sort((leftUser, rightUser) => {
        const interestDifference =
          scoreUserForInterests(rightUser, currentUserInterests) -
          scoreUserForInterests(leftUser, currentUserInterests)

        if (interestDifference !== 0) {
          return interestDifference
        }

        return compareCommunityUsers(leftUser, rightUser)
      }),
    [
      communityDirectory,
      currentUser?.id,
      currentUser?.username,
      currentUserEmail,
      currentUserInterests,
    ],
  )
  const selectedCalendarDate =
    route.key === 'events-date' ? parseEventDate(route.params?.dateKey) : null
  const isPeopleSearchMode = route.key === 'people'
  const allEvents = mergeEvents(
    savedInteractionEvents,
    likedInteractionEvents,
    attendingInteractionEvents,
    remoteEvents,
    createdEvents,
    profileCreatedEvents,
    profileAttendingEvents,
  ).filter((event) => !eventHasStartedAlready(event))
  const normalizedSearch = deferredSearchTerm.trim().toLowerCase()
  const isCalendarDateMode = Boolean(selectedCalendarDate)
  const filteredConnectPeople = useMemo(() => {
    if (!isPeopleSearchMode || !normalizedSearch) {
      return connectPeople
    }

    return connectPeople.filter((person) =>
      [
        person.name,
        person.username,
        person.location,
        person.bio,
        ...(Array.isArray(person.interests) ? person.interests : []),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    )
  }, [connectPeople, isPeopleSearchMode, normalizedSearch])
  const totalPeoplePages = Math.max(1, Math.ceil(filteredConnectPeople.length / PEOPLE_PER_PAGE))
  const activePeoplePage = Math.min(currentPeoplePage, totalPeoplePages)
  const paginatedPeople = filteredConnectPeople.slice(
    (activePeoplePage - 1) * PEOPLE_PER_PAGE,
    activePeoplePage * PEOPLE_PER_PAGE,
  )
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

    score += scoreEventForInterests(event, currentUserInterests) * 2

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

    const dateDifference = compareByNearestDate(leftEvent, rightEvent)

    if (dateDifference !== 0) {
      return dateDifference
    }

    const interestDifference =
      scoreEventForInterests(rightEvent, currentUserInterests) -
      scoreEventForInterests(leftEvent, currentUserInterests)

    if (interestDifference !== 0) {
      return interestDifference
    }

    return `${leftEvent.title}`.localeCompare(`${rightEvent.title}`)
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
  const featuredEventSlides = useMemo(
    () =>
      buildFeaturedEventSlides(
        allEvents,
        currentUserInterests,
        currentUserInterestLabels,
        featuredRotationSeed,
      ),
    [allEvents, currentUserInterests, currentUserInterestLabels, featuredRotationSeed],
  )

  const searchResults = !normalizedSearch
    ? []
    : isPeopleSearchMode
      ? [...filteredConnectPeople]
          .sort((leftUser, rightUser) => {
            const relevanceDifference =
              scorePersonSearchRelevance(rightUser, normalizedSearch) -
              scorePersonSearchRelevance(leftUser, normalizedSearch)

            if (relevanceDifference !== 0) {
              return relevanceDifference
            }

            return compareCommunityUsers(leftUser, rightUser)
          })
          .slice(0, 6)
          .map((person) => ({
            id: person.username || person.id,
            title: person.name || `@${person.username}`,
            location: `@${person.username}${person.location ? ` · ${person.location}` : ''}`,
            username: person.username,
          }))
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
  const currentEvent = allEvents.find((event) => {
    const routeEventId = String(route.params?.eventId || '').trim()
    return matchesEventId(event, routeEventId)
  })
  const resolvedEventDetail = currentEvent || eventDetailRecord
  const isViewingCurrentUserProfile =
    route.key === 'profile' &&
    currentUser &&
    ['me', currentUserProfileSlug].includes(route.params?.username)

  useEffect(() => {
    if (!['event-detail', 'edit-event'].includes(route.key)) {
      setEventDetailRecord(null)
      setIsEventDetailLoading(false)
      return undefined
    }

    const routeEventId = String(route.params?.eventId || '').trim()

    if (!routeEventId) {
      setEventDetailRecord(null)
      setIsEventDetailLoading(false)
      return undefined
    }

    if (currentEvent) {
      setEventDetailRecord(currentEvent)
      setIsEventDetailLoading(false)
      return undefined
    }

    let isActive = true
    setIsEventDetailLoading(true)

    const loadEventDetail = async () => {
      try {
        const event = await fetchEventById(routeEventId)

        if (!isActive) {
          return
        }

        setEventDetailRecord(event)
      } catch (error) {
        if (!isActive) {
          return
        }

        console.warn('Unable to load the selected event detail:', error)
        setEventDetailRecord(null)
      } finally {
        if (isActive) {
          setIsEventDetailLoading(false)
        }
      }
    }

    void loadEventDetail()

    return () => {
      isActive = false
    }
  }, [route.key, route.params?.eventId, currentEvent])

  useEffect(() => {
    if (route.key !== 'event-detail' || !resolvedEventDetail?.id || !currentUser?.email) {
      setFollowingAttendees([])
      setIsFollowingAttendeesLoading(false)
      return undefined
    }

    let isActive = true
    setIsFollowingAttendeesLoading(true)

    const loadFollowingAttendeesForEvent = async () => {
      try {
        const attendees = await fetchFollowingAttendees(resolvedEventDetail.id)

        if (!isActive) {
          return
        }

        setFollowingAttendees(attendees)
      } catch (error) {
        if (!isActive) {
          return
        }

        console.warn('Unable to load followed attendees for the selected event:', error)
        setFollowingAttendees([])
      } finally {
        if (isActive) {
          setIsFollowingAttendeesLoading(false)
        }
      }
    }

    void loadFollowingAttendeesForEvent()

    return () => {
      isActive = false
    }
  }, [route.key, resolvedEventDetail?.id, currentUser?.email])

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
        setCreatedEvents((currentEvents) => mergeEvents(currentEvents, events))
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
        ...(communityDirectory.find((user) => {
          const normalizedCurrentUsername = String(currentUser?.username || '').trim()
          const normalizedCurrentEmail = String(currentUser?.email || '').trim().toLowerCase()

          return (
            (currentUser?.id && user.id === currentUser.id) ||
            (normalizedCurrentUsername && user.username === normalizedCurrentUsername) ||
            (normalizedCurrentEmail && user.email === normalizedCurrentEmail)
          )
        }) || {}),
        ...currentUser,
        username: currentUser.username || currentUserProfileSlug,
      }
    : activePublicProfile
  const userNotifications = useMemo(() => {
    if (!currentUser?.email) {
      return []
    }

    const readNotificationIdSet = new Set(readNotificationIds)
    const dismissedNotificationIdSet = new Set(dismissedNotificationIds)
    const upcomingNotifications = [
      ...buildUpcomingEventNotifications(savedInteractionEvents, 'saved'),
      ...buildUpcomingEventNotifications(likedInteractionEvents, 'hearted'),
      ...buildUpcomingEventNotifications(attendingInteractionEvents, 'attending'),
      ...buildUpcomingEventNotifications(currentUserCreatedEvents, 'created'),
    ].map((notification) => ({
      ...notification,
      isRead: readNotificationIdSet.has(notification.id),
      isPersistent: false,
      sortDirection: 'asc',
    }))

    const followerNotifications = currentFollowerUsernames
      .map((username) => {
        const followerProfile =
          communityDirectory.find((user) => String(user.username || '').trim().toLowerCase() === username) ||
          null

        return {
          id: buildNotificationId('follower', username),
          kind: 'follower',
          title: followerProfile?.name || username,
          body: 'Started following your profile.',
          username,
          dateSortKey: Number.MAX_SAFE_INTEGER,
          isRead: readNotificationIdSet.has(buildNotificationId('follower', username)),
          isPersistent: false,
          sortDirection: 'desc',
        }
      })
    const remoteNotifications = persistentNotifications.map((notification) => ({
      ...notification,
      isRead: Boolean(notification.isRead || readNotificationIdSet.has(notification.id)),
      isPersistent: true,
    }))
    const notificationPriority = {
      follower: 0,
      'shared-attendance': 1,
      event: 2,
    }

    return [...remoteNotifications, ...followerNotifications, ...upcomingNotifications]
      .filter((notification) => !dismissedNotificationIdSet.has(notification.id))
      .sort((leftNotification, rightNotification) => {
        const unreadDifference =
          Number(leftNotification.isRead) - Number(rightNotification.isRead)

        if (unreadDifference !== 0) {
          return unreadDifference
        }

        const priorityDifference =
          (notificationPriority[leftNotification.kind] ?? 3) -
          (notificationPriority[rightNotification.kind] ?? 3)

        if (priorityDifference !== 0) {
          return priorityDifference
        }

        if (
          leftNotification.sortDirection === 'asc' &&
          rightNotification.sortDirection === 'asc'
        ) {
          return leftNotification.dateSortKey - rightNotification.dateSortKey
        }

        return rightNotification.dateSortKey - leftNotification.dateSortKey
      })
  }, [
    attendingInteractionEvents,
    communityDirectory,
    currentUser?.email,
    currentUserCreatedEvents,
    currentFollowerUsernames,
    dismissedNotificationIds,
    likedInteractionEvents,
    persistentNotifications,
    readNotificationIds,
    savedInteractionEvents,
  ])

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
  const relatedEvents = resolvedEventDetail
    ? allEvents.filter((e) =>
        e.id !== resolvedEventDetail.id &&
        (e.category === resolvedEventDetail.category ||
          e.province === resolvedEventDetail.province)
      )
    : []
  const currentResolvedEventOwnerId = String(resolvedEventDetail?.ownerId || '').trim()
  const currentResolvedEventCreator = String(resolvedEventDetail?.createdBy || '')
    .trim()
    .toLowerCase()
  const normalizedResolvedEventHost = String(resolvedEventDetail?.host || '')
    .trim()
    .toLowerCase()
  const currentUserId = String(currentUser?.id || '').trim()
  const currentUsername = String(currentUser?.username || '').trim().toLowerCase()
  const canCurrentUserEditResolvedEvent =
    resolvedEventDetail?.source === 'created' &&
    ((currentUserId &&
      currentResolvedEventOwnerId &&
      currentUserId === currentResolvedEventOwnerId) ||
      (currentUsername &&
        currentResolvedEventCreator &&
        currentUsername === currentResolvedEventCreator))
  const eventHostProfileUsername =
    resolvedEventDetail && communityDirectory.length
      ? (() => {
          const matchedUser = communityDirectory.find((user) => {
            const normalizedUsername = String(user.username || '').trim().toLowerCase()
            const normalizedName = String(user.name || '').trim().toLowerCase()

            return (
              (currentResolvedEventOwnerId && user.id === currentResolvedEventOwnerId) ||
              (currentResolvedEventCreator &&
                normalizedUsername === currentResolvedEventCreator) ||
              (normalizedResolvedEventHost &&
                (normalizedUsername === normalizedResolvedEventHost ||
                  normalizedName === normalizedResolvedEventHost))
            )
          })

          return String(matchedUser?.username || '').trim().toLowerCase()
        })()
      : ''

  const buildCreatedEventPayload = (formData) => {
    const payload = new FormData()
    payload.append('title', formData.title)
    payload.append('description', formData.description)
    payload.append('date', formData.date)
    payload.append('time', formData.time)
    payload.append('venue', formData.venue)
    payload.append('address', formData.address)
    payload.append('location', formData.address || formData.venue || formData.province)
    payload.append('googleMapsUrl', formData.googleMapsUrl)
    payload.append('province', formData.province)
    payload.append('category', formData.category)

    if (formData.imageFile) {
      payload.append('image', formData.imageFile)
    }

    return payload
  }

  const assertFutureEventSchedule = (formData, actionLabel = 'save') => {
    const now = new Date()
    const [year, month, day] = String(formData.date || '')
      .split('-')
      .map((value) => Number(value))
    const [hours, minutes] = String(formData.time || '')
      .split(':')
      .map((value) => Number(value))
    const eventDateTime = new Date(
      year || 0,
      (month || 1) - 1,
      day || 1,
      hours || 0,
      minutes || 0,
    )

    if (Number.isNaN(eventDateTime.getTime()) || eventDateTime.getTime() < now.getTime()) {
      throw new Error(`Choose a future date and time for your event before you ${actionLabel} it.`)
    }
  }

  const syncCreatedEventState = (nextEvent, { incrementCreatedCount = false } = {}) => {
    setCreatedEvents((prevEvents) => mergeEvents(prevEvents, [nextEvent]))
    setProfileCreatedEvents((prevEvents) => mergeEvents(prevEvents, [nextEvent]))
    setEventDetailRecord((currentRecord) =>
      currentRecord && matchesEventId(currentRecord, nextEvent.id) ? nextEvent : currentRecord,
    )

    if (!incrementCreatedCount) {
      return
    }

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
  }

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

      if (key === 'attending' && currentUser?.email) {
        try {
          const nextNotifications = await fetchNotifications()
          setPersistentNotifications(nextNotifications)
        } catch (error) {
          console.warn('Unable to refresh notifications after updating attendance:', error)
        }
      }
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

    assertFutureEventSchedule(formData, 'create')

    try {
      const createdEvent = await createCreatedEvent(buildCreatedEventPayload(formData))
      syncCreatedEventState(createdEvent, { incrementCreatedCount: true })
      navigate(routes.eventDetail(createdEvent.id))
    } catch (err) {
      console.error('Upload failed:', err.message)
      if ([401, 403].includes(err?.status)) {
        navigate(routes.signin)
      }
      throw err
    }
  }

  const handleUpdateEvent = async (eventId, formData) => {
    if (!currentUser?.email) {
      navigate(routes.signin)
      throw new Error('Sign in to edit your event.')
    }

    assertFutureEventSchedule(formData, 'save')

    try {
      const updatedEvent = await updateCreatedEvent(eventId, buildCreatedEventPayload(formData))
      syncCreatedEventState(updatedEvent)
      setEventDetailRecord(updatedEvent)
      navigate(routes.eventDetail(updatedEvent.id))
    } catch (error) {
      if (error?.status === 401) {
        navigate(routes.signin)
      }

      throw error
    }
  }


  const navProps = {
    currentPath: pathname === '/' ? routes.events : pathname,
    onNavigate: navigate,
    onGoToDashboard: () => {
      setFeaturedShuffleSeed(`${Date.now()}:${Math.random()}`)
      navigateToDashboardSection('dashboard-top')
    },
    onNavigateToDashboardSection: navigateToDashboardSection,
    searchTerm,
    onSearchChange: handleSearchChange,
    searchResults,
    onSearchSelect: (event) => {
      setIsSearchFocused(false)

      if (isPeopleSearchMode && event.username) {
        navigate(routes.profile(event.username))
        return
      }

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
    notifications: userNotifications,
    hasUnreadNotifications: userNotifications.some((notification) => !notification.isRead),
    onReadNotification: handleReadNotification,
    onRemoveNotification: handleRemoveNotification,
    theme,
    onToggleTheme: () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark')),
    onOpenProfile: () => {
      if (!currentUser) {
        navigate(routes.signin)
        return
      }

      navigate(routes.profile('me'))
    },
    onOpenEvent: (eventId) => navigate(routes.eventDetail(eventId)),
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
        onSubmitEvent={handleCreateEvent}
      />
    ) : (
      <SignInPage onAuthSuccess={handleAuthSuccess} />
    )
  } else if (route.key === 'edit-event') {
    if (!currentUser) {
      page = <SignInPage onAuthSuccess={handleAuthSuccess} />
    } else if (isEventDetailLoading && !resolvedEventDetail) {
      page = (
        <div className="page-stack page-stack--detail">
          <section className="detail-hero">
            <div className="detail-layout">
              <div className="detail-layout__main">
                <div className="section-block__heading">
                  <h2>Loading event</h2>
                  <p>Pulling the latest event details before editing.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )
    } else if (!resolvedEventDetail) {
      page = (
        <div className="page-stack page-stack--detail">
          <section className="detail-hero">
            <div className="detail-layout">
              <div className="detail-layout__main">
                <div className="section-block__heading">
                  <h2>Event not found</h2>
                  <p>This event could not be found in the stored catalog.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )
    } else if (!canCurrentUserEditResolvedEvent) {
      page = (
        <div className="page-stack page-stack--detail">
          <section className="detail-hero">
            <div className="detail-layout">
              <div className="detail-layout__main">
                <div className="section-block__heading">
                  <h2>Editing not allowed</h2>
                  <p>Only the account that created this event can edit it.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )
    } else {
      page = (
        <CreateEventPage
          categories={categoryOptions.filter((item) => item !== 'All Events')}
          locations={locationOptions.filter((item) => item !== 'All Philippines')}
          initialValues={{
            title: resolvedEventDetail.title,
            description: resolvedEventDetail.description,
            date: resolvedEventDetail.startDate,
            time: resolvedEventDetail.timeValue || resolvedEventDetail.timeLabel,
            venue: resolvedEventDetail.venue,
            address: resolvedEventDetail.address,
            googleMapsUrl: resolvedEventDetail.venueGoogleMapsUrl,
            province: resolvedEventDetail.province,
            category: resolvedEventDetail.category,
            image: resolvedEventDetail.image,
          }}
          pageTitle="Edit Event"
          pageCopy="Update your event details and keep attendees in the loop."
          submitLabel="Save Changes"
          submittingLabel="Saving Changes..."
          submissionErrorMessage="Unable to save your event changes right now."
          onSubmitEvent={(formData) => handleUpdateEvent(resolvedEventDetail.id, formData)}
          onCancel={() => navigate(routes.eventDetail(resolvedEventDetail.id))}
        />
      )
    }
  } else if (route.key === 'event-detail') {
    if (isEventDetailLoading && !resolvedEventDetail) {
      page = (
        <div className="page-stack page-stack--detail">
          <section className="detail-hero">
            <div className="detail-layout">
              <div className="detail-layout__main">
                <div className="section-block__heading">
                  <h2>Loading event</h2>
                  <p>Pulling the latest event details from the catalog.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )
    } else if (!resolvedEventDetail) {
      page = (
        <div className="page-stack page-stack--detail">
          <section className="detail-hero">
            <div className="detail-layout">
              <div className="detail-layout__main">
                <div className="section-block__heading">
                  <h2>Event not found</h2>
                  <p>This event could not be found in the stored catalog.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )
    } else {
      page = (
        <EventDetailPage
          event={resolvedEventDetail}
          relatedEvents={relatedEvents.slice(0, 3)}
          onNavigate={navigate}
          currentUser={currentUser}
          hostProfileUsername={eventHostProfileUsername}
          followingAttendees={followingAttendees}
          isFollowingAttendeesLoading={isFollowingAttendeesLoading}
          onOpenProfile={(username) => navigate(routes.profile(username))}
          onEditEvent={(event) => navigate(routes.editEvent(event.id))}
          {...sharedPageProps}
        />
      )
    }
  } else if (route.key === 'people') {
    page = (
      <PeoplePage
        people={paginatedPeople}
        currentPage={activePeoplePage}
        totalPages={totalPeoplePages}
        totalPeople={filteredConnectPeople.length}
        onPageChange={setCurrentPeoplePage}
        onOpenProfile={(username) => navigate(routes.profile(username))}
        onToggleFollow={handleToggleFollow}
        currentUsername={currentUser?.username || ''}
        currentFollowingUsernames={currentFollowingUsernames}
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
          onToggleFollow={handleToggleFollow}
          isFollowing={currentFollowingUsernames.has(
            String(activeProfile?.username || '').trim().toLowerCase(),
          )}
          communityUsers={communityDirectory}
          onOpenProfile={(username) => navigate(routes.profile(username))}
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
        featuredEvents={featuredEventSlides}
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
