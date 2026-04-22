import {
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  LightbulbIcon,
  MapPinIcon,
  ShareIcon,
} from '../../components/ui/Icons.jsx'

function EventPlanningPage() {
  return (
    <div className="info-page">
      <section className="info-page__hero">
        <div className="info-page__hero-icon">
          <CalendarIcon />
        </div>
        <h1>Event Planning</h1>
        <p>
          Everything you need to plan a memorable event in the Philippines - from venue
          scouting to day-of coordination.
        </p>
      </section>

      <section className="info-page__grid">
        <article className="info-card">
          <div className="info-card__header">
            <div className="info-card__icon">
              <LightbulbIcon />
            </div>
            <h2>Define your concept</h2>
          </div>
          <p>
            Start with a clear vision: the occasion, your target audience, and the
            atmosphere you want to create. A strong concept guides every decision that
            follows.
          </p>
        </article>
        <article className="info-card">
          <div className="info-card__header">
            <div className="info-card__icon">
              <BriefcaseIcon />
            </div>
            <h2>Set a budget</h2>
          </div>
          <p>
            Outline your expected costs early - venue, catering, equipment, promotion,
            and contingency. Tracking spending from day one keeps surprises to a minimum.
          </p>
        </article>
        <article className="info-card">
          <div className="info-card__header">
            <div className="info-card__icon">
              <MapPinIcon />
            </div>
            <h2>Choose a venue</h2>
          </div>
          <p>
            Match your venue to your crowd size and vibe. Consider accessibility,
            parking, audio-visual capabilities, and whether the location fits your
            event&apos;s tone.
          </p>
        </article>
        <article className="info-card">
          <div className="info-card__header">
            <div className="info-card__icon">
              <CalendarIcon />
            </div>
            <h2>Build a timeline</h2>
          </div>
          <p>
            Work backwards from your event date. Assign deadlines for bookings,
            promotions, confirmations, and rehearsals so nothing gets left to the last
            minute.
          </p>
        </article>
        <article className="info-card">
          <div className="info-card__header">
            <div className="info-card__icon">
              <ShareIcon />
            </div>
            <h2>Promote effectively</h2>
          </div>
          <p>
            Use Eventcinity to publish your event and reach attendees across the
            Philippines. Share early, share often, and keep your listing updated as
            details are confirmed.
          </p>
        </article>
        <article className="info-card">
          <div className="info-card__header">
            <div className="info-card__icon">
              <CheckIcon />
            </div>
            <h2>Day-of checklist</h2>
          </div>
          <p>
            Arrive early, confirm vendor arrivals, test equipment, and brief your team.
            Having a printed run-of-show keeps everyone on the same page when things get
            busy.
          </p>
        </article>
      </section>
    </div>
  )
}

export default EventPlanningPage
