import { PrimaryButton, SecondaryButton } from '../../components/ui/Button.jsx'
import { UsersIcon } from '../../components/ui/Icons.jsx'
import UserAvatar from '../../components/ui/UserAvatar.jsx'

function PeoplePage({ people, onOpenProfile }) {
  const hasPeople = Array.isArray(people) && people.length > 0

  return (
    <div className="people-page">
      <section className="people-hero">
        <div className="people-hero__icon">
          <UsersIcon />
        </div>
        <h1>Connect with People</h1>
        <p>
          Find and connect with event organizers, attendees, and like-minded
          people in your community.
        </p>
        <div className="people-hero__badge">
          <span>Public profile details travel with each account</span>
        </div>
      </section>

      <section className="people-grid">
        {hasPeople ? (
          people.map((person) => (
            <article key={person.username} className="person-card">
              <div className="person-card__header">
                <UserAvatar
                  name={person.name}
                  imageUrl={person.profilePic || person.avatar}
                  size="lg"
                />
                <div>
                  <h2>{person.name}</h2>
                  <p>{person.location}</p>
                </div>
              </div>
              <p className="person-card__bio">{person.bio}</p>
              <p className="person-card__meta">
                @{person.username} - {person.createdEventsCount || 0} hosted events
              </p>
              <p className="person-card__meta">
                Open the profile to view public bio, interests, contact details, and attending events.
              </p>
              <div className="person-card__actions">
                <PrimaryButton onClick={() => onOpenProfile(person.username)}>
                  View Profile
                </PrimaryButton>
                <SecondaryButton onClick={() => onOpenProfile(person.username)}>
                  Open Account
                </SecondaryButton>
              </div>
            </article>
          ))
        ) : (
          <article className="person-card">
            <div className="person-card__header">
              <div>
                <h2>No other accounts yet</h2>
                <p>The connect dashboard will fill up as more users sign in.</p>
              </div>
            </div>
            <p className="person-card__bio">
              Once other accounts exist in the same backend, you will be able to open their public profiles here.
            </p>
          </article>
        )}
      </section>
    </div>
  )
}

export default PeoplePage
