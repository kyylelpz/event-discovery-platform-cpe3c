import { Music, Palette, Briefcase, UtensilsCrossed, Trophy, Laptop } from 'lucide-react';

const categoryIcons = {
  Music: Music,
  'Art & Culture': Palette,
  Business: Briefcase,
  'Food & Drink': UtensilsCrossed,
  Sports: Trophy,
  Tech: Laptop
};

export function CategoryHighlight({ onCategoryClick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {Object.entries(categoryIcons).map(([category, Icon]) => (
        <button
          key={category}
          onClick={() => onCategoryClick(category)}
          className="group p-4 sm:p-6 border border-[#C0C0C1] rounded-lg bg-[#FCFCFC] hover:bg-[#2D3B15] hover:border-[#2D3B15] transition-all duration-300"
        >
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#2D3B15] group-hover:text-[#FCFCFC] transition-colors" />
            <span className="text-xs sm:text-sm text-center text-[#020202] group-hover:text-[#FCFCFC] transition-colors">
              {category}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
