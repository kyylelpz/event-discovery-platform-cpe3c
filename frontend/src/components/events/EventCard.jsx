import CategoryTag from '../ui/CategoryTag.jsx'
import {
  BookmarkIcon,
  CalendarIcon,
  CheckIcon,
  HeartIcon,
  MapPinIcon,
} from '../ui/Icons.jsx'
import { formatEventDate } from '../../utils/formatters.js'

function EventCard({
  event,
  interactions,
  onToggleHeart,
  onToggleSave,
  onToggleAttend,
  onOpenEvent,
}) {
  const isHearted = interactions.hearted.includes(event.id)
  const isSaved = interactions.saved.includes(event.id)
  const isAttending = interactions.attending.includes(event.id)

  return (
    <article className="event-card">
      <button className="event-card__media" type="button" onClick={() => onOpenEvent(event.id)}>
        <img src={event.image} alt={event.imageLabel} loading="lazy" />
        <div className="event-card__actions-overlay">
          <button
            type="button"
            className="icon-badge"
            onClick={(eventObject) => {
              eventObject.stopPropagation()
              onToggleHeart(event.id)
            }}
            aria-label="Heart event"
          >
            <HeartIcon className={isHearted ? 'icon-accent icon-filled' : ''} filled={isHearted} />
          </button>
          <button
            type="button"
            className="icon-badge"
            onClick={(eventObject) => {
              eventObject.stopPropagation()
              onToggleSave(event.id)
            }}
            aria-label="Save event"
          >
            <BookmarkIcon className={isSaved ? 'icon-accent icon-filled' : ''} filled={isSaved} />
          </button>
        </div>
        <div className="event-card__category">
          <CategoryTag>{event.category}</CategoryTag>
        </div>
      </button>

      <div className="event-card__content">
        <button className="event-card__title" type="button" onClick={() => onOpenEvent(event.id)}>
          {event.title}
        </button>

        <div className="event-card__meta">
          <p>
            <CalendarIcon />
            <span>
              {formatEventDate(event.startDate)} • {event.timeLabel}
            </span>
          </p>
          <p>
            <MapPinIcon />
            <span>{event.location}</span>
          </p>
        </div>

        <div className="event-card__footer">
          <span>{event.attendeeCount.toLocaleString()} attending</span>
          <button
            type="button"
            className={`attend-chip ${isAttending ? 'attend-chip--active' : ''}`}
            onClick={() => onToggleAttend(event.id)}
          >
            {isAttending && <CheckIcon />}
            <span>{isAttending ? 'Attending' : 'Attend'}</span>
          </button>
        </div>
      </div>
    </article>
  )
}

export default EventCard
