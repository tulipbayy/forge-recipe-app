import { useState } from "react";
import Layout from "../components/Layout";

const defaultImage =
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop";

export default function CreateRecipe() {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState(["", ""]);
  const [instructions, setInstructions] = useState([""]);

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

  return (
    <Layout>
      <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-5">
          <button
            type="button"
            className="bg-[#E8F3EB] px-4 py-2 rounded-lg text-sm hover:bg-[#d8ebe0]"
          >
            Import Recipe +
          </button>

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#E8F3EB] rounded-xl px-5 py-3 outline-none"
          />

          <div className="pl-8 space-y-3">
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
              className="bg-[#E8F3EB] px-4 py-2 rounded-lg text-sm hover:bg-[#d8ebe0]"
            >
              Add Ingredient +
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-[#E8F3EB] rounded-xl px-5 py-3">Instructions</div>
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
              className="text-slate-700 hover:underline"
            >
              Add Instruction +
            </button>
          </div>
        </div>

        <div>
          <img
            src={defaultImage}
            alt="Recipe preview"
            className="w-full rounded-2xl object-cover aspect-[4/3] shadow-md"
          />
        </div>
      </div>
    </Layout>
  );
}
