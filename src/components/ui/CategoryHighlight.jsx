import { useEffect, useRef } from 'react'
import {
  BriefcaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LaptopIcon,
  LayoutGridIcon,
  MusicIcon,
  PaletteIcon,
  UsersRoundIcon,
  UtensilsIcon,
} from './Icons.jsx'

const categoryIcons = {
  'All Events': LayoutGridIcon,
  Music: MusicIcon,
  'Art & Culture': PaletteIcon,
  Business: BriefcaseIcon,
  'Food & Drink': UtensilsIcon,
  Community: UsersRoundIcon,
  Tech: LaptopIcon,
}

export const highlightedCategories = Object.keys(categoryIcons)

function CategoryHighlight({ value, onCategoryClick }) {
  const itemRefs = useRef([])
  const activeIndex = Math.max(0, highlightedCategories.indexOf(value))

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [activeIndex])

  const handleStep = (direction) => {
    const nextIndex =
      (activeIndex + direction + highlightedCategories.length) % highlightedCategories.length
    onCategoryClick(highlightedCategories[nextIndex])
  }

  return (
    <div className="category-highlight">
      <button
        type="button"
        className="category-highlight__nav"
        aria-label="Previous category"
        onClick={() => handleStep(-1)}
      >
        <ChevronLeftIcon />
      </button>

      <div className="category-highlight__viewport">
        <div className="category-highlight__track">
          {Object.entries(categoryIcons).map(([category, CategoryIcon], index) => (
            <button
              key={category}
              ref={(element) => {
                itemRefs.current[index] = element
              }}
              type="button"
              className={`category-highlight__item ${
                value === category ? 'category-highlight__item--active' : ''
              }`}
              onClick={() => onCategoryClick(category)}
            >
              {CategoryIcon({ className: 'category-highlight__icon' })}
              <span>{category}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="category-highlight__nav"
        aria-label="Next category"
        onClick={() => handleStep(1)}
      >
        <ChevronRightIcon />
      </button>
    </div>
  )
}

export default CategoryHighlight
