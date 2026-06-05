import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import {
  deleteCreatedRecipe,
  getMyCreatedRecipes,
  getMySavedRecipes,
  removeSavedRecipe,
} from "../services/recipeService.js";

export default function MyRecipes() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("created");
  const [createdRecipes, setCreatedRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);

  useEffect(() => {
    getMyCreatedRecipes().then(setCreatedRecipes);
    getMySavedRecipes().then(setSavedRecipes);
  }, []);

  async function handleDelete(recipeId) {
    await deleteCreatedRecipe(recipeId);
    setCreatedRecipes((recipes) => recipes.filter((recipe) => recipe.recipeId !== recipeId));
  }

  async function handleRemove(recipeId) {
    await removeSavedRecipe(recipeId);
    setSavedRecipes((recipes) => recipes.filter((recipe) => recipe.recipeId !== recipeId));
  }

  function handleEdit(recipe) {
    navigate(`/create-recipe?edit=${recipe.recipeId}`, {
      state: { recipe },
    });
  }

  const visibleRecipes = activeTab === "created" ? createdRecipes : savedRecipes;

  return (
    <AppLayout>
        <main className="mint-page my-recipes-page">
          <button type="button" className="return-link" onClick={() => navigate(-1)}>
            &larr; return
          </button>

          <div className="my-recipes-header">
            <div>
              <h1>My Recipe</h1>
              <div className="tab-control" role="tablist" aria-label="My recipe lists">
                <button
                  type="button"
                  className={activeTab === "created" ? "active" : ""}
                  onClick={() => setActiveTab("created")}
                >
                  My Creation
                </button>
                <button
                  type="button"
                  className={activeTab === "saved" ? "active" : ""}
                  onClick={() => setActiveTab("saved")}
                >
                  Saved
                </button>
              </div>
            </div>

            <Link to="/create-recipe" className="share-button">
              share another recipe <span aria-hidden="true">+</span>
            </Link>
          </div>

          <section className="recipe-grid manage-grid" aria-label={activeTab === "created" ? "Recipes I created" : "Recipes I saved"}>
            {visibleRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.recipeId}
                recipe={recipe}
                variant="manage"
                onEdit={activeTab === "created" ? () => handleEdit(recipe) : undefined}
                onDelete={activeTab === "created" ? handleDelete : undefined}
                onRemove={activeTab === "saved" ? handleRemove : undefined}
              />
            ))}
          </section>

          {visibleRecipes.length === 0 && (
            <p className="empty-state">
              {activeTab === "created" ? "You have not created any recipes yet." : "You have not saved any recipes yet."}
            </p>
          )}
        </main>
    </AppLayout>
  );
}
