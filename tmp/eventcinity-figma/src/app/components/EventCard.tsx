import { Calendar, MapPin, Bookmark, Heart, Check } from 'lucide-react';
import { CategoryTag } from './CategoryTag';
import { useState } from 'react';

export function EventCard({ event, onClick }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAttending, setIsAttending] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-[#FCFCFC] border border-[#C0C0C1] rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="p-2 bg-[#FCFCFC]/90 rounded-full hover:bg-[#FCFCFC] transition-colors"
            title="Like"
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-[#696258]'}`}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
            className="p-2 bg-[#FCFCFC]/90 rounded-full hover:bg-[#FCFCFC] transition-colors"
            title="Save"
          >
            <Bookmark
              className={`w-4 h-4 ${isSaved ? 'fill-[#2D3B15] text-[#2D3B15]' : 'text-[#696258]'}`}
            />
          </button>
        </div>
        <div className="absolute bottom-3 left-3">
          <CategoryTag category={event.category} />
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        <h3 className="text-lg sm:text-xl text-[#020202] line-clamp-2 group-hover:text-[#2D3B15] transition-colors">
          {event.title}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#696258]">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm">
              {event.date} • {event.time}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#696258]">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm line-clamp-1">{event.location}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#C0C0C1] flex items-center justify-between gap-2">
          {event.attendees && (
            <span className="text-xs sm:text-sm text-[#696258] shrink-0">{event.attendees} attending</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAttending(!isAttending);
            }}
            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full transition-colors flex items-center gap-1 shrink-0 ${
              isAttending
                ? 'bg-[#2D3B15] text-[#FCFCFC]'
                : 'border border-[#2D3B15] text-[#2D3B15] hover:bg-[#2D3B15] hover:text-[#FCFCFC]'
            }`}
          >
            {isAttending && <Check className="w-3 h-3" />}
            {isAttending ? 'Attending' : 'Attend'}
          </button>
        </div>
      </div>
    </div>
  );
}
