import EventList from '../../components/events/EventList.jsx'
import { PrimaryButton } from '../../components/ui/Button.jsx'
import CategoryTag from '../../components/ui/CategoryTag.jsx'
import UserAvatar from '../../components/ui/UserAvatar.jsx'
import {
  BookmarkIcon,
  CalendarIcon,
  HeartIcon,
  MapPinIcon,
  ShareIcon,
  UsersIcon,
} from '../../components/ui/Icons.jsx'
import { formatEventDate } from '../../utils/formatters.js'

function EventDetailPage({
  event,
  relatedEvents,
  interactions,
  onToggleHeart,
  onToggleSave,
  onToggleAttend,
  onOpenEvent,
}) {
  const isSaved = interactions.saved.includes(event.id)
  const isAttending = interactions.attending.includes(event.id)
  const isHearted = interactions.hearted.includes(event.id)

  return (
    <div className="page-stack page-stack--detail">
      <section className="detail-hero">
        <div className="detail-hero__image-wrap">
          <img className="detail-hero__image" src={event.image} alt={event.imageLabel} />
          <div className="detail-hero__overlay">
            <CategoryTag>{event.category}</CategoryTag>
          </div>
        </div>

        <div className="detail-layout">
          <div className="detail-layout__main">
            <div className="detail-header">
              <h1>{event.title}</h1>
              <div className="detail-host">
                <UserAvatar name={event.host} size="md" />
                <div>
                  <p>Hosted by</p>
                  <strong>{event.host}</strong>
                </div>
              </div>
            </div>

            <article className="detail-section">
              <h3>About this event</h3>
              <p>{event.description}</p>
            </article>

            <article className="detail-section">
              <h3>Location</h3>
              <div className="detail-place-card">
                <MapPinIcon />
                <div>
                  <strong>{event.location}</strong>
                  <p>View on map</p>
                </div>
              </div>
            </article>

            <article className="detail-section">
              <h3>Attendees ({event.attendeeCount})</h3>
              <div className="attendee-strip">
                {event.attendees.map((name) => (
                  <UserAvatar key={name} name={name} size="sm" />
                ))}
                <span className="attendee-strip__extra">+{Math.max(event.attendeeCount - event.attendees.length, 0)}</span>
              </div>
            </article>
          </div>

          <aside className="detail-layout__sidebar">
            <div className="detail-panel">
              <div className="detail-panel__meta">
                <div>
                  <CalendarIcon />
                  <div>
                    <p>Date & Time</p>
                    <strong>{formatEventDate(event.startDate)}</strong>
                    <span>{event.timeLabel}</span>
                  </div>
                </div>
                <div>
                  <UsersIcon />
                  <div>
                    <p>Attendees</p>
                    <strong>{event.attendeeCount} going</strong>
                  </div>
                </div>
              </div>

              <div className="detail-panel__actions">
                <PrimaryButton onClick={() => onToggleAttend(event.id)} className="detail-panel__attend">
                  {isAttending ? 'Attending' : 'Attend Event'}
                </PrimaryButton>

                <div className="detail-panel__icon-row">
                  <button type="button" className="icon-box" onClick={() => onToggleHeart(event.id)}>
                    <HeartIcon filled={isHearted} className={isHearted ? 'icon-accent icon-filled' : ''} />
                  </button>
                  <button type="button" className="icon-box" onClick={() => onToggleSave(event.id)}>
                    <BookmarkIcon filled={isSaved} className={isSaved ? 'icon-accent icon-filled' : ''} />
                  </button>
                  <button type="button" className="icon-box">
                    <ShareIcon />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-block">
        <div className="section-block__heading">
          <h2>More to Explore</h2>
          <p>Events related by category or location.</p>
        </div>
        <EventList
          events={relatedEvents}
          emptyTitle="No related events yet"
          emptyCopy="As the event catalog grows, more matches will appear here."
          interactions={interactions}
          onToggleHeart={onToggleHeart}
          onToggleSave={onToggleSave}
          onToggleAttend={onToggleAttend}
          onOpenEvent={onOpenEvent}
        />
      </section>
    </div>
  )
}

export default EventDetailPage
