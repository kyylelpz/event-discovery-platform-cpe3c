import { PrimaryButton } from '../ui/Button.jsx'
import { ArrowRightIcon, CalendarIcon, MapPinIcon } from '../ui/Icons.jsx'
import CategoryTag from '../ui/CategoryTag.jsx'
import { formatEventSchedule, getResponsiveImageProps } from '../../utils/formatters.js'

function FeaturedEvent({ event, onViewDetails }) {
  if (!event) {
    return null
  }

  const scheduleLabel = formatEventSchedule(event)
  const featuredImage = getResponsiveImageProps(event.image, [960, 1440, 2200])
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
          <div>
            <CalendarIcon />
            <span>{scheduleLabel}</span>
          </div>
          <div>
            <MapPinIcon />
            {locationHref ? (
              <a
                className="featured-event__location-link"
                href={locationHref}
                target="_blank"
                rel="noreferrer"
              >
                {event.location}
              </a>
            ) : (
              <span>{event.location}</span>
            )}
          </div>
        </div>

        <div className="featured-event__actions">
          <PrimaryButton onClick={() => onViewDetails(event.id)}>
            <span>View Event Details</span>
            <ArrowRightIcon />
          </PrimaryButton>
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
          onError={handleImageError}
        />
      </div>
    </section>
  )
}

export default FeaturedEvent
