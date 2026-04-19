import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Button } from './Button';

export function FeaturedEvent({ event, onViewDetails }) {
  return (
    <div className="relative overflow-hidden rounded-xl lg:rounded-2xl bg-[#FCFCFC] border border-[#C0C0C1]">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="order-2 lg:order-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <span className="inline-block px-3 py-1 text-xs sm:text-sm bg-[#2D3B15] text-[#FCFCFC] rounded-full">
              Featured Event
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-[#020202] leading-tight">
              {event.title}
            </h2>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3 text-[#696258]">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-sm sm:text-base">
                {event.date} • {event.time}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-[#696258]">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-sm sm:text-base">{event.location}</span>
            </div>
          </div>

          <div className="pt-2 sm:pt-4">
            <Button onClick={onViewDetails} className="flex items-center justify-center gap-2 w-full sm:w-auto">
              <span className="text-sm sm:text-base">View Event Details</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {event.attendees && (
            <p className="text-xs sm:text-sm text-[#696258]">
              Join {event.attendees.toLocaleString()} others already attending
            </p>
          )}
        </div>

        <div className="order-1 lg:order-2 relative h-48 sm:h-64 lg:h-auto min-h-[300px]">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
