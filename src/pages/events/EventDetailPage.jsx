import { useState } from 'react'
import EventList from '../../components/events/EventList.jsx'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Button.jsx'
import CategoryTag from '../../components/ui/CategoryTag.jsx'
import UserAvatar from '../../components/ui/UserAvatar.jsx'
import {
  ArrowRightIcon,
  BookmarkIcon,
  CalendarIcon,
  HeartIcon,
  LinkIcon,
  MapPinIcon,
  StarIcon,
} from '../../components/ui/Icons.jsx'
import {
  buildGoogleMapsEmbedUrl,
  formatEventSchedule,
  getResponsiveImageProps,
} from '../../utils/formatters.js'
import { routes } from '../../utils/routing.js'

function EventDetailPage({
  event,
  relatedEvents,
  interactions,
  onToggleHeart,
  onToggleSave,
  onToggleAttend,
  onOpenEvent,
  currentUser,
  onEditEvent,
}) {
  const [shareStatus, setShareStatus] = useState('')
  const eventId = String(event?.id || '').trim()
  const isSaved = interactions.saved.includes(eventId)
  const isAttending = interactions.attending.includes(eventId)
  const isHearted = interactions.hearted.includes(eventId)
  const scheduleLabel = formatEventSchedule(event)
  const detailImage = getResponsiveImageProps(event.image)
  const locationHref = event.mapUrl
  const mapQuery = event.mapLabel || event.location
  const mapEmbedUrl = buildGoogleMapsEmbedUrl(mapQuery)
  const venueLabel = event.venue || event.location
  const currentUserId = String(currentUser?.id || '').trim()
  const eventOwnerId = String(event?.ownerId || '').trim()
  const currentUsername = String(currentUser?.username || '').trim().toLowerCase()
  const eventCreatorUsername = String(event?.createdBy || '').trim().toLowerCase()
  const canEditEvent =
    Boolean(onEditEvent) &&
    event.source === 'created' &&
    ((currentUserId && eventOwnerId && currentUserId === eventOwnerId) ||
      (currentUsername && eventCreatorUsername && currentUsername === eventCreatorUsername))
  const detailRouteId = String(event?.eventId || event?.id || '').trim()
  const shareUrl =
    typeof window !== 'undefined' && detailRouteId
      ? new URL(routes.eventDetail(detailRouteId), window.location.origin).toString()
      : ''
  const handleImageError = (eventObject) => {
    if (!event.fallbackImage || eventObject.currentTarget.dataset.fallbackApplied === 'true') {
      return
    }

    eventObject.currentTarget.dataset.fallbackApplied = 'true'
    eventObject.currentTarget.src = event.fallbackImage
    eventObject.currentTarget.srcset = ''
  }

  const handleCopyLink = async () => {
    if (!shareUrl) {
      setShareStatus('Unable to build this event link.')
      return
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const tempInput = document.createElement('input')
        tempInput.value = shareUrl
        document.body.appendChild(tempInput)
        tempInput.select()
        document.execCommand('copy')
        document.body.removeChild(tempInput)
      }

      setShareStatus('Event link copied to clipboard.')
      window.setTimeout(() => setShareStatus(''), 2200)
    } catch {
      setShareStatus('Unable to copy the event link right now.')
    }
  }

  return (
    <div className="page-stack page-stack--detail">
      <section className="detail-hero">
        <div className="detail-hero__image-wrap">
          <img
            className="detail-hero__image"
            src={detailImage.src}
            srcSet={detailImage.srcSet}
            sizes="100vw"
            alt={event.imageLabel}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />
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
              <p>
                {event.description}
                {event.eventUrl ? (
                  <>
                    {' '}
                    <a
                      className="detail-source-link"
                      href={event.eventUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View original listing
                    </a>
                  </>
                ) : null}
              </p>
            </article>

            <article className="detail-section">
              <h3>Location</h3>
              {mapEmbedUrl ? (
                <div className="detail-map">
                  <div className="detail-map__header">
                    <span className="detail-map__eyebrow">Venue guide</span>
                    <div className="detail-map__headline">
                      <div className="detail-map__address">
                        <strong>{venueLabel}</strong>
                        <p>Pan and zoom here, then continue in Google Maps for live directions.</p>
                      </div>

                      {locationHref ? (
                        <a
                          className="button button--primary detail-map__cta"
                          href={locationHref}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span>Continue in Google Maps</span>
                          <ArrowRightIcon />
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="detail-map__frame">
                    <div className="detail-map__badge">
                      <MapPinIcon />
                      <span>Interactive map preview</span>
                    </div>

                    <iframe
                      className="detail-map__embed"
                      title={`Map for ${event.title}`}
                      src={mapEmbedUrl}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              ) : (
                <div className="detail-place-card">
                  <MapPinIcon />
                  <div>
                    <strong>{event.location}</strong>
                    <p>Location details available</p>
                  </div>
                </div>
              )}
            </article>
          </div>

          <aside className="detail-layout__sidebar">
            <div className="detail-panel">
              <div className="detail-panel__meta">
                <div className="detail-panel__meta-item">
                  <CalendarIcon />
                  <div className="detail-panel__meta-content">
                    <p>Date & Time</p>
                    <strong>{scheduleLabel}</strong>
                  </div>
                </div>
                <div className="detail-panel__meta-item">
                  <MapPinIcon />
                  <div className="detail-panel__meta-content">
                    <p>Venue</p>
                    {locationHref ? (
                      <a
                        className="detail-location-link"
                        href={locationHref}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {venueLabel}
                      </a>
                    ) : (
                      <strong>{venueLabel}</strong>
                    )}
                  </div>
                </div>
                {event.venueRating > 0 ? (
                  <div className="detail-panel__meta-item">
                    <StarIcon filled />
                    <div className="detail-panel__meta-content">
                      <p>Venue Reviews</p>
                      <strong>
                        {event.venueRating.toFixed(1)} / 5
                        {event.venueReviewCount > 0
                          ? ` from ${event.venueReviewCount} reviews`
                          : ''}
                      </strong>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="detail-panel__actions">
                {canEditEvent ? (
                  <SecondaryButton
                    onClick={() => onEditEvent(event)}
                    className="detail-panel__edit"
                  >
                    Edit Event
                  </SecondaryButton>
                ) : null}
                <PrimaryButton
                  onClick={() => onToggleAttend(event)}
                  className="detail-panel__attend"
                >
                  {isAttending ? 'Attending' : 'Attend Event'}
                </PrimaryButton>

                <div className="detail-panel__icon-row">
                  <button
                    type="button"
                    className="icon-box"
                    onClick={() => onToggleHeart(event)}
                  >
                    <HeartIcon
                      filled={isHearted}
                      className={isHearted ? 'icon-accent icon-filled' : ''}
                    />
                  </button>
                  <button
                    type="button"
                    className="icon-box"
                    onClick={() => onToggleSave(event)}
                  >
                    <BookmarkIcon
                      filled={isSaved}
                      className={isSaved ? 'icon-accent icon-filled' : ''}
                    />
                  </button>
                  <button
                    type="button"
                    className="icon-box"
                    onClick={handleCopyLink}
                    aria-label="Copy event link"
                    title={shareUrl || 'Event link unavailable'}
                  >
                    <LinkIcon />
                  </button>
                </div>
                {shareStatus ? (
                  <p className="detail-panel__share-status">{shareStatus}</p>
                ) : null}
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
