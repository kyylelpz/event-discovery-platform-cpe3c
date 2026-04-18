import EventList from '../../components/events/EventList.jsx'
import { SecondaryButton } from '../../components/ui/Button.jsx'
import UserAvatar from '../../components/ui/UserAvatar.jsx'
import { CalendarIcon, MapPinIcon } from '../../components/ui/Icons.jsx'

function ProfilePage({
  user,
  createdEvents,
  savedEvents,
  activeTab,
  onTabChange,
  ...sharedPageProps
}) {
  const displayEvents =
    activeTab === 'Created Events' ? createdEvents : savedEvents

  return (
    <div className="profile-page">
      <section className="profile-card">
        <div className="profile-card__header">
          <UserAvatar name={user.name} size="lg" />

          <div className="profile-card__intro">
            <div>
              <h1>{user.name}</h1>
              <p>@{user.username}</p>
            </div>
            <p className="profile-card__bio">{user.bio}</p>
            <div className="profile-card__meta">
              <span>
                <MapPinIcon />
                {user.location}
              </span>
              <span>
                <CalendarIcon />
                Joined {user.joinedDate}
              </span>
            </div>
            <SecondaryButton className="profile-card__button">Edit Profile</SecondaryButton>
          </div>
        </div>

        <div className="profile-tabs">
          {['Created Events', 'Saved Events'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`profile-tab ${activeTab === tab ? 'profile-tab--active' : ''}`}
              onClick={() => onTabChange(tab)}
            >
              {tab} ({tab === 'Created Events' ? createdEvents.length : savedEvents.length})
            </button>
          ))}
        </div>

        <EventList
          events={displayEvents}
          emptyTitle={`No ${activeTab.toLowerCase()} yet`}
          emptyCopy="This area will fill out as the user creates or saves more events."
          {...sharedPageProps}
        />
      </section>
    </div>
  )
}

export default ProfilePage
