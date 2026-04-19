import { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';

export function CreateEvent({ onBack }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Music'
  });

  const categories = ['Music', 'Art & Culture', 'Business', 'Food & Drink', 'Sports', 'Tech'];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Event created:', formData);
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#020202]">Create Event</h1>
            <p className="text-sm sm:text-base lg:text-lg text-[#696258]">Share your event with the community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="block text-sm sm:text-base text-[#020202]">Event Image</label>
                <div className="border-2 border-dashed border-[#C0C0C1] rounded-lg p-8 sm:p-12 text-center hover:border-[#2D3B15] transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-[#696258] mx-auto mb-2 sm:mb-3" />
                  <p className="text-sm sm:text-base text-[#696258]">Click to upload or drag and drop</p>
                  <p className="text-xs sm:text-sm text-[#C0C0C1] mt-1">PNG, JPG up to 10MB</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm sm:text-base text-[#020202]">
                  Event Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Summer Music Festival 2026"
                  className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#C0C0C1] rounded-lg bg-[#FCFCFC] text-[#020202] placeholder:text-[#696258] focus:outline-none focus:ring-2 focus:ring-[#2D3B15]/20 focus:border-[#2D3B15]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm sm:text-base text-[#020202]">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell attendees what makes your event special..."
                  rows={6}
                  className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#C0C0C1] rounded-lg bg-[#FCFCFC] text-[#020202] placeholder:text-[#696258] focus:outline-none focus:ring-2 focus:ring-[#2D3B15]/20 focus:border-[#2D3B15] resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label htmlFor="date" className="block text-sm sm:text-base text-[#020202]">
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#C0C0C1] rounded-lg bg-[#FCFCFC] text-[#020202] focus:outline-none focus:ring-2 focus:ring-[#2D3B15]/20 focus:border-[#2D3B15]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="time" className="block text-sm sm:text-base text-[#020202]">
                    Time
                  </label>
                  <input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#C0C0C1] rounded-lg bg-[#FCFCFC] text-[#020202] focus:outline-none focus:ring-2 focus:ring-[#2D3B15]/20 focus:border-[#2D3B15]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm sm:text-base text-[#020202]">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Mall of Asia Arena, Metro Manila"
                  className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#C0C0C1] rounded-lg bg-[#FCFCFC] text-[#020202] placeholder:text-[#696258] focus:outline-none focus:ring-2 focus:ring-[#2D3B15]/20 focus:border-[#2D3B15]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm sm:text-base text-[#020202]">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border border-[#C0C0C1] rounded-lg bg-[#FCFCFC] text-[#020202] focus:outline-none focus:ring-2 focus:ring-[#2D3B15]/20 focus:border-[#2D3B15]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-[#C0C0C1]">
              <Button variant="primary" className="w-full sm:flex-1">Create Event</Button>
              <Button variant="secondary" onClick={onBack} className="w-full sm:flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
