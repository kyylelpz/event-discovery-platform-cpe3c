import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#696258]" />
      <input
        type="text"
        placeholder="Search events..."
        className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-[#C0C0C1] rounded-lg bg-[#FCFCFC] text-[#020202] placeholder:text-[#696258] focus:outline-none focus:ring-2 focus:ring-[#2D3B15]/20 focus:border-[#2D3B15]"
      />
    </div>
  );
}
