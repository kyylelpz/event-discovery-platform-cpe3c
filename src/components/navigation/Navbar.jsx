import { useEffect, useRef, useState } from 'react'
import { routes } from '../../utils/routing.js'
import brandLogo from '../../assets/eventcinity-logo.png'
import { PrimaryButton, SecondaryButton } from '../ui/Button.jsx'
import UserAvatar from '../ui/UserAvatar.jsx'
import { formatMemberSince } from '../../services/profileService.js'
import {
  CalendarIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogInIcon,
  MapPinIcon,
  MenuIcon,
  MoreVerticalIcon,
  PlusSquareIcon,
  SearchIcon,
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
  onOpenProfile,
  onSignOut,
}) {
  const isActive = (target) =>
    currentPath === target || currentPath.startsWith(`${target}/`)

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
            placeholder="Search events..."
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
            <ProfileMenu
              currentUser={currentUser}
              onOpenProfile={onOpenProfile}
              onSignOut={onSignOut}
            />
          ) : (
            <SecondaryButton
              isActive={isActive(routes.signin)}
              onClick={() => onNavigate(routes.signin)}
            >
              <LogInIcon />
              <span>Sign In</span>
            </SecondaryButton>
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
        onOpenProfile={onOpenProfile}
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
  onOpenProfile,
  onSignOut,
}) {
  const isActive = (target) =>
    currentPath === target || currentPath.startsWith(`${target}/`)

  const toggleState = isActive(routes.events) ? 'events' : currentPath

  return (
    <details className="topbar__mobile" open={false}>
      <summary>
        <button className="brandmark" type="button" onClick={onGoToDashboard}>
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
          placeholder="Search events..."
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
            <ProfileMenu
              currentUser={currentUser}
              onOpenProfile={onOpenProfile}
              onSignOut={onSignOut}
              mobile
            />
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
            <SecondaryButton
              isActive={toggleState === routes.signin}
              onClick={() => onNavigate(routes.signin)}
            >
              Sign In
            </SecondaryButton>
          ) : null}
        </div>
      </div>
    </details>
  )
}

function ProfileMenu({ currentUser, onOpenProfile, onSignOut, mobile = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const interests = Array.isArray(currentUser.interests) ? currentUser.interests : []
  const displayName = currentUser.name || currentUser.username || 'Eventcinity user'
  const usernameLabel = currentUser.username ? `@${currentUser.username}` : displayName
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
        <div className="topbar__account-copy">
          <strong>{displayName}</strong>
          <span>{currentUser.email}</span>
        </div>
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

      {isOpen ? (
        <div className="profile-menu__panel">
          <div className="profile-menu__header">
            <UserAvatar name={displayName} imageUrl={currentUser.profilePic} size="lg" />
            <div className="profile-menu__identity">
              <h3>{displayName}</h3>
              <p>{usernameLabel}</p>
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
  const [displayMonth, setDisplayMonth] = useState(() => {
    const initialDate = parseEventDate(selectedDate) || new Date()
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  })
  const pickerRef = useRef(null)

  useEffect(() => {
    const parsedDate = parseEventDate(selectedDate)

    if (parsedDate) {
      setDisplayMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1))
    }
  }, [selectedDate])

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
          setIsOpen((currentValue) => !currentValue)
        }}
      >
        <CalendarIcon />
        <span>{selectedDate ? 'Change Date' : 'Find Events'}</span>
      </PrimaryButton>

      {isOpen ? (
        <div className="find-events-picker__panel">
          <div className="find-events-picker__header">
            <button
              type="button"
              className="find-events-picker__nav"
              onClick={() =>
                setDisplayMonth(
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
                setDisplayMonth(
                  new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1),
                )
              }
              aria-label="Next month"
            >
              <ChevronRightIcon />
            </button>
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

              return (
                <button
                  key={`${dateKey}-${isOutsideMonth ? 'outside' : 'current'}`}
                  type="button"
                  className={`find-events-picker__day ${
                    isOutsideMonth ? 'find-events-picker__day--muted' : ''
                  } ${isAvailable ? 'find-events-picker__day--available' : ''} ${
                    isSelected ? 'find-events-picker__day--selected' : ''
                  }`}
                  onClick={() => {
                    onDateChange(day)
                    setIsOpen(false)
                  }}
                >
                  {day.getDate()}
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
