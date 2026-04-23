import { useEffect, useRef, useState } from 'react'
import { PrimaryButton } from '../ui/Button.jsx'
import {
  ArrowRightIcon,
  BookmarkIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  MapPinIcon,
  StarIcon,
} from '../ui/Icons.jsx'
import CategoryTag from '../ui/CategoryTag.jsx'
import { formatEventSchedule, getResponsiveImageProps } from '../../utils/formatters.js'

const FEATURED_EVENT_ROTATION_INTERVAL_MS = 5000
const FEATURED_EVENT_TITLE_MAX_LENGTH = 44
const FEATURED_EVENT_DESCRIPTION_MAX_LENGTH = 68
const FEATURED_EVENT_SCHEDULE_MAX_LENGTH = 42
const FEATURED_EVENT_LOCATION_MAX_LENGTH = 38

const truncateText = (value, maxLength) => {
  const normalizedValue = String(value || '').trim()

  if (normalizedValue.length <= maxLength) {
    return normalizedValue
  }

  return `${normalizedValue.slice(0, maxLength).trimEnd()}...`
}

function FeaturedEvent({
  events,
  interactions,
  onViewDetails,
  onToggleHeart,
  onToggleSave,
  onToggleAttend,
}) {
  const slides = Array.isArray(events) ? events.filter((item) => item?.event) : []
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progressKey, setProgressKey] = useState(0)
  const sliderRef = useRef(null)

  useEffect(() => {
    setActiveIndex(0)
    setProgressKey((currentKey) => currentKey + 1)
  }, [events])

  useEffect(() => {
    if (slides.length < 2 || isPaused) {
      return undefined
    }

    const rotationTimer = window.setInterval(() => {
      setActiveIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % slides.length
        setProgressKey((currentKey) => currentKey + 1)
        return nextIndex
      })
    }, FEATURED_EVENT_ROTATION_INTERVAL_MS)

    return () => window.clearInterval(rotationTimer)
  }, [isPaused, slides.length])

  if (!slides.length) {
    return null
  }

  const goToSlide = (nextIndex) => {
    setProgressKey((currentKey) => currentKey + 1)
    setActiveIndex((nextIndex + slides.length) % slides.length)
  }

  const handleImageError = (eventObject, slideEvent) => {
    if (!slideEvent.fallbackImage || eventObject.currentTarget.dataset.fallbackApplied === 'true') {
      return
    }

    eventObject.currentTarget.dataset.fallbackApplied = 'true'
    eventObject.currentTarget.src = slideEvent.fallbackImage
    eventObject.currentTarget.srcset = ''
  }

  return (
    <section
      ref={sliderRef}
      className="featured-event"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(eventObject) => {
        if (!sliderRef.current?.contains(eventObject.relatedTarget)) {
          setIsPaused(false)
        }
      }}
    >
      {slides.length > 1 ? (
        <div className="featured-event__progress-shell">
          <div className="featured-event__progress" aria-label="Featured event progress">
            {slides.map((progressSlide, index) => (
              <button
                key={progressSlide.event.id}
                type="button"
                className={`featured-event__progress-segment ${
                  index === activeIndex ? 'featured-event__progress-segment--active' : ''
                }`}
                aria-label={`Show featured event ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => goToSlide(index)}
              >
                <span
                  key={
                    index === activeIndex
                      ? `${progressSlide.event.id}:${progressKey}`
                      : progressSlide.event.id
                  }
                  className={`featured-event__progress-fill ${
                    index === activeIndex ? 'featured-event__progress-fill--active' : ''
                  }`}
                  style={{
                    animationDuration: `${FEATURED_EVENT_ROTATION_INTERVAL_MS}ms`,
                    animationPlayState: isPaused ? 'paused' : 'running',
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            className="featured-event__hover-nav featured-event__hover-nav--prev"
            aria-label="Show previous featured event"
            onClick={() => goToSlide(activeIndex - 1)}
          >
            <span className="featured-event__hover-arrow">
              <ChevronLeftIcon />
            </span>
          </button>

          <button
            type="button"
            className="featured-event__hover-nav featured-event__hover-nav--next"
            aria-label="Show next featured event"
            onClick={() => goToSlide(activeIndex + 1)}
          >
            <span className="featured-event__hover-arrow">
              <ChevronRightIcon />
            </span>
          </button>
        </>
      ) : null}

      <div className="featured-event__viewport">
        <div
          className="featured-event__track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide) => {
            const slideEvent = slide.event
            const scheduleLabel = formatEventSchedule(slideEvent)
            const featuredTitle = truncateText(slideEvent.title, FEATURED_EVENT_TITLE_MAX_LENGTH)
            const featuredDescription = truncateText(
              slideEvent.description,
              FEATURED_EVENT_DESCRIPTION_MAX_LENGTH,
            )
            const featuredSchedule = truncateText(
              scheduleLabel,
              FEATURED_EVENT_SCHEDULE_MAX_LENGTH,
            )
            const featuredLocation = truncateText(
              slideEvent.location,
              FEATURED_EVENT_LOCATION_MAX_LENGTH,
            )
            const featuredImage = getResponsiveImageProps(slideEvent.image)
            const locationHref = slideEvent.mapUrl
            const eventId = String(slideEvent?.id || '').trim()
            const isHearted = interactions?.hearted?.includes(eventId)
            const isSaved = interactions?.saved?.includes(eventId)
            const isAttending = interactions?.attending?.includes(eventId)

            return (
              <article key={eventId} className="featured-event__slide">
                <div className="featured-event__content">
                  <CategoryTag>{slideEvent.category}</CategoryTag>
                  <div className="featured-event__copy">
                    <span className="featured-event__eyebrow">Featured Event</span>
                    <div className="featured-event__field-shell featured-event__field-shell--title">
                      <h1 title={slideEvent.title}>{featuredTitle}</h1>
                    </div>
                    <div className="featured-event__field-shell featured-event__field-shell--description">
                      <p title={slideEvent.description}>{featuredDescription}</p>
                    </div>
                  </div>

                  <div className="featured-event__meta">
                    <div className="event-meta-item featured-event__meta-item-shell">
                      <CalendarIcon />
                      <span
                        className="event-meta-item__content featured-event__meta-text"
                        title={scheduleLabel}
                      >
                        {featuredSchedule}
                      </span>
                    </div>
                    <div className="event-meta-item featured-event__meta-item-shell">
                      <MapPinIcon />
                      {locationHref ? (
                        <a
                          className="event-meta-item__content featured-event__location-link featured-event__meta-text"
                          href={locationHref}
                          target="_blank"
                          rel="noreferrer"
                          title={slideEvent.location}
                        >
                          {featuredLocation}
                        </a>
                      ) : (
                        <span
                          className="event-meta-item__content featured-event__meta-text"
                          title={slideEvent.location}
                        >
                          {featuredLocation}
                        </span>
                      )}
                    </div>
                    {slideEvent.venueRating > 0 ? (
                      <div className="event-meta-item">
                        <StarIcon filled />
                        <span className="event-meta-item__content">
                          {slideEvent.venueRating.toFixed(1)} venue rating
                          {slideEvent.venueReviewCount > 0
                            ? ` · ${slideEvent.venueReviewCount} reviews`
                            : ''}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="featured-event__actions">
                    <p
                      className={`status-note featured-event__status-note ${
                        slide.matchedInterest ? '' : 'featured-event__status-note--empty'
                      }`}
                      aria-hidden={slide.matchedInterest ? undefined : 'true'}
                    >
                      {slide.matchedInterest
                        ? `Matched to your interest in ${slide.matchedInterest}.`
                        : 'Matched interest placeholder.'}
                    </p>

                    <div className="featured-event__primary-actions">
                      <PrimaryButton onClick={() => onViewDetails(slideEvent.id)}>
                        <span>View Event Details</span>
                        <ArrowRightIcon />
                      </PrimaryButton>

                      <button
                        type="button"
                        className={`attend-chip ${isAttending ? 'attend-chip--active' : ''}`}
                        onClick={() => onToggleAttend(slideEvent)}
                      >
                        {isAttending ? <CheckIcon /> : null}
                        <span>{isAttending ? 'Attending' : 'Attend'}</span>
                      </button>

                      <div
                        className="featured-event__quick-actions"
                        aria-label="Featured event actions"
                      >
                        <button
                          type="button"
                          className="icon-box"
                          onClick={() => onToggleHeart(slideEvent)}
                          aria-label="Like featured event"
                          title={isHearted ? 'Remove favorite' : 'Add to favorites'}
                        >
                          <HeartIcon
                            className={isHearted ? 'icon-accent icon-filled' : ''}
                            filled={Boolean(isHearted)}
                          />
                        </button>
                        <button
                          type="button"
                          className="icon-box"
                          onClick={() => onToggleSave(slideEvent)}
                          aria-label="Save featured event"
                          title={isSaved ? 'Remove bookmark' : 'Bookmark event'}
                        >
                          <BookmarkIcon
                            className={isSaved ? 'icon-accent icon-filled' : ''}
                            filled={Boolean(isSaved)}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="featured-event__media">
                  <img
                    src={featuredImage.src}
                    srcSet={featuredImage.srcSet}
                    sizes="(max-width: 920px) 100vw, 52vw"
                    alt={slideEvent.imageLabel}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    referrerPolicy="no-referrer"
                    onError={(eventObject) => handleImageError(eventObject, slideEvent)}
                  />
                </div>
              </article>
            )
          })}
        </div>
      </div>

    </section>
  )
}

export default FeaturedEvent
