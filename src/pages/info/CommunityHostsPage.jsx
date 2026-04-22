import {
  CheckIcon,
  PlusSquareIcon,
  SearchIcon,
  ShareIcon,
  ShieldIcon,
  UsersRoundIcon,
} from '../../components/ui/Icons.jsx'

function CommunityHostsPage() {
  return (
    <div className="info-page">
      <section className="info-page__hero">
        <div className="info-page__hero-icon">
          <UsersRoundIcon />
        </div>
        <h1>Community Hosts</h1>
        <p>
          Meet the organizers and collectives who bring the Philippines&apos; event scene
          to life - and learn how to become one yourself.
        </p>
      </section>

      <section className="info-page__grid">
        <article className="info-card">
          <div className="info-card__header">
            <div className="info-card__icon">
              <UsersRoundIcon />
            </div>
            <h2>Who are community hosts?</h2>
          </div>
          <p>
            Community hosts are individuals, groups, and organizations who regularly
            create and manage events on Eventcinity. They set the tone for the
            platform&apos;s culture and energy.
          </p>
        </article>
        <article className="info-card">
          <div className="info-card__header">
            <div className="info-card__icon">
              <PlusSquareIcon />
            </div>
            <h2>Become a host</h2>
          </div>
          <p>
            Anyone can create an event on Eventcinity. Sign in, hit Create Event, fill
            in your details, and publish. Your event goes live immediately for attendees
            across the Philippines to discover.
          </p>
        </article>
        <article className="info-card">
          <div className="info-card__header">
            <div className="info-card__icon">
              <CheckIcon />
            </div>
            <h2>Host responsibilities</h2>
          </div>
          <p>
            Great hosts keep their listings accurate, respond to attendee questions
            promptly, and update their event page if details change. Reliability builds
            trust and repeat attendance.
          </p>
        </article>
        <article className="info-card">
          <div className="info-card__header">
            <div className="info-card__icon">
              <ShareIcon />
            </div>
            <h2>Growing your audience</h2>
          </div>
          <p>
            Consistent hosting builds a following. Share your events on social media,
            collaborate with other hosts, and encourage attendees to save and share your
            listings.
          </p>
        </article>
        <article className="info-card">
          <div className="info-card__header">
            <div className="info-card__icon">
              <SearchIcon />
            </div>
            <h2>Host best practices</h2>
          </div>
          <p>
            Use clear titles, accurate dates, and vivid descriptions. Add a strong cover
            image and choose the right category so your event surfaces to the right
            crowd.
          </p>
        </article>
        <article className="info-card">
          <div className="info-card__header">
            <div className="info-card__icon">
              <ShieldIcon />
            </div>
            <h2>Community guidelines</h2>
          </div>
          <p>
            Eventcinity hosts are expected to create safe, inclusive, and welcoming
            experiences. Events that violate community standards will be removed from the
            platform.
          </p>
        </article>
      </section>
    </div>
  )
}

export default CommunityHostsPage
