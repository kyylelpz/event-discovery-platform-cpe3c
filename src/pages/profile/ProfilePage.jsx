import { useEffect, useState } from 'react'
import EventList from '../../components/events/EventList.jsx'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Button.jsx'
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
  attendingEvents = [],
  activeTab,
  onTabChange,
  isCurrentUser = false,
  onSaveProfile,
  ...sharedPageProps
}) {
  const [isEditing, setIsEditing] = useState(false)
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
    : [{ label: 'Created Events', events: createdEvents, icon: <PlusSquareIcon /> }]
  const activeTabConfig = tabs.find((tab) => tab.label === activeTab) || tabs[0]
  const displayEvents = activeTabConfig.events
  const displayName = user.name || user.username || 'Eventcinity user'
  const usernameLabel = user.username ? `@${user.username}` : displayName
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
  const emptyCopy = isCurrentUser
    ? 'This area fills in from your own account activity and hosted events.'
    : 'This community member has not shared anything here yet.'

  useEffect(() => {
    setDraftPhone(user.phone || user.contact || '')
    setDraftBio(user.bio || '')
  }, [user.phone, user.contact, user.bio])

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

        {isCurrentUser ? (
          <div className="profile-card__actions">
            {!isEditing ? (
              <SecondaryButton onClick={() => setIsEditing(true)}>
                Edit Profile
              </SecondaryButton>
            ) : null}
          </div>
        ) : null}

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
          <article className="info-card">
            <h2>Contact</h2>
            <p>{contactLabel}</p>
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
