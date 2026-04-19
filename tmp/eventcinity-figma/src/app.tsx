import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { FilterTabs } from './components/FilterTabs';
import { EventList } from './components/EventList';
import { FeaturedEvent } from './components/FeaturedEvent';
import { CategoryHighlight } from './components/CategoryHighlight';
import { Footer } from './components/Footer';
import { EventDetail } from './pages/EventDetail';
import { CreateEvent } from './pages/CreateEvent';
import { UserProfile } from './pages/UserProfile';
import { ConnectPeople } from './pages/ConnectPeople';
import { SignIn } from './pages/SignIn';

const categories = ['All Events', 'Music', 'Art & Culture', 'Business', 'Food & Drink', 'Sports', 'Tech'];

const mockEvents = [
  {
    id: '1',
    title: 'Summer Music Festival 2026',
    date: 'Jun 15, 2026',
    time: '6:00 PM',
    location: 'Mall of Asia Arena, Metro Manila',
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1549452026-91574599e7f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    attendees: 1247
  },
  {
    id: '2',
    title: 'Tech Innovation Summit',
    date: 'May 22, 2026',
    time: '9:00 AM',
    location: 'SMX Convention Center, Metro Manila',
    category: 'Business',
    imageUrl: 'https://images.unsplash.com/photo-1775163560631-6ff15eb2fa1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    attendees: 856
  },
  {
    id: '3',
    title: 'Contemporary Art Exhibition',
    date: 'Apr 28, 2026',
    time: '11:00 AM',
    location: 'National Museum, Metro Manila',
    category: 'Art & Culture',
    imageUrl: 'https://images.unsplash.com/photo-1569342380852-035f42d9ca41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    attendees: 432
  },
  {
    id: '4',
    title: 'Live Jazz Night',
    date: 'Apr 25, 2026',
    time: '8:00 PM',
    location: 'Black Market, Makati',
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1669485443515-3d2c2553bc12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    attendees: 189
  },
  {
    id: '5',
    title: 'Startup Networking Mixer',
    date: 'May 10, 2026',
    time: '6:30 PM',
    location: 'BGC Arts Center, Taguig',
    category: 'Business',
    imageUrl: 'https://images.unsplash.com/photo-1571645163064-77faa9676a46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    attendees: 623
  },
  {
    id: '6',
    title: 'Electronic Dance Festival',
    date: 'Jul 4, 2026',
    time: '7:00 PM',
    location: 'PICC Grounds, Metro Manila',
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1761926826313-a1787661b7b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    attendees: 2134
  },
  {
    id: '7',
    title: 'Museum Night: Ancient Civilizations',
    date: 'May 5, 2026',
    time: '7:00 PM',
    location: 'Ayala Museum, Makati',
    category: 'Art & Culture',
    imageUrl: 'https://images.unsplash.com/photo-1723721229325-b286656e768a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    attendees: 567
  },
  {
    id: '8',
    title: 'Annual Conference on Innovation',
    date: 'Jun 1, 2026',
    time: '8:00 AM',
    location: 'Okada Manila, Parañaque',
    category: 'Business',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    attendees: 1456
  },
  {
    id: '9',
    title: 'Indie Rock Concert Series',
    date: 'May 18, 2026',
    time: '9:00 PM',
    location: '123 Block, Mandaluyong',
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1723465522876-18554cddbb23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    attendees: 342
  }
];

export default function App() {
  const [view, setView] = useState('home');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All Events');
  const [selectedLocation, setSelectedLocation] = useState('Metro Manila');

  const filteredEvents = activeCategory === 'All Events'
    ? mockEvents
    : mockEvents.filter(event => event.category === activeCategory);

  const selectedEvent = mockEvents.find(e => e.id === selectedEventId);

  const mockUser = {
    name: 'Sarah Johnson',
    username: 'sarahj',
    bio: 'Event enthusiast and community organizer. Passionate about bringing people together through unforgettable experiences.',
    location: 'New York, NY',
    avatar: undefined,
    joinedDate: 'January 2024'
  };

  const handleEventClick = (eventId) => {
    setSelectedEventId(eventId);
    setView('detail');
  };

  const handleBackToHome = () => {
    setView('home');
    setSelectedEventId(null);
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  if (view === 'connect') {
    return (
      <>
        <Navbar
          onLogoClick={handleBackToHome}
          onCreateClick={() => setView('create')}
          onFindPeopleClick={() => setView('connect')}
          onSignInClick={() => setView('signin')}
          onLocationChange={handleLocationChange}
          onFindEventsClick={handleBackToHome}
        />
        <ConnectPeople onBack={handleBackToHome} />
      </>
    );
  }

  if (view === 'signin') {
    return (
      <>
        <Navbar
          onLogoClick={handleBackToHome}
          onCreateClick={() => setView('create')}
          onFindPeopleClick={() => setView('connect')}
          onSignInClick={() => setView('signin')}
          onLocationChange={handleLocationChange}
          onFindEventsClick={handleBackToHome}
        />
        <SignIn onBack={handleBackToHome} />
      </>
    );
  }

  if (view === 'detail' && selectedEvent) {
    return (
      <>
        <Navbar
          onLogoClick={handleBackToHome}
          onCreateClick={() => setView('create')}
          onFindPeopleClick={() => setView('connect')}
          onSignInClick={() => setView('signin')}
          onLocationChange={handleLocationChange}
          onFindEventsClick={handleBackToHome}
        />
        <EventDetail event={selectedEvent} onBack={handleBackToHome} />
      </>
    );
  }

  if (view === 'create') {
    return (
      <>
        <Navbar
          onLogoClick={handleBackToHome}
          onCreateClick={() => setView('create')}
          onFindPeopleClick={() => setView('connect')}
          onSignInClick={() => setView('signin')}
          onLocationChange={handleLocationChange}
          onFindEventsClick={handleBackToHome}
        />
        <CreateEvent onBack={handleBackToHome} />
      </>
    );
  }

  if (view === 'profile') {
    return (
      <>
        <Navbar
          onLogoClick={handleBackToHome}
          onCreateClick={() => setView('create')}
          onFindPeopleClick={() => setView('connect')}
          onSignInClick={() => setView('signin')}
          onLocationChange={handleLocationChange}
          onFindEventsClick={handleBackToHome}
        />
        <UserProfile
          user={mockUser}
          createdEvents={mockEvents.slice(0, 3)}
          savedEvents={mockEvents.slice(3, 7)}
          onBack={handleBackToHome}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col">
      <Navbar
        onLogoClick={handleBackToHome}
        onCreateClick={() => setView('create')}
        onFindPeopleClick={() => setView('connect')}
        onSignInClick={() => setView('signin')}
        onLocationChange={handleLocationChange}
        onFindEventsClick={handleBackToHome}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-12 w-full">
        <FeaturedEvent
          event={mockEvents[0]}
          onViewDetails={() => handleEventClick(mockEvents[0].id)}
        />

        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-xl sm:text-2xl text-[#020202]">Browse by Category</h2>
            <p className="text-sm sm:text-base text-[#696258]">Explore events that match your interests</p>
          </div>
          <CategoryHighlight onCategoryClick={setActiveCategory} />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#020202]">
                {activeCategory === 'All Events' ? 'Upcoming Events' : activeCategory}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-[#696258]">
                {selectedLocation === 'All Luzon' ? 'Events across Luzon' : `Events in ${selectedLocation}`}
              </p>
            </div>
            <span className="text-sm sm:text-base text-[#696258] shrink-0">{filteredEvents.length} events</span>
          </div>

          <FilterTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        <EventList events={filteredEvents} onEventClick={handleEventClick} />
      </main>

      <Footer />
    </div>
  );
}
