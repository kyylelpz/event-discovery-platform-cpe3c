import CategoryTag from '../ui/CategoryTag.jsx'
import {
  BookmarkIcon,
  CalendarIcon,
  CheckIcon,
  HeartIcon,
  MapPinIcon,
  StarIcon,
} from '../ui/Icons.jsx'
import { formatEventSchedule, getResponsiveImageProps } from '../../utils/formatters.js'

function EventCard({
  event,
  interactions,
  onToggleHeart,
  onToggleSave,
  onToggleAttend,
  onOpenEvent,
}) {
  const eventId = String(event?.id || '').trim()
  const isHearted = interactions.hearted.includes(eventId)
  const isSaved = interactions.saved.includes(eventId)
  const isAttending = interactions.attending.includes(eventId)
  const scheduleLabel = formatEventSchedule(event)
  const eventImage = getResponsiveImageProps(event.image)
  const locationHref = event.mapUrl
  const handleImageError = (eventObject) => {
    if (!event.fallbackImage || eventObject.currentTarget.dataset.fallbackApplied === 'true') {
      return
    }

    eventObject.currentTarget.dataset.fallbackApplied = 'true'
    eventObject.currentTarget.src = event.fallbackImage
    eventObject.currentTarget.srcset = ''
  }

  return (
    <article className="event-card">
      <div
        className="event-card__media"
        onClick={() => onOpenEvent(event.id)}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={eventImage.src}
          srcSet={eventImage.srcSet}
          sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt={event.imageLabel}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />

        <div className="event-card__actions-overlay">
          <button
            type="button"
            className="icon-badge"
            onClick={(eventObject) => {
              eventObject.stopPropagation()
              onToggleHeart(event)
            }}
            aria-label="Heart event"
          >
            <HeartIcon
              className={isHearted ? 'icon-accent icon-filled' : ''}
              filled={isHearted}
            />
          </button>
          <button
            type="button"
            className="icon-badge"
            onClick={(eventObject) => {
              eventObject.stopPropagation()
              onToggleSave(event)
            }}
            aria-label="Save event"
          >
            <BookmarkIcon
              className={isSaved ? 'icon-accent icon-filled' : ''}
              filled={isSaved}
            />
          </button>
        </div>

        <div className="event-card__category">
          <CategoryTag>{event.category}</CategoryTag>
        </div>
      </div>

      <div className="event-card__content">
        <button
          className="event-card__title"
          type="button"
          onClick={() => onOpenEvent(event.id)}
        >
          {event.title}
        </button>

        <div className="event-card__meta">
          <p className="event-meta-item">
            <CalendarIcon />
            <span className="event-meta-item__content">{scheduleLabel}</span>
          </p>
          <p className="event-meta-item">
            <MapPinIcon />
            {locationHref ? (
              <a
                className="event-meta-item__content event-card__location-link"
                href={locationHref}
                target="_blank"
                rel="noreferrer"
                onClick={(eventObject) => eventObject.stopPropagation()}
              >
                {event.location}
              </a>
            ) : (
              <span className="event-meta-item__content">{event.location}</span>
            )}
          </p>
          {event.venueRating > 0 ? (
            <p className="event-meta-item">
              <StarIcon filled />
              <span className="event-meta-item__content">
                {event.venueRating.toFixed(1)}
                {event.venueReviewCount > 0 ? ` · ${event.venueReviewCount} reviews` : ''}
              </span>
            </p>
          ) : null}
        </div>

        <div className="event-card__footer">
          <button
            type="button"
            className={`attend-chip ${isAttending ? 'attend-chip--active' : ''}`}
            onClick={() => onToggleAttend(event)}
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
