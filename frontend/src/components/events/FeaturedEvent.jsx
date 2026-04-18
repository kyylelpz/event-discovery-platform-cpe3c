import { PrimaryButton } from '../ui/Button.jsx'
import { ArrowRightIcon, CalendarIcon, MapPinIcon } from '../ui/Icons.jsx'
import CategoryTag from '../ui/CategoryTag.jsx'
import { formatEventDate } from '../../utils/formatters.js'

function FeaturedEvent({ event, onViewDetails }) {
  if (!event) {
    return null
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
            <span>
              {formatEventDate(event.startDate)} • {event.timeLabel}
            </span>
          </div>
          <div>
            <MapPinIcon />
            <span>{event.location}</span>
          </div>
        </div>

        <div className="featured-event__actions">
          <PrimaryButton onClick={() => onViewDetails(event.id)}>
            <span>View Event Details</span>
            <ArrowRightIcon />
          </PrimaryButton>
          <p>Join {event.attendeeCount.toLocaleString()} others already attending.</p>
        </div>
      </div>

      <div className="featured-event__media">
        <img src={event.image} alt={event.imageLabel} />
      </div>
    </section>
  )
}

export default FeaturedEvent
