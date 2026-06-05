import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../public/firebase";
import { useAuth } from "../context/AuthContext";
import { createRecipe, getCommunityRecipe, updateRecipe } from "../services/api";
import { getRecipeById } from "../services/recipeService";
import AppLayout from "../components/AppLayout.jsx";

const defaultImage =
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop";

export default function CreateRecipe() {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editRecipeId = searchParams.get("edit");
  const isEditing = Boolean(editRecipeId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Dinner");
  const [ingredients, setIngredients] = useState(["", ""]);
  const [instructions, setInstructions] = useState([""]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function fillForm(recipe) {
    setTitle(recipe.title || "");
    setDescription(recipe.description || "");
    setCategory(recipe.category || "Dinner");
    setIngredients(
      Array.isArray(recipe.ingredients) && recipe.ingredients.length
        ? recipe.ingredients
        : [""]
    );
    setInstructions(
      Array.isArray(recipe.instructions) && recipe.instructions.length
        ? recipe.instructions
        : [""]
    );
    setImageUrl(recipe.imageUrl || "");
  }

  useEffect(() => {
    if (!editRecipeId) return;

    let ignore = false;
    async function loadRecipeForEdit() {
      setError("");

      if (location.state?.recipe) {
        fillForm(location.state.recipe);
      } else {
        const localRecipe = await getRecipeById(editRecipeId);
        if (localRecipe && !ignore) {
          fillForm(localRecipe);
        }
      }

      try {
        const recipe = await getCommunityRecipe(editRecipeId);
        if (ignore) return;
        fillForm(recipe);
      } catch (err) {
        if (!ignore && !location.state?.recipe) {
          const localRecipe = await getRecipeById(editRecipeId);
          if (localRecipe) {
            fillForm(localRecipe);
          } else {
            setError(err.message || "Failed to load recipe for editing.");
          }
        }
      }
    }

    loadRecipeForEdit();
    return () => {
      ignore = true;
    };
  }, [editRecipeId, location.state]);

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const updateIngredient = (index, value) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const updateInstruction = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");
    try {
      const storageRef = ref(storage, `recipe-images/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
    } catch (err) {
      console.error(err);
      setError("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!firebaseUser) {
      setError("You need to be logged in to submit a recipe.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        category,
        ingredients,
        instructions,
        imageUrl,
      };
      const data = isEditing
        ? await updateRecipe(editRecipeId, payload)
        : await createRecipe(payload);
      navigate(`/recipe/${data.recipeId}?source=community`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <main className="mint-page p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <h1 className="text-4xl font-serif text-slate-800">
            {isEditing ? "Edit Recipe" : "Create Recipe"}
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm space-y-5">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#E8F3EB] rounded-xl px-5 py-3 outline-none"
                required
              />

              <textarea
                placeholder="Short description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#E8F3EB] rounded-xl px-5 py-3 min-h-24 outline-none resize-y"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#E8F3EB] rounded-xl px-5 py-3 outline-none"
              >
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Dessert</option>
                <option>Snack</option>
              </select>

              <div className="space-y-3">
                {ingredients.map((ing, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Ingredient ${i + 1}`}
                    value={ing}
                    onChange={(e) => updateIngredient(i, e.target.value)}
                    className="w-full bg-[#E8F3EB] rounded-xl px-5 py-3 outline-none"
                  />
                ))}
                <button
                  type="button"
                  onClick={addIngredient}
                  className="bg-[#c8dece] hover:bg-[#b0ceb7] text-[#3d6b4f] px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Add Ingredient +
                </button>
              </div>

              <div className="space-y-3">
                <p className="font-medium text-slate-700">Instructions</p>
                {instructions.map((step, i) => (
                  <textarea
                    key={i}
                    placeholder="Instructions go here"
                    value={step}
                    onChange={(e) => updateInstruction(i, e.target.value)}
                    className="w-full bg-[#E8F3EB] rounded-xl px-5 py-4 min-h-40 outline-none resize-y"
                  />
                ))}
                <button
                  type="button"
                  onClick={addInstruction}
                  className="text-[#3d6b4f] hover:underline text-sm"
                >
                  Add Instruction +
                </button>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#5a8f6a] hover:bg-[#4a7a59] text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
              >
                {submitting
                  ? isEditing
                    ? "Saving..."
                    : "Submitting..."
                  : isEditing
                    ? "Save Changes"
                    : "Submit Recipe"}
              </button>
            </div>

            <div className="space-y-4">
              <img
                src={imageUrl || defaultImage}
                alt="Recipe preview"
                className="w-full rounded-2xl object-cover aspect-[4/3] shadow-sm"
              />
              <label className="block cursor-pointer bg-[#c8dece] hover:bg-[#b0ceb7] text-[#3d6b4f] px-4 py-2 rounded-lg text-sm font-medium transition text-center">
                {uploadingImage ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>
          </form>
        </div>
      </main>
    </AppLayout>
  );
}
