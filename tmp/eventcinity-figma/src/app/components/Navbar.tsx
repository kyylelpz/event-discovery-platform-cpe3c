import { Search, MapPin, Calendar, UserPlus, LogIn, Menu, X } from 'lucide-react';
import { useState } from 'react';

const luzonProvinces = [
  'All Luzon',
  'Metro Manila',
  'Batangas',
  'Cavite',
  'Laguna',
  'Rizal',
  'Bulacan',
  'Pampanga',
  'Bataan',
  'Nueva Ecija',
  'Tarlac',
  'Zambales',
  'Pangasinan',
  'La Union',
  'Ilocos Norte',
  'Ilocos Sur',
  'Benguet',
  'Cagayan',
  'Isabela',
  'Aurora',
  'Quezon',
  'Albay',
  'Camarines Norte',
  'Camarines Sur'
];

export function Navbar({
  onCreateClick,
  onFindPeopleClick,
  onSignInClick,
  onLogoClick,
  onLocationChange,
  onFindEventsClick
}) {
  const [selectedLocation, setSelectedLocation] = useState('Metro Manila');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLocationChange = (e) => {
    const location = e.target.value;
    setSelectedLocation(location);
    if (onLocationChange) onLocationChange(location);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-[#FCFCFC] border-[#C0C0C1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop & Tablet Navigation */}
        <div className="hidden lg:flex items-center justify-between gap-6 py-3">
          <button onClick={onLogoClick} className="hover:opacity-80 transition-opacity shrink-0">
            <h1 className="text-xl xl:text-2xl tracking-tight text-[#020202]">
              Eventcinity
            </h1>
          </button>

          <div className="flex items-center gap-2 xl:gap-3 flex-1 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#696258]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-[#C0C0C1] rounded-lg bg-[#FCFCFC] text-[#020202] placeholder:text-[#696258] focus:outline-none focus:ring-2 focus:ring-[#2D3B15]/20 focus:border-[#2D3B15]"
              />
            </div>

            <div className="relative shrink-0">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#696258] pointer-events-none" />
              <select
                value={selectedLocation}
                onChange={handleLocationChange}
                className="pl-10 pr-8 py-2 text-sm border border-[#C0C0C1] rounded-lg bg-[#FCFCFC] text-[#020202] focus:outline-none focus:ring-2 focus:ring-[#2D3B15]/20 focus:border-[#2D3B15] appearance-none cursor-pointer"
              >
                {luzonProvinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onFindEventsClick}
              className="shrink-0 px-3 xl:px-4 py-2 text-sm bg-[#2D3B15] text-[#FCFCFC] rounded-lg hover:bg-[#2D3B15]/90 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden xl:inline">Find Events</span>
            </button>
          </div>

          <div className="flex items-center gap-1 xl:gap-2 shrink-0">
            <button
              onClick={onCreateClick}
              className="px-3 xl:px-4 py-2 text-sm text-[#020202] hover:bg-[#C0C0C1]/20 rounded-lg transition-colors whitespace-nowrap"
            >
              Create
            </button>
            <button
              onClick={onFindPeopleClick}
              className="px-3 xl:px-4 py-2 text-sm text-[#020202] hover:bg-[#C0C0C1]/20 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden xl:inline">Connect</span>
            </button>
            <button
              onClick={onSignInClick}
              className="px-3 xl:px-4 py-2 text-sm border border-[#2D3B15] text-[#2D3B15] rounded-lg hover:bg-[#2D3B15] hover:text-[#FCFCFC] transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden xl:inline">Sign In</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden py-3">
          <div className="flex items-center justify-between">
            <button onClick={onLogoClick} className="hover:opacity-80 transition-opacity">
              <h1 className="text-lg sm:text-xl tracking-tight text-[#020202]">
                Eventcinity
              </h1>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-[#C0C0C1]/20 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-[#020202]" />
              ) : (
                <Menu className="w-6 h-6 text-[#020202]" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mt-4 space-y-4 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#696258]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-[#C0C0C1] rounded-lg bg-[#FCFCFC] text-[#020202] placeholder:text-[#696258] focus:outline-none focus:ring-2 focus:ring-[#2D3B15]/20 focus:border-[#2D3B15]"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#696258] pointer-events-none" />
                <select
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  className="w-full pl-10 pr-8 py-2 text-sm border border-[#C0C0C1] rounded-lg bg-[#FCFCFC] text-[#020202] focus:outline-none focus:ring-2 focus:ring-[#2D3B15]/20 focus:border-[#2D3B15] appearance-none cursor-pointer"
                >
                  {luzonProvinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  if (onFindEventsClick) onFindEventsClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-sm bg-[#2D3B15] text-[#FCFCFC] rounded-lg hover:bg-[#2D3B15]/90 transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Find Events
              </button>

              <div className="flex flex-col gap-2 pt-2 border-t border-[#C0C0C1]">
                <button
                  onClick={() => {
                    if (onCreateClick) onCreateClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-[#020202] hover:bg-[#C0C0C1]/20 rounded-lg transition-colors text-left"
                >
                  Create Event
                </button>
                <button
                  onClick={() => {
                    if (onFindPeopleClick) onFindPeopleClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-[#020202] hover:bg-[#C0C0C1]/20 rounded-lg transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Connect with People
                </button>
                <button
                  onClick={() => {
                    if (onSignInClick) onSignInClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm border border-[#2D3B15] text-[#2D3B15] rounded-lg hover:bg-[#2D3B15] hover:text-[#FCFCFC] transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
