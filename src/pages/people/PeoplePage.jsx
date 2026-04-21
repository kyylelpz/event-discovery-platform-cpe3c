import { PrimaryButton, SecondaryButton } from '../../components/ui/Button.jsx'
import { UsersIcon } from '../../components/ui/Icons.jsx'
import UserAvatar from '../../components/ui/UserAvatar.jsx'

function PeoplePage({ people, onOpenProfile }) {
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
          <span>Private data stays on each account</span>
        </div>
      </section>

      <section className="people-grid">
        {people.map((person) => (
          <article key={person.username} className="person-card">
            <div className="person-card__header">
              <UserAvatar name={person.name} size="lg" />
              <div>
                <h2>{person.name}</h2>
                <p>{person.location}</p>
              </div>
            </div>
            <p className="person-card__bio">{person.bio}</p>
            <p className="person-card__meta">
              Private interests, bookmarks, likes, and attendance stay hidden to other users.
            </p>
            <div className="person-card__actions">
              <PrimaryButton onClick={() => onOpenProfile(person.username)}>
                View Profile
              </PrimaryButton>
              <SecondaryButton onClick={() => onOpenProfile(person.username)}>
                Connect
              </SecondaryButton>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default PeoplePage
