import { useState } from "react";

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 w-full max-w-2xl mx-auto"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a recipe..."
        className="flex-1 border border-slate-200 bg-white rounded-xl px-5 py-3 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5a8f6a] transition"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-[#5a8f6a] hover:bg-[#4a7a59] text-white font-medium px-6 py-3 rounded-xl transition disabled:opacity-60"
      >
        {loading ? "..." : "Search"}
      </button>
    </form>
  );
}
