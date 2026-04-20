function FilterTabs({ options, value, onChange }) {
  return (
    <div className="filter-tabs" role="tablist" aria-label="Event filters">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`filter-chip ${value === option ? 'filter-chip--active' : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export default FilterTabs