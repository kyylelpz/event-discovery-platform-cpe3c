import { Calendar, MapPin, Users, Share2, ArrowLeft, Heart, Bookmark, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/Button';
import { CategoryTag } from '../components/CategoryTag';
import { UserAvatar } from '../components/UserAvatar';
import { Footer } from '../components/Footer';

export function EventDetail({ event, onBack }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAttending, setIsAttending] = useState(false);

  const description = event.description || 'Join us for an unforgettable experience! This event brings together passionate individuals from all walks of life to celebrate, learn, and connect. Whether you\'re a first-timer or a seasoned attendee, you\'ll find something special waiting for you. Don\'t miss out on this opportunity to be part of something extraordinary.';

  const host = event.host || {
    name: 'Event Organizer',
    avatar: undefined
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC]">
      {onBack && (
        <button
          onClick={onBack}
          className="fixed top-20 left-4 z-10 p-2 sm:p-3 bg-[#FCFCFC] border border-[#C0C0C1] rounded-full hover:bg-[#C0C0C1]/20 transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#020202]" />
        </button>
      )}

      <div className="relative h-[250px] sm:h-[350px] lg:h-[400px] overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202]/60 to-transparent" />
        <div className="absolute bottom-4 sm:bottom-8 left-0 right-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <CategoryTag category={event.category} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#020202]">{event.title}</h1>

              <div className="flex items-center gap-3 sm:gap-4">
                <UserAvatar name={host.name} imageUrl={host.avatar} size="sm" />
                <div>
                  <p className="text-xs sm:text-sm text-[#696258]">Hosted by</p>
                  <p className="text-sm sm:text-base text-[#020202]">{host.name}</p>
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl sm:text-2xl text-[#020202] mb-3 sm:mb-4">About this event</h3>
              <p className="text-sm sm:text-base text-[#696258] leading-relaxed">{description}</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xl sm:text-2xl text-[#020202]">Location</h3>
              <div className="p-4 sm:p-6 border border-[#C0C0C1] rounded-lg bg-[#FCFCFC]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#696258] mt-1 shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base text-[#020202]">{event.location}</p>
                    <button className="text-sm sm:text-base text-[#2D3B15] hover:underline mt-2">
                      View on map
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {event.attendees && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xl sm:text-2xl text-[#020202]">Attendees ({event.attendees})</h3>
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C0C0C1] border-2 border-[#FCFCFC]"
                    />
                  ))}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#2D3B15] border-2 border-[#FCFCFC] flex items-center justify-center text-xs text-[#FCFCFC]">
                    +{event.attendees - 5}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6 p-4 sm:p-6 border border-[#C0C0C1] rounded-lg bg-[#FCFCFC]">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#696258] mt-1 shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-[#696258]">Date & Time</p>
                    <p className="text-sm sm:text-base text-[#020202]">{event.date}</p>
                    <p className="text-sm sm:text-base text-[#020202]">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#696258] mt-1 shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-[#696258]">Attendees</p>
                    <p className="text-sm sm:text-base text-[#020202]">{event.attendees || 0} going</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 pt-4 border-t border-[#C0C0C1]">
                <button
                  onClick={() => setIsAttending(!isAttending)}
                  className={`w-full px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    isAttending
                      ? 'bg-[#2D3B15] text-[#FCFCFC]'
                      : 'bg-[#2D3B15] text-[#FCFCFC] hover:bg-[#2D3B15]/90'
                  }`}
                >
                  {isAttending && <Check className="w-4 h-4" />}
                  {isAttending ? 'Attending' : 'Attend Event'}
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="px-4 py-2 border border-[#C0C0C1] rounded-lg hover:border-[#2D3B15] transition-colors flex items-center justify-center"
                    title="Like"
                  >
                    <Heart
                      className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-[#696258]'}`}
                    />
                  </button>
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className="px-4 py-2 border border-[#C0C0C1] rounded-lg hover:border-[#2D3B15] transition-colors flex items-center justify-center"
                    title="Save"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isSaved ? 'fill-[#2D3B15] text-[#2D3B15]' : 'text-[#696258]'}`}
                    />
                  </button>
                  <button
                    className="px-4 py-2 border border-[#C0C0C1] rounded-lg hover:border-[#2D3B15] transition-colors flex items-center justify-center"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4 text-[#696258]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
