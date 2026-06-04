import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createRecipe } from "../services/api";

const defaultImage =
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop";

export default function CreateRecipe() {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState(["", ""]);
  const [instructions, setInstructions] = useState([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!firebaseUser) {
      setError("You need to be logged in to submit a recipe.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await createRecipe({
        title,
        ingredients,
        instructions,
        imageUrl: defaultImage,
      });
      navigate(`/recipe/${data.recipeId}?source=community`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F3EB] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-serif text-slate-800">Create Recipe</h1>

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
                {submitting ? "Submitting..." : "Submit Recipe"}
              </button>
            </div>

            <div>
              <img
                src={defaultImage}
                alt="Recipe preview"
                className="w-full rounded-2xl object-cover aspect-[4/3] shadow-sm"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
