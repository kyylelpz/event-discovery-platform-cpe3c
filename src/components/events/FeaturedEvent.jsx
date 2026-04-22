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
} from '../ui/Icons.jsx'
import CategoryTag from '../ui/CategoryTag.jsx'
import { formatEventSchedule, getResponsiveImageProps } from '../../utils/formatters.js'

const FEATURED_EVENT_ROTATION_INTERVAL_MS = 5000

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
  const sliderRef = useRef(null)

  useEffect(() => {
    setActiveIndex(0)
  }, [events])

  useEffect(() => {
    if (slides.length < 2 || isPaused) {
      return undefined
    }

    const rotationTimer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length)
    }, FEATURED_EVENT_ROTATION_INTERVAL_MS)

    return () => window.clearInterval(rotationTimer)
  }, [isPaused, slides.length])

  if (!slides.length) {
    return null
  }

  const goToSlide = (nextIndex) => {
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
                    <h1>{slideEvent.title}</h1>
                    <p>{slideEvent.description}</p>
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
                          {slideEvent.location}
                        </a>
                      ) : (
                        <span className="event-meta-item__content">{slideEvent.location}</span>
                      )}
                    </div>
                  </div>

                  <div className="featured-event__actions">
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
                    </div>

                    <div
                      className="featured-event__quick-actions"
                      aria-label="Featured event actions"
                    >
                      <button
                        type="button"
                        className="icon-box"
                        onClick={() => onToggleHeart(slideEvent)}
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
                        onClick={() => onToggleSave(slideEvent)}
                        aria-label="Save featured event"
                      >
                        <BookmarkIcon
                          className={isSaved ? 'icon-accent icon-filled' : ''}
                          filled={Boolean(isSaved)}
                        />
                      </button>
                    </div>

                    {slide.matchedInterest ? (
                      <p className="status-note">
                        Matched to your interest in {slide.matchedInterest}.
                      </p>
                    ) : null}
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

      {slides.length > 1 ? (
        <div className="featured-event__pagination" aria-label="Featured event slides">
          {slides.map((slide, index) => (
            <button
              key={slide.event.id}
              type="button"
              className={`featured-event__dot ${
                index === activeIndex ? 'featured-event__dot--active' : ''
              }`}
              aria-label={`Go to featured event ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default FeaturedEvent
