import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { useAuth } from "../context/AuthContext";
import { getRecipes } from "../services/recipeService.js";

export default function Home() {
  const { userDoc, firebaseUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRecipes() {
      try {
        setLoading(true);
        setError("");
        const nextRecipes = await getRecipes({ search });
        if (isMounted) setRecipes(nextRecipes);
      } catch (err) {
        if (isMounted) setError("Could not load recipes right now.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRecipes();
    return () => {
      isMounted = false;
    };
  }, [search]);

  const featuredRecipes = useMemo(() => recipes.slice(0, 6), [recipes]);
  const displayName = userDoc?.username || firebaseUser?.email?.split("@")[0] || "there";
  const isSearching = search.trim().length > 0;

  return (
    <AppLayout>
      <main className="mint-page home-page">
        <section className="home-header">
          <div>
            <p className="home-kicker">Welcome,</p>
            <h1>{displayName}</h1>
          </div>

          <div className="home-share">
            <span>Have a recipe to share?</span>
            <Link to="/create-recipe" className="share-button">
              submit yours +
            </Link>
          </div>
        </section>

        <section className="home-search">
          <h2>What are you cooking today?</h2>
          <SearchBar value={search} onChange={setSearch} />
        </section>

        <section className="home-recipes">
          <div className="section-heading">
            <h2>{isSearching ? "Search Results" : "Recommended for you"}</h2>
            {isSearching && (
              <button type="button" className="text-button" onClick={() => setSearch("")}>
                Back to recommended
              </button>
            )}
          </div>

          {loading ? (
            <div className="recipe-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="recipe-skeleton" />
              ))}
            </div>
          ) : error ? (
            <p className="empty-state">{error}</p>
          ) : featuredRecipes.length === 0 ? (
            <p className="empty-state">No recipes found.</p>
          ) : (
            <div className="recipe-grid">
              {featuredRecipes.map((recipe) => (
                <RecipeCard key={`${recipe.source}-${recipe.recipeId}`} recipe={recipe} />
              ))}
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
}
