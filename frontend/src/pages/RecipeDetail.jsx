import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../public/firebase";
import AppLayout from "../components/AppLayout.jsx";
import CommentSection from "../components/CommentSection.jsx";
import { API_BASE_URL } from "../services/api.js";
import { getRecipes } from "../services/recipeService.js";

const fallbackRecipe = {
  title: "Spicy Garlic Butter Pasta",
  imageUrl:
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=800&auto=format&fit=crop",
  category: "Dinner",
  description:
    "A quick, 15-minute pasta dish coated in a rich, spicy garlic butter sauce. Perfect for a weeknight dinner.",
  ingredients: [
    "8 oz linguine or spaghetti",
    "4 tbsp unsalted butter",
    "4 cloves garlic, minced",
    "1 tsp red pepper flakes",
    "1/4 cup grated Parmesan cheese",
    "1 tbsp fresh parsley, chopped",
  ],
  instructions: [
    "Boil a large pot of salted water and cook the pasta until al dente.",
    "Melt butter in a skillet over medium-low heat.",
    "Add garlic and red pepper flakes, then cook until fragrant.",
    "Toss pasta with the garlic butter and a splash of pasta water.",
    "Finish with parmesan and parsley, then serve immediately.",
  ],
};

export default function RecipeDetail() {
  const { id, recipeId } = useParams();
  const [searchParams] = useSearchParams();
  const resolvedRecipeId = recipeId || id;
  const source = searchParams.get("source") || "community";

  const [recipe, setRecipe] = useState(fallbackRecipe);
  const [loading, setLoading] = useState(Boolean(resolvedRecipeId));
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(true);

  useEffect(() => {
    if (!resolvedRecipeId) {
      setLoading(false);
      return;
    }

    async function fetchRecipe() {
      try {
        if (source === "community") {
          const response = await fetch(`${API_BASE_URL}/recipes/${resolvedRecipeId}?source=${source}`);
          const data = await response.json();
          if (response.ok) {
            setRecipe(data);
          }
        } else if (source === "official") {
          // use local data for official recipes
          const list = await getRecipes({ source: "official" });
          const found = list.find((r) => r.recipeId === resolvedRecipeId);
          if (found) setRecipe(found);
        } else {
          // default: try backend
          const response = await fetch(`${API_BASE_URL}/recipes/${resolvedRecipeId}?source=${source}`);
          const data = await response.json();
          if (response.ok) setRecipe(data);
        }
      } catch (error) {
        console.error("Failed to load recipe", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipe();
  }, [resolvedRecipeId, source]);

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `images/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      setUploadedImageUrl(await getDownloadURL(storageRef));
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <main className="mint-page simple-page">
          <p>Loading Recipe...</p>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="mint-page detail-page">
        <Link to="/recipes" className="return-link">
          &larr; return
        </Link>

        <section className="detail-layout">
          <article className="detail-main">
            <h1>{recipe.title}</h1>
            <div className="detail-actions">
              <button type="button">Save Recipe</button>
              <span>Rating: {recipe.averageRating || recipe.rating || "4.5"}/5</span>
              <a href="#comments-section">Comments</a>
            </div>

            <img className="detail-image" src={recipe.imageUrl} alt={recipe.title} />

            <label className="upload-button">
              Upload Photo
              <input type="file" accept="image/*" onChange={handleUpload} />
            </label>

            {uploadedImageUrl && (
              <div className="uploaded-photo">
                <p>Your Uploaded Photo:</p>
                <img src={uploadedImageUrl} alt="Uploaded recipe" />
              </div>
            )}

            <section className="detail-panel">
              <h2>Tags</h2>
              <p>{recipe.category}</p>

              <h2>Description</h2>
              <p>{recipe.description}</p>

              <h2>Instructions</h2>
              <ol>
                {recipe.instructions?.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </section>

            <section id="comments-section">
              <CommentSection recipeId={resolvedRecipeId || "demo-recipe"} />
            </section>
          </article>

          <aside className="ingredients-panel">
            <div className="ingredients-heading">
              <h2>Ingredients</h2>
              <button type="button" onClick={() => setIsIngredientsOpen((isOpen) => !isOpen)}>
                {isIngredientsOpen ? "-" : "+"}
              </button>
            </div>

            {isIngredientsOpen && (
              <ul>
                {recipe.ingredients?.map((ingredient, index) => (
                  <li key={index}>
                    <span aria-hidden="true" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            )}

            <div className="chatbot-placeholder">Chatbot Component Goes Here</div>
          </aside>
        </section>
      </main>
    </AppLayout>
  );
}
