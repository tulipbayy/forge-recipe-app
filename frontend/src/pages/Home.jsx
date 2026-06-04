import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import RecipeCard from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const { userDoc, firebaseUser } = useAuth();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  // Fetch featured recipes on mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/recipes");
        const data = await res.json();
        if (res.ok) {
          setRecipes(data);
        } else {
          setError("Failed to load recipes.");
        }
      } catch (err) {
        setError("Could not connect to server.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const handleSearch = async (query) => {
    setSearchLoading(true);
    setIsSearching(true);
    try {
      const res = await fetch(
        `http://localhost:5001/api/recipes/search?q=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      if (res.ok) {
        setRecipes(data);
      } else {
        setError("Search failed.");
      }
    } catch (err) {
      setError("Could not connect to server.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setIsSearching(false);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/recipes");
      const data = await res.json();
      if (res.ok) setRecipes(data);
    } catch (err) {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // Get display name
  const displayName =
    userDoc?.username || firebaseUser?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-[#E8F3EB] p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm">Welcome,</p>
            <h1 className="text-4xl font-serif text-slate-800 capitalize">
              {displayName}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            Have a recipe to share?
            <a
              href="/create-recipe"
              className="bg-[#c8dece] hover:bg-[#b0ceb7] text-[#3d6b4f] font-medium px-4 py-2 rounded-lg transition"
            >
              submit yours! +
            </a>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center space-y-4">
          <h2 className="text-2xl font-serif text-slate-700">
            What are you cooking today?
          </h2>
          <SearchBar onSearch={handleSearch} loading={searchLoading} />
        </div>

        {/* Recipe Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif text-slate-700">
              {isSearching ? "Search Results" : "Recommended for you"}
            </h2>
            {isSearching && (
              <button
                onClick={handleClearSearch}
                className="text-sm text-slate-500 hover:text-slate-800 transition underline"
              >
                ← Back to recommended
              </button>
            )}
          </div>

          {loading || searchLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
                >
                  <div className="aspect-video bg-slate-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : recipes.length === 0 ? (
            <p className="text-slate-500 text-center">No recipes found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={`${recipe.source}-${recipe.recipeId}`}
                  recipe={recipe}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
