export function FilterTabs({ categories, activeCategory, onCategoryChange }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full whitespace-nowrap transition-all ${
            activeCategory === category
              ? 'bg-[#2D3B15] text-[#FCFCFC]'
              : 'bg-[#FCFCFC] text-[#696258] border border-[#C0C0C1] hover:border-[#2D3B15]'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
