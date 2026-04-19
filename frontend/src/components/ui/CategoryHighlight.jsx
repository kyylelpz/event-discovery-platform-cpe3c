import {
  BriefcaseIcon,
  LaptopIcon,
  MusicIcon,
  PaletteIcon,
  UsersRoundIcon,
  UtensilsIcon,
} from './Icons.jsx'

const categoryIcons = {
  Music: MusicIcon,
  'Art & Culture': PaletteIcon,
  Business: BriefcaseIcon,
  'Food & Drink': UtensilsIcon,
  Community: UsersRoundIcon,
  Tech: LaptopIcon,
}

function CategoryHighlight({ onCategoryClick }) {
  return (
    <div className="category-highlight">
      {Object.entries(categoryIcons).map(([category, CategoryIcon]) => (
        <button
          key={category}
          type="button"
          className="category-highlight__item"
          onClick={() => onCategoryClick(category)}
        >
          {CategoryIcon({ className: 'category-highlight__icon' })}
          <span>{category}</span>
        </button>
      ))}
    </div>
  )
}

export default CategoryHighlight