import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../public/firebase";
import AppLayout from "../components/AppLayout.jsx";
import CommentSection from "../components/CommentSection";
import Chatbot from "../components/Chatbot";
import { useAuth } from "../context/AuthContext";
import { getRecipeById } from "../services/recipeService";

const fallbackRecipe = {
  title: "Spicy Garlic Butter Pasta",
  imageUrl:
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=900&auto=format&fit=crop",
  category: "Dinner",
  description:
    "A quick pasta dish coated in a rich garlic butter sauce. Perfect for a weeknight dinner.",
  ingredients: [
    "8 oz linguine or spaghetti",
    "4 tbsp unsalted butter",
    "4 cloves garlic, minced",
    "1 tsp red pepper flakes",
    "1/4 cup grated Parmesan cheese",
    "1 tbsp fresh parsley, chopped",
  ],
  instructions: [
    "Boil a large pot of salted water and cook pasta until al dente.",
    "Melt butter in a skillet over medium-low heat.",
    "Add garlic and red pepper flakes, then cook until fragrant.",
    "Toss pasta with the garlic butter and a splash of pasta water.",
    "Finish with parmesan and parsley, then serve immediately.",
  ],
  averageRating: 4.5,
};
export default function RecipeDetail() {
  const { id, recipeId } = useParams();
  const [searchParams] = useSearchParams();
  const resolvedRecipeId = id || recipeId;
  const source = searchParams.get("source") || "community";
  const { firebaseUser } = useAuth();
  const [recipe, setRecipe] = useState(fallbackRecipe);
  const [loading, setLoading] = useState(Boolean(resolvedRecipeId));
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  useEffect(() => {
    if (!resolvedRecipeId) {
      setLoading(false);
      return;
    }
    async function fetchRecipe() {
      try {
        const localRecipe = await getRecipeById(resolvedRecipeId);
        if (localRecipe) {
          setRecipe({
            ...fallbackRecipe,
            ...localRecipe,
            ingredients: localRecipe.ingredients || fallbackRecipe.ingredients,
            instructions: localRecipe.instructions || fallbackRecipe.instructions,
            averageRating: localRecipe.averageRating ?? localRecipe.rating ?? fallbackRecipe.averageRating,
          });
          setLoading(false);
          return;
        }
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL || `${import.meta.env.VITE_BASE_URL || 'http://localhost:5001'}`}/api/recipes/${resolvedRecipeId}?source=${source}`
        );
        const data = await response.json();
        if (response.ok) {
          setRecipe({ ...fallbackRecipe, ...data });
        }
      } catch (error) {
        console.error("Failed to load recipe detail:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipe();
  }, [resolvedRecipeId, source]);

   useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
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
  async function handleRate(starNumber) {
    setUserRating(starNumber);
    if (!resolvedRecipeId) return;
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL || `${import.meta.env.VITE_BASE_URL || 'http://localhost:5001'}`}/api/recipes/${resolvedRecipeId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: starNumber }),
      });
    } catch (error) {
      console.error("Failed to save rating:", error);
    }
  }
  async function handleSaveRecipe() {
    if (!firebaseUser) {
      alert("Please log in to save recipes.");
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL || `${import.meta.env.VITE_BASE_URL || 'http://localhost:5001'}`}/api/savedRecipes/${firebaseUser.uid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId: resolvedRecipeId }),
        }
      );
      alert(response.ok ? "Recipe saved successfully." : "Failed to save recipe.");
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Error saving recipe.");
    }
  }
  if (loading) {
    return (
      <AppLayout>
        <main className="min-h-screen bg-[#E8F3EB] p-8 text-center font-serif text-2xl">
          Loading Recipe...
        </main>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <main className="min-h-screen bg-[#E8F3EB] p-6 text-slate-800 md:p-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-3">
          <section className="space-y-6 md:col-span-2">
            <Link to="/recipes" className="inline-block rounded bg-[#f4dfdc] px-3 py-1 font-serif">
              &larr; return
            </Link>
          <h1 className="text-center font-serif text-4xl text-slate-800 md:text-5xl">
            {recipe.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-slate-700">
            <button type="button" onClick={handleSaveRecipe}>
              + Save Recipe
            </button>
            <span>Rating: {recipe.averageRating || recipe.rating || "New"}/5</span>
            <a href="#comments-section">{commentCount} Comment(s)</a>
          </div>
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="aspect-video w-full rounded-xl object-cover shadow-lg"
          />
          <div className="text-center">
            <label className="inline-block cursor-pointer rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700">
              Upload Photo
              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
            </label>
          </div>
          {uploadedImageUrl && (
            <div className="text-center">
              <p className="font-semibold">Your Uploaded Photo:</p>
              <img
                src={uploadedImageUrl}
                alt="Uploaded recipe"
                className="mx-auto mt-2 w-48 rounded-lg shadow-md"
              />
            </div>
          )}
          <section className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="font-serif text-3xl text-slate-800">Tags</h2>
            <p className="mt-2">{recipe.category}</p>
            <h2 className="mt-8 font-serif text-3xl text-slate-800">Description</h2>
            <p className="mt-2">{recipe.description}</p>
            <h2 className="mt-8 font-serif text-3xl text-slate-800">Instructions</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-6 text-lg text-slate-700">
              {recipe.instructions?.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 font-serif text-xl text-slate-800">Rate this recipe:</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((starNumber) => (
                <button
                  key={starNumber}
                  type="button"
                  onClick={() => handleRate(starNumber)}
                  className="text-4xl transition hover:scale-110"
                >
                  <span className={userRating >= starNumber ? "text-yellow-400" : "text-gray-300"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
          </section>
          <section id="comments-section">
            <CommentSection
              recipeId={resolvedRecipeId || "demo-recipe"}
              onCommentsLoaded={setCommentCount}
            />
          </section>
        </section>
        <aside className="md:col-span-1">
          <div className="sticky top-8 space-y-8 max-h-[calc(100vh-4rem)] overflow-y-auto pb-4 pr-8">
            <section className="rounded-md bg-[#D9D9D9] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-2xl">Ingredients</h2>
                <button
                  type="button"
                  onClick={() => setIsIngredientsOpen((open) => !open)}
                  className="rounded border-2 border-slate-700 px-2 text-2xl font-bold"
                >
                  {isIngredientsOpen ? "-" : "+"}
                </button>
              </div>
              {isIngredientsOpen && (
                <>
                  {/* Serves and Time Info */}
                  <div className="flex gap-6 mb-4 text-slate-700 font-medium border-b border-slate-400 pb-3">
                      <span className="flex items-center gap-1">
                          <span className="text-lg"></span> 
                          Serves: {recipe.servings || recipe.yield || "___"}
                      </span>
                      <span className="flex items-center gap-1">
                          <span className="text-lg"></span> 
                          Time: {recipe.time || recipe.totalTime ? `${recipe.time || recipe.totalTime} mins` : "____"}
                      </span>
                  </div>
                  <ul className="space-y-3">
                    {recipe.ingredients?.map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            {/* Hidden checkbox */}
                            <input type="checkbox" className="peer hidden" />
                            
                            {/* The visible custom box */}
                            <div className="shrink-0 w-6 h-6 border-2 border-slate-400 rounded flex items-center justify-center peer-checked:bg-slate-800 peer-checked:border-slate-800 transition-colors">
                                <span className="text-white opacity-0 peer-checked:opacity-100 font-bold">✓</span>
                            </div>
                            
                            {/* The text (adds a strikethrough) */}
                            <span className="text-slate-800 peer-checked:line-through peer-checked:text-slate-400 transition-all">
                                {ingredient}
                            </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
            <Chatbot recipe={recipe} />
          </div>
          </aside>
        </div>
      </main>
    </AppLayout>
  );
}