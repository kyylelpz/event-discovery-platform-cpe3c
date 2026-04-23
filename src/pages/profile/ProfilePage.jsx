import { useEffect, useState } from 'react'
import EventList from '../../components/events/EventList.jsx'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Button.jsx'
import UserAvatar from '../../components/ui/UserAvatar.jsx'
import {
  BookmarkIcon,
  CalendarIcon,
  HeartIcon,
  MapPinIcon,
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
  onOpenProfile,
  recommendedEvents = [],
  ...sharedPageProps
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [activeConnectTab, setActiveConnectTab] = useState('followers')
  const [connectSearch, setConnectSearch] = useState('')
  const [draftName, setDraftName] = useState(user.name || '')
  const [draftUsername, setDraftUsername] = useState(user.username || '')
  const [draftPhone, setDraftPhone] = useState(user.phone || user.contact || '')
  const [draftBio, setDraftBio] = useState(user.bio || '')
  const [draftProfilePic, setDraftProfilePic] = useState(user.profilePic || user.avatar || '')
  const [draftProfilePicFile, setDraftProfilePicFile] = useState(null)
  const [error, setError] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const tabs = isCurrentUser
    ? [
        { label: 'Created Events', events: createdEvents },
        { label: 'Bookmarks', events: savedEvents, icon: <BookmarkIcon /> },
        { label: 'Favorites', events: likedEvents, icon: <HeartIcon /> },
        { label: 'Attending', events: attendingEvents, icon: <CalendarIcon /> },
      ]
    : [
        { label: 'Created Events', events: createdEvents },
        { label: 'Attending', events: attendingEvents, icon: <CalendarIcon /> },
      ]
  const activeTabConfig = tabs.find((tab) => tab.label === activeTab) || tabs[0]
  const displayEvents = activeTabConfig.events
  const profileName = String(user.name || '').trim()
  const profileUsername = String(user.username || '').trim()
  const fallbackDisplayName = getUserDisplayName(user)
  const displayName = profileName || fallbackDisplayName
  const secondaryLabel =
    profileUsername && profileUsername.toLowerCase() !== displayName.toLowerCase()
      ? `@${profileUsername}`
      : getUserSecondaryLabel(user)
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
  const displayedProfilePic =
    isEditing && isCurrentUser
      ? draftProfilePic || user.profilePic || user.avatar
      : user.profilePic || user.avatar

  useEffect(() => {
    setDraftName(user.name || '')
    setDraftUsername(user.username || '')
    setDraftPhone(user.phone || user.contact || '')
    setDraftBio(user.bio || '')
    setDraftProfilePic(user.profilePic || user.avatar || '')
    setDraftProfilePicFile(null)
  }, [user.avatar, user.bio, user.contact, user.name, user.phone, user.profilePic, user.username])

  const handleStartEdit = () => {
    setDraftName(user.name || '')
    setDraftUsername(user.username || '')
    setDraftPhone(user.phone || user.contact || '')
    setDraftBio(user.bio || '')
    setDraftProfilePic(user.profilePic || user.avatar || '')
    setDraftProfilePicFile(null)
    setError('')
    setAvatarError('')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setDraftName(user.name || '')
    setDraftUsername(user.username || '')
    setDraftPhone(user.phone || user.contact || '')
    setDraftBio(user.bio || '')
    setDraftProfilePic(user.profilePic || user.avatar || '')
    setDraftProfilePicFile(null)
    setError('')
    setAvatarError('')
    setIsEditing(false)
  }

  const handleProfileImageChange = (event) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    if (!selectedFile.type.startsWith('image/')) {
      setAvatarError('Choose an image file for your profile picture.')
      event.target.value = ''
      return
    }

    if (selectedFile.size > 2.5 * 1024 * 1024) {
      setAvatarError('Profile photos must be 2.5 MB or smaller.')
      event.target.value = ''
      return
    }

    const fileReader = new FileReader()
    fileReader.onload = () => {
      setDraftProfilePic(String(fileReader.result || ''))
      setDraftProfilePicFile(selectedFile)
      setAvatarError('')
    }
    fileReader.onerror = () => {
      setAvatarError('Unable to read that image right now. Please try another one.')
    }
    fileReader.readAsDataURL(selectedFile)
    event.target.value = ''
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
        name: draftName,
        username: draftUsername,
        phone: draftPhone,
        bio: draftBio,
        profilePic: draftProfilePic,
        profilePicFile: draftProfilePicFile,
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
          <div className="profile-card__avatar-block">
            <UserAvatar
              name={displayName}
              imageUrl={displayedProfilePic}
              size="lg"
            />
            {isCurrentUser && isEditing ? (
              <label className="profile-card__avatar-upload">
                <span>Upload photo</span>
                <input type="file" accept="image/*" onChange={handleProfileImageChange} />
              </label>
            ) : null}
            {avatarError ? <p className="field-error">{avatarError}</p> : null}
          </div>

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
            {!isCurrentUser && !user.isMock ? (
              <SecondaryButton
                className="profile-card__follow"
                onClick={() => onToggleFollow?.(user)}
              >
                <UserPlusIcon />
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </SecondaryButton>
            ) : null}
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
        ) : null}

        {isCurrentUser && isEditing ? (
          <form className="event-form profile-edit-form" onSubmit={handleSaveProfile}>
            <label>
              <span>Name</span>
              <input
                value={draftName}
                onChange={(nextEvent) => setDraftName(nextEvent.target.value)}
                placeholder="Your display name"
              />
              <small className="field-hint">Names do not need to be unique.</small>
            </label>

            <label>
              <span>Username</span>
              <input
                value={draftUsername}
                onChange={(nextEvent) => setDraftUsername(nextEvent.target.value)}
                placeholder="your-username"
              />
              <small className="field-hint">
                Usernames use lowercase letters, numbers, and single hyphens.
              </small>
            </label>

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
            <p className="profile-page__connect-list-label">
              {activeConnectTab === 'followers'
                ? `${activeConnectUsers.length} follower${activeConnectUsers.length === 1 ? '' : 's'} visible`
                : `${activeConnectUsers.length} following account${activeConnectUsers.length === 1 ? '' : 's'} visible`}
            </p>
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
                      {activeConnectTab === 'followers' ? 'Follows you' : 'Following'}
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

        {recommendedEvents.length ? (
          <section className="section-block profile-page__recommendations">
            <div className="section-block__heading">
              <h2>Recommended For You</h2>
              <p>Fresh picks shaped by this account&apos;s interests.</p>
            </div>

            <EventList
              events={recommendedEvents}
              emptyTitle="No recommendations yet"
              emptyCopy="Recommendations will appear once interests and matching events line up."
              {...sharedPageProps}
            />
          </section>
        ) : null}

        <div className="profile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              className={`profile-tab ${activeTab === tab.label ? 'profile-tab--active' : ''}`}
              onClick={() => onTabChange(tab.label)}
            >
              {tab.icon ? tab.icon : null}
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
