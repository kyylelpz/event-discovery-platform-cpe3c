import EventCard from './EventCard.jsx'

function EventList({ events, emptyTitle, emptyCopy, ...cardProps }) {
  if (!events.length) {
    return (
      <div className="empty-state">
        <h3>{emptyTitle}</h3>
        <p>{emptyCopy}</p>
      </div>
    )
  }

  return (
    <div className="event-grid">
      {events.map((event) => (
        <EventCard key={event.id} event={event} {...cardProps} />
      ))}
    </div>
  )
}

export default EventList
