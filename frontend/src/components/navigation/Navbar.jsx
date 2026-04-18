import { routes } from '../../utils/routing.js'
import BrandLogo from './BrandLogo.jsx'
import { PrimaryButton, SecondaryButton } from '../ui/Button.jsx'
import {
  CalendarIcon,
  CloseIcon,
  LogInIcon,
  MapPinIcon,
  MenuIcon,
  SearchIcon,
  UserPlusIcon,
} from '../ui/Icons.jsx'
import SearchBar from '../ui/SearchBar.jsx'

function Navbar({
  currentPath,
  onNavigate,
  searchTerm,
  onSearchChange,
  locations,
  selectedLocation,
  onLocationChange,
}) {
  const isActive = (target) =>
    currentPath === target || currentPath.startsWith(`${target}/`)

  return (
    <header className="topbar">
      <div className="topbar__desktop">
        <button className="brandmark" type="button" onClick={() => onNavigate(routes.events)}>
          <BrandLogo />
          <span className="brandmark__word">Eventcinity</span>
        </button>

        <div className="topbar__center">
          <SearchBar
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search events..."
            icon={<SearchIcon />}
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

          <PrimaryButton onClick={() => onNavigate(routes.events)}>
            <CalendarIcon />
            <span>Find Events</span>
          </PrimaryButton>
        </div>

        <nav className="topbar__nav" aria-label="Primary">
          <SecondaryButton
            isActive={isActive(routes.createEvent)}
            onClick={() => onNavigate(routes.createEvent)}
          >
            Create
          </SecondaryButton>
          <SecondaryButton
            isActive={isActive(routes.people)}
            onClick={() => onNavigate(routes.people)}
          >
            <UserPlusIcon />
            <span>Connect</span>
          </SecondaryButton>
          <SecondaryButton
            isActive={isActive(routes.signin)}
            onClick={() => onNavigate(routes.signin)}
          >
            <LogInIcon />
            <span>Sign In</span>
          </SecondaryButton>
        </nav>
      </div>

      <MobileNavbar
        currentPath={currentPath}
        onNavigate={onNavigate}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        locations={locations}
        selectedLocation={selectedLocation}
        onLocationChange={onLocationChange}
      />
    </header>
  )
}

function MobileNavbar({
  currentPath,
  onNavigate,
  searchTerm,
  onSearchChange,
  locations,
  selectedLocation,
  onLocationChange,
}) {
  const isActive = (target) =>
    currentPath === target || currentPath.startsWith(`${target}/`)

  const toggleState = isActive(routes.events) ? 'events' : currentPath

  return (
    <details className="topbar__mobile" open={false}>
      <summary>
        <button className="brandmark" type="button" onClick={() => onNavigate(routes.events)}>
          <BrandLogo />
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

        <PrimaryButton onClick={() => onNavigate(routes.events)}>
          <CalendarIcon />
          <span>Find Events</span>
        </PrimaryButton>

        <div className="topbar__mobile-links">
          <SecondaryButton
            isActive={toggleState === routes.createEvent}
            onClick={() => onNavigate(routes.createEvent)}
          >
            Create Event
          </SecondaryButton>
          <SecondaryButton
            isActive={toggleState === routes.people}
            onClick={() => onNavigate(routes.people)}
          >
            Connect with People
          </SecondaryButton>
          <SecondaryButton
            isActive={toggleState === routes.signin}
            onClick={() => onNavigate(routes.signin)}
          >
            Sign In
          </SecondaryButton>
        </div>
      </div>
    </details>
  )
}

export default Navbar
