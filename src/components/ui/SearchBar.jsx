function SearchBar({
  value,
  onChange,
  placeholder,
  ariaLabel = 'Search',
  icon,
  results = [],
  onSelectResult,
  onFocus,
  onBlur,
  showResults = false,
}) {
  return (
    <label className="searchbar">
      <span className="sr-only">{ariaLabel}</span>
      {icon && <span className="searchbar__icon">{icon}</span>}
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        autoComplete="off"
      />
      {showResults && results.length > 0 ? (
        <div className="searchbar__dropdown" role="listbox" aria-label="Search results">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              className="searchbar__result"
              onMouseDown={(event) => {
                event.preventDefault()
                onSelectResult?.(result)
              }}
            >
              <strong>{result.title}</strong>
              <span>{result.location}</span>
            </button>
          ))}
        </div>
      ) : null}
    </label>
  )
}

export default SearchBar
