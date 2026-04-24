import { PrimaryButton, SecondaryButton } from '../../components/ui/Button.jsx'
import { UserPlusIcon, UsersIcon } from '../../components/ui/Icons.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import UserAvatar from '../../components/ui/UserAvatar.jsx'

function PeoplePage({
  people,
  currentPage = 1,
  totalPages = 1,
  totalPeople = 0,
  onPageChange,
  onOpenProfile,
  onToggleFollow,
  currentUsername = '',
  currentFollowingUsernames = new Set(),
}) {
  const hasPeople = Array.isArray(people) && people.length > 0
  const rangeStart = hasPeople ? (currentPage - 1) * 15 + 1 : 0
  const rangeEnd = hasPeople ? rangeStart + people.length - 1 : 0

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
      </section>

      {totalPages > 1 ? (
        <Pagination
          ariaLabel="People pagination"
          summary={`Showing ${rangeStart}-${rangeEnd} of ${totalPeople} people`}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      ) : null}

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
                <div className="person-card__copy">
                  <h2>{person.name}</h2>
                  <p>{person.location}</p>
                </div>
              </div>
              <p className="person-card__bio">{person.bio}</p>
              <p className="person-card__meta">
                @{person.username} - {person.createdEventsCount || 0} hosted events
              </p>
              <p className="person-card__meta">
                {person.followersCount || 0} followers - {person.followingCount || 0} following
              </p>
              <div className="person-card__actions">
                {person.username && person.username !== currentUsername && !person.isMock ? (
                  <SecondaryButton
                    onClick={() => onToggleFollow?.(person)}
                    className="person-card__follow"
                  >
                    <UserPlusIcon />
                    <span>
                      {currentFollowingUsernames.has(String(person.username).toLowerCase())
                        ? 'Following'
                        : 'Follow'}
                    </span>
                  </SecondaryButton>
                ) : null}
                <PrimaryButton onClick={() => onOpenProfile(person.username)}>
                  View Profile
                </PrimaryButton>
              </div>
              {person.isMock ? (
                <p className="person-card__meta">Demo community profile</p>
              ) : null}
            </article>
          ))
        ) : (
          <article className="person-card">
            <div className="person-card__header">
              <div className="person-card__copy">
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
