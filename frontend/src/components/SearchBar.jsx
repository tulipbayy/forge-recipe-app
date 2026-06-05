export default function SearchBar({ value, onChange }) {
  return (
    <label className="search-bar">
      <span className="sr-only">Search recipes</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search for a recipe"
      />
    </label>
  );
}
