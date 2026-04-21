import EventList from '../../components/events/EventList.jsx'
import UserAvatar from '../../components/ui/UserAvatar.jsx'
import {
  BookmarkIcon,
  CalendarIcon,
  HeartIcon,
  MapPinIcon,
  PlusSquareIcon,
} from '../../components/ui/Icons.jsx'
import { formatMemberSince } from '../../services/profileService.js'

function ProfilePage({
  user,
  createdEvents = [],
  savedEvents = [],
  likedEvents = [],
  activeTab,
  onTabChange,
  isCurrentUser = false,
  ...sharedPageProps
}) {
  const tabs = [
    { label: 'Created Events', events: createdEvents, icon: <PlusSquareIcon /> },
    { label: 'Saved Events', events: savedEvents, icon: <BookmarkIcon /> },
    { label: 'Liked Events', events: likedEvents, icon: <HeartIcon /> },
  ]
  const activeTabConfig = tabs.find((tab) => tab.label === activeTab) || tabs[0]
  const displayEvents = activeTabConfig.events
  const displayName = user.name || user.username || 'Eventcinity user'
  const usernameLabel = user.username ? `@${user.username}` : displayName
  const locationLabel = user.location || 'Philippines'
  const emailLabel = user.email || 'No email yet'
  const phoneLabel = user.phone || 'Nothing here yet. Explore more events!'
  const bioLabel = user.bio || 'Nothing here yet. Explore more events!'
  const interests = Array.isArray(user.interests) ? user.interests : []
  const joinedLabel = user.joinedDate || formatMemberSince(user.createdAt)
  const emptyCopy = isCurrentUser
    ? 'This area will fill out as you create, save, and like more events.'
    : 'This community member has not shared anything here yet.'

  return (
    <div className="profile-page">
      <section className="profile-card">
        <div className="profile-card__header">
          <UserAvatar
            name={displayName}
            imageUrl={user.profilePic || user.avatar}
            size="lg"
          />

          <div className="profile-card__intro">
            <div>
              <h1>{displayName}</h1>
              <p>{usernameLabel}</p>
            </div>
            <div className="profile-card__meta">
              <span>
                <MapPinIcon />
                {locationLabel}
              </span>
              <span>
                <CalendarIcon />
                Joined {joinedLabel}
              </span>
            </div>
            <p className="profile-page__email">{emailLabel}</p>
          </div>
        </div>

        <div className="profile-page__info-grid">
          <article className="info-card">
            <h2>Phone</h2>
            <p>{phoneLabel}</p>
          </article>

          <article className="info-card">
            <h2>Bio</h2>
            <p>{bioLabel}</p>
          </article>
        </div>

        <section className="section-block profile-page__interest-section">
          <div className="section-block__heading">
            <h2>Interests</h2>
            <p>Topics shaping this account's event feed.</p>
          </div>

          {interests.length ? (
            <div className="profile-menu__chips profile-page__chips">
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
        </section>

        <div className="profile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              className={`profile-tab ${activeTab === tab.label ? 'profile-tab--active' : ''}`}
              onClick={() => onTabChange(tab.label)}
            >
              {tab.icon}
              {tab.label} ({tab.events.length})
            </button>
          ))}
        </div>

        <EventList
          events={displayEvents}
          emptyTitle={`No ${activeTabConfig.label.toLowerCase()} yet`}
          emptyCopy={emptyCopy}
          {...sharedPageProps}
        />
      </section>
    </div>
  )
}

export default ProfilePage
