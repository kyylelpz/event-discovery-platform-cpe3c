import { PrimaryButton } from '../ui/Button.jsx'
import {
  ArrowRightIcon,
  BookmarkIcon,
  CalendarIcon,
  CheckIcon,
  HeartIcon,
  MapPinIcon,
} from '../ui/Icons.jsx'
import CategoryTag from '../ui/CategoryTag.jsx'
import { formatEventSchedule, getResponsiveImageProps } from '../../utils/formatters.js'

function FeaturedEvent({
  event,
  matchedInterest,
  interactions,
  onViewDetails,
  onToggleHeart,
  onToggleSave,
  onToggleAttend,
}) {
  if (!event) {
    return null
  }

  const eventId = String(event?.id || '').trim()
  const isHearted = interactions?.hearted?.includes(eventId)
  const isSaved = interactions?.saved?.includes(eventId)
  const isAttending = interactions?.attending?.includes(eventId)
  const scheduleLabel = formatEventSchedule(event)
  const featuredImage = getResponsiveImageProps(event.image)
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
    <section className="featured-event">
      <div className="featured-event__content">
        <CategoryTag>{event.category}</CategoryTag>
        <div className="featured-event__copy">
          <span className="featured-event__eyebrow">Featured Event</span>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
        </div>

        <div className="featured-event__meta">
          <div className="event-meta-item">
            <CalendarIcon />
            <span className="event-meta-item__content">{scheduleLabel}</span>
          </div>
          <div className="event-meta-item">
            <MapPinIcon />
            {locationHref ? (
              <a
                className="event-meta-item__content featured-event__location-link"
                href={locationHref}
                target="_blank"
                rel="noreferrer"
              >
                {event.location}
              </a>
            ) : (
              <span className="event-meta-item__content">{event.location}</span>
            )}
          </div>
        </div>

        <div className="featured-event__actions">
          <div className="featured-event__primary-actions">
            <PrimaryButton onClick={() => onViewDetails(event.id)}>
              <span>View Event Details</span>
              <ArrowRightIcon />
            </PrimaryButton>

            <button
              type="button"
              className={`attend-chip ${isAttending ? 'attend-chip--active' : ''}`}
              onClick={() => onToggleAttend(event)}
            >
              {isAttending ? <CheckIcon /> : null}
              <span>{isAttending ? 'Attending' : 'Attend'}</span>
            </button>
          </div>

          <div className="featured-event__quick-actions" aria-label="Featured event actions">
            <button
              type="button"
              className="icon-box"
              onClick={() => onToggleHeart(event)}
              aria-label="Like featured event"
            >
              <HeartIcon
                className={isHearted ? 'icon-accent icon-filled' : ''}
                filled={Boolean(isHearted)}
              />
            </button>
            <button
              type="button"
              className="icon-box"
              onClick={() => onToggleSave(event)}
              aria-label="Save featured event"
            >
              <BookmarkIcon
                className={isSaved ? 'icon-accent icon-filled' : ''}
                filled={Boolean(isSaved)}
              />
            </button>
          </div>

          {matchedInterest ? (
            <p className="status-note">
              Matched to your interest in {matchedInterest}.
            </p>
          ) : null}
        </div>
      </div>

      <div className="featured-event__media">
        <img
          src={featuredImage.src}
          srcSet={featuredImage.srcSet}
          sizes="(max-width: 920px) 100vw, 52vw"
          alt={event.imageLabel}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />
      </div>
    </section>
  )
}

export default FeaturedEvent
