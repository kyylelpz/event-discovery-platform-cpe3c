import { EventCard } from './EventCard';

export function EventList({ events, onEventClick }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onClick={() => {
            if (onEventClick) onEventClick(event.id);
          }}
        />
      ))}
    </div>
  );
}
