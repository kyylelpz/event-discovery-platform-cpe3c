import { useEffect, useRef, useState } from 'react'
import { routes } from '../../utils/routing.js'
import brandLogo from '../../assets/eventcinity-logo.png'
import { PrimaryButton, SecondaryButton } from '../ui/Button.jsx'
import UserAvatar from '../ui/UserAvatar.jsx'
import { formatMemberSince } from '../../services/profileService.js'
import { getUserDisplayName, getUserSecondaryLabel } from '../../utils/userDisplay.js'
import {
  BellIcon,
  CalendarIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogInIcon,
  MapPinIcon,
  MessageCircleIcon,
  MenuIcon,
  MoonIcon,
  MoreVerticalIcon,
  PlusSquareIcon,
  SearchIcon,
  SunIcon,
  UserPlusIcon,
} from '../ui/Icons.jsx'
import SearchBar from '../ui/SearchBar.jsx'
import {
  formatCalendarMonth,
  formatDateKey,
  isSameCalendarDate,
  parseEventDate,
} from '../../utils/formatters.js'

function Navbar({
  currentPath,
  onNavigate,
  onGoToDashboard,
  searchTerm,
  onSearchChange,
  searchResults,
  onSearchSelect,
  onSearchFocus,
  onSearchBlur,
  showSearchResults,
  locations,
  selectedLocation,
  onLocationChange,
  availableDateCounts,
  selectedCalendarDate,
  onCalendarDateChange,
  onCalendarDateClear,
  currentUser,
  notifications = [],
  hasUnreadNotifications = false,
  onReadNotification,
  onRemoveNotification,
  theme,
  onToggleTheme,
  onOpenProfile,
  onOpenEvent,
  onSignOut,
}) {
  const isActive = (target) =>
    currentPath === target || currentPath.startsWith(`${target}/`)
  const isPeoplePage = isActive(routes.people)
  const searchPlaceholder = isPeoplePage ? 'Search people...' : 'Search events...'
  const searchAriaLabel = isPeoplePage ? 'Search people' : 'Search events'

  return (
    <header className="topbar">
      <div className="topbar__desktop">
        <button className="brandmark" type="button" onClick={onGoToDashboard}>
          <span className="brandmark__logo-frame" aria-hidden="true">
            <img className="brandmark__logo" src={brandLogo} alt="" />
          </span>
          <span className="brandmark__word">Eventcinity</span>
        </button>

        <div className="topbar__center">
          <SearchBar
            value={searchTerm}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            ariaLabel={searchAriaLabel}
            icon={<SearchIcon />}
            results={searchResults}
            onSelectResult={onSearchSelect}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            showResults={showSearchResults}
          />

          <label className="location-picker">
            <MapPinIcon />
            <select
              value={selectedLocation}
              onChange={(event) => onLocationChange(event.target.value)}
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

          <FindEventsDatePicker
            availableDateCounts={availableDateCounts}
            selectedDate={selectedCalendarDate}
            onDateChange={onCalendarDateChange}
            onClear={onCalendarDateClear}
          />
        </div>

        <nav className="topbar__nav" aria-label="Primary">
          <SecondaryButton
            isActive={isActive(routes.createEvent)}
            onClick={() => onNavigate(routes.createEvent)}
          >
            <PlusSquareIcon />
            Create
          </SecondaryButton>
          <SecondaryButton
            isActive={isActive(routes.people)}
            onClick={() => onNavigate(routes.people)}
          >
            <UserPlusIcon />
            <span>Connect</span>
          </SecondaryButton>

          {currentUser ? (
            <>
              <NotificationMenu
                notifications={notifications}
                hasUnreadNotifications={hasUnreadNotifications}
                onReadNotification={onReadNotification}
                onRemoveNotification={onRemoveNotification}
                onNavigate={onNavigate}
                onOpenEvent={onOpenEvent}
              />
              <ProfileMenu
                currentUser={currentUser}
                theme={theme}
                onToggleTheme={onToggleTheme}
                onOpenProfile={onOpenProfile}
                onSignOut={onSignOut}
              />
            </>
          ) : (
            <>
              <SecondaryButton
                isActive={isActive(routes.signin)}
                onClick={() => onNavigate(routes.signin)}
              >
                <LogInIcon />
                <span>Sign In</span>
              </SecondaryButton>
              <ThemeIconButton theme={theme} onToggleTheme={onToggleTheme} />
            </>
          )}
        </nav>
      </div>

      <MobileNavbar
        currentPath={currentPath}
        onNavigate={onNavigate}
        onGoToDashboard={onGoToDashboard}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        searchResults={searchResults}
        onSearchSelect={onSearchSelect}
        onSearchFocus={onSearchFocus}
        onSearchBlur={onSearchBlur}
        showSearchResults={showSearchResults}
        locations={locations}
        selectedLocation={selectedLocation}
        onLocationChange={onLocationChange}
        availableDateCounts={availableDateCounts}
        selectedCalendarDate={selectedCalendarDate}
        onCalendarDateChange={onCalendarDateChange}
        onCalendarDateClear={onCalendarDateClear}
        currentUser={currentUser}
        notifications={notifications}
        hasUnreadNotifications={hasUnreadNotifications}
        onReadNotification={onReadNotification}
        onRemoveNotification={onRemoveNotification}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenProfile={onOpenProfile}
        onOpenEvent={onOpenEvent}
        onSignOut={onSignOut}
      />
    </header>
  )
}

function MobileNavbar({
  currentPath,
  onNavigate,
  onGoToDashboard,
  searchTerm,
  onSearchChange,
  searchResults,
  onSearchSelect,
  onSearchFocus,
  onSearchBlur,
  showSearchResults,
  locations,
  selectedLocation,
  onLocationChange,
  availableDateCounts,
  selectedCalendarDate,
  onCalendarDateChange,
  onCalendarDateClear,
  currentUser,
  notifications = [],
  hasUnreadNotifications = false,
  onReadNotification,
  onRemoveNotification,
  theme,
  onToggleTheme,
  onOpenProfile,
  onOpenEvent,
  onSignOut,
}) {
  const isActive = (target) =>
    currentPath === target || currentPath.startsWith(`${target}/`)

  const toggleState = isActive(routes.events) ? 'events' : currentPath
  const isPeoplePage = isActive(routes.people)
  const searchPlaceholder = isPeoplePage ? 'Search people...' : 'Search events...'
  const searchAriaLabel = isPeoplePage ? 'Search people' : 'Search events'

  return (
    <details className="topbar__mobile" open={false}>
      <summary>
        <button
          className="brandmark"
          type="button"
          onClick={(event) => {
            event.preventDefault()
            onGoToDashboard()
          }}
        >
          <span className="brandmark__logo-frame" aria-hidden="true">
            <img className="brandmark__logo" src={brandLogo} alt="" />
          </span>
          <span className="brandmark__word">Eventcinity</span>
        </button>
        <span className="topbar__mobile-toggle">
          <MenuIcon className="menu-open" />
          <CloseIcon className="menu-close" />
        </span>
      </summary>

      <div className="topbar__mobile-panel">
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          ariaLabel={searchAriaLabel}
          icon={<SearchIcon />}
          results={searchResults}
          onSelectResult={onSearchSelect}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          showResults={showSearchResults}
        />

        <label className="location-picker">
          <MapPinIcon />
          <select
            value={selectedLocation}
            onChange={(event) => onLocationChange(event.target.value)}
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>

        <FindEventsDatePicker
          availableDateCounts={availableDateCounts}
          selectedDate={selectedCalendarDate}
          onDateChange={onCalendarDateChange}
          onClear={onCalendarDateClear}
          fullWidth
        />

        <div className="topbar__mobile-links">
          {currentUser ? (
            <div className="topbar__mobile-account-row">
              <NotificationMenu
                notifications={notifications}
                hasUnreadNotifications={hasUnreadNotifications}
                onReadNotification={onReadNotification}
                onRemoveNotification={onRemoveNotification}
                onNavigate={onNavigate}
                onOpenEvent={onOpenEvent}
                mobile
              />
              <ProfileMenu
                currentUser={currentUser}
                theme={theme}
                onToggleTheme={onToggleTheme}
                onOpenProfile={onOpenProfile}
                onSignOut={onSignOut}
                mobile
              />
            </div>
          ) : null}

          <SecondaryButton
            isActive={toggleState === routes.createEvent}
            onClick={() => onNavigate(routes.createEvent)}
          >
            <PlusSquareIcon />
            Create Event
          </SecondaryButton>
          <SecondaryButton
            isActive={toggleState === routes.people}
            onClick={() => onNavigate(routes.people)}
          >
            Connect with People
          </SecondaryButton>
          {!currentUser ? (
            <div className="topbar__mobile-auth-row">
              <SecondaryButton
                isActive={toggleState === routes.signin}
                onClick={() => onNavigate(routes.signin)}
              >
                Sign In
              </SecondaryButton>
              <ThemeIconButton theme={theme} onToggleTheme={onToggleTheme} />
            </div>
          ) : null}
        </div>
      </div>
    </details>
  )
}

function ThemeIconButton({ theme, onToggleTheme }) {
  return (
    <button
      type="button"
      className="mode-toggle-button"
      onClick={onToggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

function NotificationMenu({
  notifications = [],
  hasUnreadNotifications = false,
  onReadNotification,
  onRemoveNotification,
  onNavigate,
  onOpenEvent,
  mobile = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  return (
    <div
      ref={menuRef}
      className={`notification-menu ${mobile ? 'notification-menu--mobile' : ''}`}
    >
      <button
        type="button"
        className="notification-menu__trigger"
        aria-label={
          hasUnreadNotifications
            ? `Open notifications with ${unreadCount} unread item${
                unreadCount === 1 ? '' : 's'
              }`
            : 'Open notifications'
        }
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        title="Notifications"
      >
        <BellIcon />
        {hasUnreadNotifications ? (
          <span className="notification-menu__badge" aria-hidden="true" />
        ) : null}
      </button>

      {isOpen ? (
        <div className="notification-menu__panel">
          <div className="notification-menu__header">
            <h3>Notifications</h3>
            {hasUnreadNotifications ? (
              <span className="profile-menu__section-alert">New</span>
            ) : null}
          </div>

          {notifications.length ? (
            <div className="notification-menu__list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`profile-menu__notification ${
                    notification.isRead ? 'profile-menu__notification--read' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="profile-menu__notification-main"
                    onClick={() => {
                      onReadNotification?.(notification)
                      setIsOpen(false)

                      if (notification.eventId) {
                        onOpenEvent?.(notification.eventId)
                        return
                      }

                      if (notification.username) {
                        onNavigate?.(routes.profile(notification.username))
                      }
                    }}
                  >
                    <span className="profile-menu__notification-icon">
                      {notification.kind === 'follower' ? <UserPlusIcon /> : <MessageCircleIcon />}
                    </span>
                    <span className="profile-menu__notification-copy">
                      <strong>{notification.title}</strong>
                      <span>{notification.body}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="profile-menu__notification-remove"
                    aria-label={`Remove notification ${notification.title}`}
                    title="Remove notification"
                    onClick={(event) => {
                      event.stopPropagation()
                      onRemoveNotification?.(notification)
                    }}
                  >
                    <CloseIcon />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="profile-menu__empty">No notifications yet.</div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function ProfileMenu({
  currentUser,
  theme,
  onToggleTheme,
  onOpenProfile,
  onSignOut,
  mobile = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const interests = Array.isArray(currentUser.interests) ? currentUser.interests : []
  const displayName = getUserDisplayName(currentUser)
  const secondaryLabel = getUserSecondaryLabel(currentUser)
  const joinedLabel = formatMemberSince(currentUser.createdAt)
  const phoneLabel = currentUser.phone || 'Nothing here yet. Explore more events!'
  const bioLabel = currentUser.bio || 'Nothing here yet. Explore more events!'

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  return (
    <div
      ref={menuRef}
      className={`profile-menu ${mobile ? 'profile-menu--mobile' : ''}`}
    >
      <button
        type="button"
        className="topbar__account"
        aria-label={`Open profile for ${displayName}`}
        onClick={() => {
          setIsOpen(false)
          onOpenProfile?.()
        }}
      >
        <UserAvatar name={displayName} imageUrl={currentUser.profilePic} size="sm" />
      </button>

      <button
        type="button"
        className="profile-menu__trigger"
        aria-label="Open profile menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <MoreVerticalIcon />
      </button>

      <ThemeIconButton theme={theme} onToggleTheme={onToggleTheme} />

      {isOpen ? (
        <div className="profile-menu__panel">
          <div className="profile-menu__header">
            <UserAvatar name={displayName} imageUrl={currentUser.profilePic} size="lg" />
            <div className="profile-menu__identity">
              <h3>{displayName}</h3>
              {secondaryLabel ? <p>{secondaryLabel}</p> : null}
              <span>{currentUser.email}</span>
            </div>
          </div>

          <div className="profile-menu__info-grid">
            <div className="profile-menu__info-card">
              <h4>Member Since</h4>
              <p>{joinedLabel}</p>
            </div>

            <div className="profile-menu__info-card">
              <h4>Phone</h4>
              <p>{phoneLabel}</p>
            </div>
          </div>

          <div className="profile-menu__section">
            <h4>Bio</h4>
            <p>{bioLabel}</p>
          </div>

          <div className="profile-menu__section">
            <h4>Interests</h4>
            {interests.length ? (
              <div className="profile-menu__chips">
                {interests.map((interest) => (
                  <span key={interest} className="profile-menu__chip">
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <div className="profile-menu__empty">
                Nothing here yet. Explore more events!
              </div>
            )}
          </div>

          <div className="profile-menu__actions">
            <SecondaryButton
              className="profile-menu__action"
              onClick={() => {
                setIsOpen(false)
                onOpenProfile?.()
              }}
            >
              Open Profile
            </SecondaryButton>
          </div>

          <SecondaryButton
            className="profile-menu__signout"
            onClick={() => {
              setIsOpen(false)
              onSignOut()
            }}
          >
            Sign Out
          </SecondaryButton>
        </div>
      ) : null}
    </div>
  )
}

function FindEventsDatePicker({
  availableDateCounts,
  selectedDate,
  onDateChange,
  onClear,
  fullWidth = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [openMonth, setOpenMonth] = useState(null)
  const pickerRef = useRef(null)
  const parsedSelectedDate = parseEventDate(selectedDate) || new Date()
  const referenceMonth = new Date(
    parsedSelectedDate.getFullYear(),
    parsedSelectedDate.getMonth(),
    1,
  )
  const displayMonth = openMonth || referenceMonth

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleOutsideClick = (event) => {
      if (!pickerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  const monthStart = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1)
  const calendarStart = new Date(monthStart)
  calendarStart.setDate(monthStart.getDate() - monthStart.getDay())
  const monthEventCount = Object.entries(availableDateCounts).reduce(
    (count, [dateKey, eventCount]) => {
      const date = parseEventDate(dateKey)

      if (
        date &&
        date.getFullYear() === displayMonth.getFullYear() &&
        date.getMonth() === displayMonth.getMonth()
      ) {
        return count + Number(eventCount || 0)
      }

      return count
    },
    0,
  )
  const dayCells = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(calendarStart)
    day.setDate(calendarStart.getDate() + index)
    return day
  })

  return (
    <div
      ref={pickerRef}
      className={`find-events-picker ${fullWidth ? 'find-events-picker--full' : ''}`}
    >
      <PrimaryButton
        onClick={() => {
          setIsOpen((currentValue) => {
            const nextValue = !currentValue
            setOpenMonth(nextValue ? referenceMonth : null)
            return nextValue
          })
        }}
      >
        <CalendarIcon />
        <span>{selectedDate ? 'Change Date' : 'Find Events'}</span>
      </PrimaryButton>

      {isOpen ? (
        <div className="find-events-picker__panel">
          <div className="find-events-picker__header">
            <div className="find-events-picker__header-row">
              <button
                type="button"
                className="find-events-picker__nav"
                onClick={() =>
                  setOpenMonth(
                    new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1),
                  )
                }
                aria-label="Previous month"
              >
                <ChevronLeftIcon />
              </button>
              <strong>{formatCalendarMonth(displayMonth)}</strong>
              <button
                type="button"
                className="find-events-picker__nav"
                onClick={() =>
                  setOpenMonth(
                    new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1),
                  )
                }
                aria-label="Next month"
              >
                <ChevronRightIcon />
              </button>
            </div>
            <p className="find-events-picker__meta">
              {monthEventCount} event{monthEventCount === 1 ? '' : 's'} this month
            </p>
          </div>

          <div className="find-events-picker__weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayLabel) => (
              <span key={dayLabel}>{dayLabel}</span>
            ))}
          </div>

          <div className="find-events-picker__grid">
            {dayCells.map((day) => {
              const isOutsideMonth = day.getMonth() !== displayMonth.getMonth()
              const isSelected = selectedDate && isSameCalendarDate(day, selectedDate)
              const dateKey = formatDateKey(day)
              const eventCount = availableDateCounts[dateKey] || 0
              const isAvailable = eventCount > 0
              const densityClass =
                eventCount >= 4
                  ? 'find-events-picker__day--heavy'
                  : eventCount >= 2
                    ? 'find-events-picker__day--medium'
                    : isAvailable
                      ? 'find-events-picker__day--light'
                      : ''

              return (
                <button
                  key={`${dateKey}-${isOutsideMonth ? 'outside' : 'current'}`}
                  type="button"
                  className={`find-events-picker__day ${
                    isOutsideMonth ? 'find-events-picker__day--muted' : ''
                  } ${isAvailable ? 'find-events-picker__day--available' : ''} ${
                    isSelected ? 'find-events-picker__day--selected' : ''
                  } ${densityClass}`}
                  onClick={() => {
                    onDateChange(day)
                    setIsOpen(false)
                    setOpenMonth(null)
                  }}
                >
                  <span className="find-events-picker__day-number">{day.getDate()}</span>
                  {isAvailable ? (
                    <span className="find-events-picker__count">{eventCount}</span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="find-events-picker__footer">
            <button
              type="button"
              className="find-events-picker__link"
              onClick={() => {
                onDateChange(new Date())
                setIsOpen(false)
                setOpenMonth(null)
              }}
            >
              Today
            </button>
            <button
              type="button"
              className="find-events-picker__link"
              onClick={() => {
                onClear()
                setIsOpen(false)
                setOpenMonth(null)
              }}
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Navbar
