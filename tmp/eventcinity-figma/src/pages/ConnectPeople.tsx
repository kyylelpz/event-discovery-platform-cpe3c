import { ArrowLeft, UserPlus, Users } from 'lucide-react';
import { Footer } from '../components/Footer';

export function ConnectPeople({ onBack }) {
  return (
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col">
      {onBack && (
        <button
          onClick={onBack}
          className="fixed top-20 left-4 z-10 p-2 sm:p-3 bg-[#FCFCFC] border border-[#C0C0C1] rounded-full hover:bg-[#C0C0C1]/20 transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#020202]" />
        </button>
      )}

      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="flex justify-center">
            <div className="p-4 sm:p-6 bg-[#2D3B15]/10 rounded-full">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-[#2D3B15]" />
            </div>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#020202]">Connect with People</h1>
            <p className="text-sm sm:text-base lg:text-lg text-[#696258] max-w-2xl mx-auto px-4">
              Find and connect with event organizers, attendees, and like-minded people in your community.
            </p>
          </div>

          <div className="pt-4 sm:pt-8">
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#C0C0C1]/20 text-[#696258] rounded-lg">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Feature coming soon</span>
            </div>
          </div>

          <div className="pt-8 sm:pt-10 lg:pt-12 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
              <div className="p-4 sm:p-6 border border-[#C0C0C1] rounded-lg">
                <h3 className="text-base sm:text-lg text-[#020202] mb-2">Discover</h3>
                <p className="text-xs sm:text-sm text-[#696258]">Find people with similar interests and event preferences</p>
              </div>
              <div className="p-4 sm:p-6 border border-[#C0C0C1] rounded-lg">
                <h3 className="text-base sm:text-lg text-[#020202] mb-2">Network</h3>
                <p className="text-xs sm:text-sm text-[#696258]">Build connections with organizers and community leaders</p>
              </div>
              <div className="p-4 sm:p-6 border border-[#C0C0C1] rounded-lg">
                <h3 className="text-base sm:text-lg text-[#020202] mb-2">Collaborate</h3>
                <p className="text-xs sm:text-sm text-[#696258]">Partner with others to create amazing events together</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
