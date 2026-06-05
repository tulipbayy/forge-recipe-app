import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { getRecipes, saveRecipe } from "../services/recipeService.js";

const filterOptions = {
  source: ["All", "Official", "Community"],
  category: ["All", "Breakfast", "Lunch", "Dinner"],
  difficulty: ["All", "Easy", "Medium", "Hard"],
  rating: ["All", "4", "4.5"],
};

export default function Recipes() {
  const [source, setSource] = useState("All");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [rating, setRating] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [recipes, setRecipes] = useState([]);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    getRecipes({ source, search, category, difficulty, minRating: rating }).then(setRecipes);
  }, [source, search, category, difficulty, rating]);

  const sortedRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => {
      const ratingA = a.averageRating ?? a.rating ?? 0;
      const ratingB = b.averageRating ?? b.rating ?? 0;
      const ratingCountA = a.ratingCount ?? 0;
      const ratingCountB = b.ratingCount ?? 0;

      if (sortBy === "rating") return ratingB - ratingA;
      if (sortBy === "newest") return b.recipeId.localeCompare(a.recipeId);
      return ratingCountB - ratingCountA;
    });
  }, [recipes, sortBy]);

  async function handleSave(recipeId) {
    await saveRecipe(recipeId);
    setSavedIds((currentIds) => (currentIds.includes(recipeId) ? currentIds : [...currentIds, recipeId]));
  }

  return (
    <AppLayout>
      <main className="mint-page recipe-page">
        <section className="catalog-hero">
          <h1>Recipe Explorer</h1>

          <SearchBar value={search} onChange={setSearch} />

          <div className="filter-row" aria-label="Recipe filters">
            <label>
              Made by
              <select value={source} onChange={(event) => setSource(event.target.value)}>
                {filterOptions.source.map((option) => (
                  <option key={option} value={option === "All" ? "All" : option.toLowerCase()}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Category
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {filterOptions.category.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Difficulty
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                {filterOptions.difficulty.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Rating
              <select value={rating} onChange={(event) => setRating(event.target.value)}>
                {filterOptions.rating.map((option) => (
                  <option key={option} value={option}>
                    {option === "All" ? "All" : `${option}+`}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="sort-control">
            Sort by:
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </section>

        {savedIds.length > 0 && <p className="save-confirmation">Saved {savedIds.length} recipe.</p>}

        <section className="recipe-grid" aria-label={`${source} recipes`}>
          {sortedRecipes.map((recipe) => (
            <RecipeCard key={recipe.recipeId} recipe={recipe} onSave={handleSave} />
          ))}
        </section>

        {sortedRecipes.length === 0 && <p className="empty-state">No recipes match those filters yet.</p>}
      </main>
    </AppLayout>
  );
}
