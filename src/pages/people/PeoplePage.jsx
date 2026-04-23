import { PrimaryButton, SecondaryButton } from '../../components/ui/Button.jsx'
import { UserPlusIcon, UsersIcon } from '../../components/ui/Icons.jsx'
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
        <nav className="pagination" aria-label="People pagination">
          <p className="pagination__summary">
            Showing {rangeStart}-{rangeEnd} of {totalPeople} people
          </p>
          <div className="pagination__controls">
            <button
              type="button"
              className="pagination__button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <div className="pagination__pages">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`pagination__button ${
                    pageNumber === currentPage ? 'pagination__button--active' : ''
                  }`}
                  onClick={() => onPageChange(pageNumber)}
                  aria-current={pageNumber === currentPage ? 'page' : undefined}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="pagination__button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </nav>
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
                {person.followersCount || 0} followers · {person.followingCount || 0} following
              </p>
              <div className="person-card__actions">
                {person.username && person.username !== currentUsername ? (
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
