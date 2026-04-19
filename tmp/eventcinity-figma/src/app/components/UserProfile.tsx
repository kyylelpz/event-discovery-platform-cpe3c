import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { EventCard } from './EventCard';
import { Button } from './Button';
import { Footer } from './Footer';

export function UserProfile({ user, createdEvents, savedEvents, onBack }) {
  const [activeTab, setActiveTab] = useState('created');

  const displayEvents = activeTab === 'created' ? createdEvents : savedEvents;

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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-[#C0C0C1]">
            <UserAvatar name={user.name} imageUrl={user.avatar} size="lg" />

            <div className="flex-1 space-y-3 sm:space-y-4 w-full">
              <div>
                <h1 className="text-2xl sm:text-3xl text-[#020202]">{user.name}</h1>
                <p className="text-sm sm:text-base text-[#696258]">@{user.username}</p>
              </div>

              {user.bio && (
                <p className="text-sm sm:text-base text-[#696258] max-w-2xl">{user.bio}</p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-[#696258]">
                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.joinedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Joined {user.joinedDate}</span>
                  </div>
                )}
              </div>

              <Button variant="secondary" className="w-full sm:w-auto">Edit Profile</Button>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-4 border-b border-[#C0C0C1] overflow-x-auto">
              <button
                onClick={() => setActiveTab('created')}
                className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'created'
                    ? 'border-[#2D3B15] text-[#020202]'
                    : 'border-transparent text-[#696258] hover:text-[#020202]'
                }`}
              >
                Created Events ({createdEvents.length})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'saved'
                    ? 'border-[#2D3B15] text-[#020202]'
                    : 'border-transparent text-[#696258] hover:text-[#020202]'
                }`}
              >
                Saved Events ({savedEvents.length})
              </button>
            </div>

            {displayEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-[#696258] text-lg">
                  {activeTab === 'created'
                    ? 'No events created yet'
                    : 'No saved events yet'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
