function SearchBar({ value, onChange, placeholder, icon }) {
  return (
    <label className="searchbar">
      <span className="sr-only">Search events</span>
      {icon && <span className="searchbar__icon">{icon}</span>}
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}

export default SearchBar
