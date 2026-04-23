import { useState } from 'react'
import EventList from '../../components/events/EventList.jsx'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Button.jsx'
import UserAvatar from '../../components/ui/UserAvatar.jsx'
import {
  BookmarkIcon,
  CalendarIcon,
  HeartIcon,
  MessageCircleIcon,
  MapPinIcon,
  PlusSquareIcon,
  SearchIcon,
  UserPlusIcon,
  UsersIcon,
} from '../../components/ui/Icons.jsx'
import { formatMemberSince } from '../../services/profileService.js'
import { getUserDisplayName, getUserSecondaryLabel } from '../../utils/userDisplay.js'

function ProfilePage({
  user,
  createdEvents = [],
  savedEvents = [],
  likedEvents = [],
  attendingEvents = [],
  activeTab,
  onTabChange,
  isCurrentUser = false,
  onSaveProfile,
  onToggleFollow,
  isFollowing = false,
  communityUsers = [],
  notifications = [],
  onOpenProfile,
  ...sharedPageProps
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [activeConnectTab, setActiveConnectTab] = useState('followers')
  const [connectSearch, setConnectSearch] = useState('')
  const [draftPhone, setDraftPhone] = useState(user.phone || user.contact || '')
  const [draftBio, setDraftBio] = useState(user.bio || '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const tabs = isCurrentUser
    ? [
        { label: 'Created Events', events: createdEvents, icon: <PlusSquareIcon /> },
        { label: 'Bookmarks', events: savedEvents, icon: <BookmarkIcon /> },
        { label: 'Favorites', events: likedEvents, icon: <HeartIcon /> },
        { label: 'Attending', events: attendingEvents, icon: <CalendarIcon /> },
      ]
    : [
        { label: 'Created Events', events: createdEvents, icon: <PlusSquareIcon /> },
        { label: 'Attending', events: attendingEvents, icon: <CalendarIcon /> },
      ]
  const activeTabConfig = tabs.find((tab) => tab.label === activeTab) || tabs[0]
  const displayEvents = activeTabConfig.events
  const displayName = getUserDisplayName(user)
  const secondaryLabel = getUserSecondaryLabel(user)
  const locationLabel = user.location || 'Philippines'
  const emailLabel = isCurrentUser
    ? user.email || 'No email yet'
    : 'Email stays private to this account.'
  const contactLabel =
    user.phone || user.contact || 'No public contact has been added yet.'
  const bioLabel =
    user.bio || 'Nothing here yet. Explore more events and add a short intro.'
  const interests = Array.isArray(user.interests) ? user.interests : []
  const joinedLabel = user.joinedDate || formatMemberSince(user.createdAt)
  const followerUsernames = Array.isArray(user.followerUsernames) ? user.followerUsernames : []
  const followingUsernames = Array.isArray(user.followingUsernames) ? user.followingUsernames : []
  const followerUsers = communityUsers.filter((person) =>
    followerUsernames.includes(String(person.username || '').trim().toLowerCase()),
  )
  const followingUsers = communityUsers.filter((person) =>
    followingUsernames.includes(String(person.username || '').trim().toLowerCase()),
  )
  const activeConnectUsers = (activeConnectTab === 'followers' ? followerUsers : followingUsers).filter(
    (person) => {
      const normalizedSearch = connectSearch.trim().toLowerCase()

      if (!normalizedSearch) {
        return true
      }

      return [person.name, person.username]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    },
  )
  const emptyCopy = isCurrentUser
    ? 'This area fills in from your own account activity and hosted events.'
    : activeTabConfig?.label === 'Attending'
      ? 'This community member has not marked any public attending events yet.'
      : 'This community member has not shared anything here yet.'

  const handleStartEdit = () => {
    setDraftPhone(user.phone || user.contact || '')
    setDraftBio(user.bio || '')
    setError('')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setDraftPhone(user.phone || user.contact || '')
    setDraftBio(user.bio || '')
    setError('')
    setIsEditing(false)
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()

    if (!onSaveProfile) {
      return
    }

    setError('')
    setIsSaving(true)

    try {
      await onSaveProfile({
        phone: draftPhone,
        bio: draftBio,
      })
      setIsEditing(false)
    } catch (saveError) {
      setError(saveError.message || 'Unable to save your profile right now.')
    } finally {
      setIsSaving(false)
    }
  }

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
            <div className="profile-card__identity">
              <h1>{displayName}</h1>
              {secondaryLabel ? <p>{secondaryLabel}</p> : null}
            </div>
            <div className="profile-card__meta">
              <span className="profile-card__meta-item">
                <MapPinIcon />
                <span className="profile-card__meta-item-text">{locationLabel}</span>
              </span>
              <span className="profile-card__meta-item">
                <CalendarIcon />
                <span className="profile-card__meta-item-text">Joined {joinedLabel}</span>
              </span>
            </div>
            <p className="profile-page__email">{emailLabel}</p>
          </div>
        </div>

        {isCurrentUser ? (
          <div className="profile-card__actions">
            {!isEditing ? (
              <SecondaryButton onClick={handleStartEdit}>
                Edit Profile
              </SecondaryButton>
            ) : null}
          </div>
        ) : (
          <div className="profile-card__actions">
            <SecondaryButton onClick={() => onToggleFollow?.(user)}>
              <UserPlusIcon />
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </SecondaryButton>
          </div>
        )}

        {isCurrentUser && isEditing ? (
          <form className="event-form profile-edit-form" onSubmit={handleSaveProfile}>
            <label>
              <span>Contact</span>
              <input
                value={draftPhone}
                onChange={(nextEvent) => setDraftPhone(nextEvent.target.value)}
                placeholder="0917 123 4567"
              />
              <small className="field-hint">
                This contact is shown on your public profile.
              </small>
            </label>

            <label>
              <span>Bio</span>
              <textarea
                rows="5"
                value={draftBio}
                onChange={(nextEvent) => setDraftBio(nextEvent.target.value)}
                placeholder="Tell people a little about the events you like to host or attend."
                maxLength="300"
              />
              <small className="field-hint">{draftBio.trim().length}/300 characters</small>
            </label>

            {error ? <p className="profile-card__status profile-card__status--error">{error}</p> : null}

            <div className="form-actions">
              <PrimaryButton type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </PrimaryButton>
              <SecondaryButton type="button" onClick={handleCancelEdit} disabled={isSaving}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        ) : null}

        <div className="profile-page__info-grid">
          <article className="info-card profile-page__info-card">
            <h2>Contact</h2>
            <p>{contactLabel}</p>
          </article>

          <article className="info-card profile-page__info-card">
            <h2>Bio</h2>
            <p>{bioLabel}</p>
          </article>

          <article className="info-card profile-page__info-card">
            <h2>Connects</h2>
            <p className="profile-page__connect-summary">
              Keep up with your people quickly from one compact space.
            </p>
            <div className="profile-page__connects">
              <button
                type="button"
                className={`profile-page__connect-button ${
                  activeConnectTab === 'followers' ? 'profile-page__connect-button--active' : ''
                }`}
                onClick={() => setActiveConnectTab('followers')}
              >
                <UsersIcon />
                <span>{user.followersCount || 0} followers</span>
              </button>
              <button
                type="button"
                className={`profile-page__connect-button ${
                  activeConnectTab === 'following' ? 'profile-page__connect-button--active' : ''
                }`}
                onClick={() => setActiveConnectTab('following')}
              >
                <UsersIcon />
                <span>{user.followingCount || 0} following</span>
              </button>
            </div>
            <label className="profile-page__connect-search">
              <SearchIcon />
              <input
                value={connectSearch}
                onChange={(event) => setConnectSearch(event.target.value)}
                placeholder={`Search ${activeConnectTab}`}
              />
            </label>
            <div className="profile-page__connect-list" aria-live="polite">
              {activeConnectUsers.length ? (
                activeConnectUsers.map((person) => (
                  <button
                    key={person.username}
                    type="button"
                    className="profile-page__connect-person"
                    onClick={() => onOpenProfile?.(person.username)}
                  >
                    <UserAvatar
                      name={person.name}
                      imageUrl={person.profilePic || person.avatar}
                      size="sm"
                    />
                    <span className="profile-page__connect-person-copy">
                      <strong>{person.name}</strong>
                      <span>@{person.username}</span>
                    </span>
                    <span className="profile-page__connect-person-meta">
                      {person.followersCount || 0} followers
                    </span>
                  </button>
                ))
              ) : (
                <p className="profile-page__connect-empty">
                  {connectSearch.trim()
                    ? `No ${activeConnectTab} matched your search.`
                    : activeConnectTab === 'followers'
                      ? 'No followers to show yet.'
                      : 'No following accounts to show yet.'}
                </p>
              )}
            </div>
          </article>

          <article className="info-card profile-page__info-card">
            <h2>Notifications</h2>
            <p className="profile-page__connect-summary">
              Upcoming saved activity and new follower updates show here.
            </p>
            <div className="profile-page__notification-list">
              {notifications.length ? (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className="profile-page__notification"
                    onClick={() => {
                      if (notification.eventId) {
                        sharedPageProps.onOpenEvent?.(notification.eventId)
                        return
                      }

                      if (notification.username) {
                        onOpenProfile?.(notification.username)
                      }
                    }}
                  >
                    <span className="profile-page__notification-icon">
                      {notification.kind === 'follower' ? <UserPlusIcon /> : <MessageCircleIcon />}
                    </span>
                    <span className="profile-page__notification-copy">
                      <strong>{notification.title}</strong>
                      <span>{notification.body}</span>
                    </span>
                  </button>
                ))
              ) : (
                <p className="profile-page__connect-empty">
                  No new notifications right now.
                </p>
              )}
            </div>
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
              {isCurrentUser
                ? 'Nothing here yet. Explore more events!'
                : 'This member has not added public interests yet.'}
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
              <span className="profile-tab__label">
                <span>{tab.label}</span>
                <span>({tab.events.length})</span>
              </span>
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
