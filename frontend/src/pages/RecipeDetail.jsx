import React from 'react';
import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../public/firebase";
import { useParams, useSearchParams } from 'react-router-dom';
import CommentSection from "../components/CommentSection";

const dummyRecipe = {
  title: "Spicy Garlic Butter Pasta",
  imageUrl:
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=800&auto=format&fit=crop",
  category: "Dinner",
  description:
    "A quick, 15-minute pasta dish coated in a rich, spicy garlic butter sauce. Perfect for a weeknight dinner!",
  ingredients: [
    "8 oz linguine or spaghetti",
    "4 tbsp unsalted butter",
    "4 cloves garlic, minced",
    "1 tsp red pepper flakes (adjust to taste)",
    "1/4 cup grated Parmesan cheese",
    "1 tbsp fresh parsley, chopped",
  ],
  instructions: [
    "Boil a large pot of salted water. Cook the pasta according to package directions until al dente. Reserve 1/2 cup of pasta water before draining.",
    "While pasta cooks, melt the butter in a large skillet over medium-low heat.",
    "Add the minced garlic and red pepper flakes. Sauté for 1-2 minutes until fragrant, being careful not to burn the garlic.",
    "Toss the drained pasta into the skillet. Add a splash of the reserved pasta water and stir vigorously until a silky sauce forms.",
    "Remove from heat, stir in the Parmesan cheese and garnish with fresh parsley. Serve immediately.",
  ],
};

export default function RecipeDetail() {
    // get the parameters
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const source = searchParams.get("source"); 

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadedImageUrl, setUploadedImageUrl] = useState("");
    const [isIngredientsOpen, setIsIngredientsOpen] = useState(true);

    // get data from backend
    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/recipes/${id}?source=${source}`);
                const data = await response.json();
                
                if (response.ok) {
                    setRecipe(data);
                } else {
                    console.error("Backend error:", data.error);
                }
            } catch (error) {
                console.error("Failed to connect to backend", error);
            } finally {
                setLoading(false);
            }
        };

        if (id && source) {
            fetchRecipe();
        }
    }, [id, source]);

    // Loading message while waiting
    if (loading) {
        return <div className="min-h-screen p-8 text-center text-2xl font-serif">Loading Recipe...</div>;
    }

    // Error if it doesn't exist
    if (!recipe) {
        return <div className="min-h-screen p-8 text-center text-2xl font-serif text-red-500">Recipe not found!</div>;
    }

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    try {
      console.log("Uploading photo...");

      const storageRef = ref(storage, `images/${file.name}`);
      await uploadBytes(storageRef, file);

      const url = await getDownloadURL(storageRef);
      console.log("Success! Image URL:", url);

      setUploadedImageUrl(url);
    } catch (error) {
      console.error("Upload failed: ", error);
    }

    return ( 
        <div className="min-h-screen bg-[#E8F3EB] p-8 font-sans text-gray-800">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                {/*Left column */}
                <div className="md:col-span-2 space-y-6"
                    key={recipe.title}>

                    {/* Title, Ratings, Comments, etc. */}
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-serif text-slate-800 mb-2">{recipe.title}</h1>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-6 mt-4 text-slate-700 font-medium">
                        {/* Save Recipe Button */}
                        <button className="flex items-center gap-2 hover:text-slate-900 transition">
                            <span className="text-xl">⊕</span> Save Recipe
                        </button>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2">
                            <span className="text-xl">★</span> Rating: 4.5/5
                        </div>
                        
                        {/* Jump to Comments (Uses an anchor tag to scroll down) */}
                        <a href="#comments-section" className="flex items-center gap-2 hover:text-slate-900 transition">
                            <span className="text-xl">💬</span> 27 Comments
                        </a>
                    </div>

                    {/* Main image */}
                    <div>
                        <img 
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-full aspect-video object-cover rounded-xl shadow-lg"
                        />
                    </div>

                    {/* User Photo Section */}
                    <div className="mt-4 text-center">
                        <label className="cursor-pointer bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-700 transition">
                            Upload Photo
                            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                        </label>
                    </div>

                    {uploadedImageUrl && (
                        <div className="mt-4 text-center">
                            <p><strong>Your Uploaded Photo(s): </strong></p>
                            <img src={uploadedImageUrl} className="w-48 h-auto rounded-lg shadow-md" />
                        </div>
                    )}

                    {/* Tags, Description, Instructions */}
                    <div className="bg-white rounded-lg p-6 shadow-md">
                        <h2 className="text-3xl font-serif text-slate-800 mb-4 mt-8">Tags: </h2>
                        <p>{recipe.category}</p>

                        <h2 className="text-3xl font-serif text-slate-800 mb-4 mt-8">Description: </h2>
                        <p>{recipe.description}</p>

                        <h2 className="text-3xl font-serif text-slate-800 mb-4 mt-8">Instructions: </h2>
                        <ol className="list-decimal list-outside ml-6 space-y-4 text-lg text-slate-700">
                            {recipe.instructions?.map((step, index) => (
                                <li key={index} className="pl-2">
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Comment Section */}
                    <div className="mt-12 p-4 border-2 border-dashed border-gray-400 text-center" id="comments-section">
                            [CommentSection Component Goes Here]
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="md:col-span-1">

                    <div className="sticky top-8 space-y-8">
                        {/* Ingredients Box */}
                        <div className="bg-[#D9D9D9] p-6 rounded-md shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-serif">Ingredients</h2>
                                
                                {/* Toggle Button */}
                                <button 
                                    onClick={() => setIsIngredientsOpen(!isIngredientsOpen)}
                                    className="text-2xl font-bold border-2 border-slate-700 px-2 rounded hover:bg-slate-300 transition"
                                >
                                    {isIngredientsOpen ? "-" : "+"}
                                </button>

                            </div>

                            {isIngredientsOpen && (
                                <ul className="space-y-3">
                                    {recipe.ingredients?.map((ingredient, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-slate-700 rounded-sm shrink-0"></div>
                                            <span className="text-slate-800">{ingredient}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* CHATBOT */}
                        <div className="mt-8 p-4 border-2 border-dashed border-gray-400 text-center">
                            [Chatbot Component Goes Here]
                        </div>
                    </div>
                </div>
            </div>

            {uploadedImageUrl && (
              <div className="mt-4 text-center">
                <p>
                  <strong>Your Uploaded Photo(s): </strong>
                </p>
                <img
                  src={uploadedImageUrl}
                  className="w-48 h-auto rounded-lg shadow-md"
                />
              </div>
            )}

            <h2 className="text-3xl font-serif text-slate-800 mb-4 mt-8">
              Tags:{" "}
            </h2>
            <p>{dummyRecipe.category}</p>

            <h2 className="text-3xl font-serif text-slate-800 mb-4 mt-8">
              Description:{" "}
            </h2>
            <p>{dummyRecipe.description}</p>

            <h2 className="text-3xl font-serif text-slate-800 mb-4 mt-8">
              Instructions:{" "}
            </h2>
            <ol className="list-decimal list-outside ml-6 space-y-4 text-lg text-slate-700">
              {dummyRecipe.instructions.map((step, index) => (
                <li key={index} className="pl-2">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Comment Section */}
          <CommentSection recipeId="2oNIt5FdWkXwnRWcyj9i" />
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-1">
          {/* Ingredients Box */}
          <div className="bg-[#D9D9D9] p-6 rounded-md shadow-sm sticky top-8">
            {/* Ingredients checklist here */}
            <h2 className="text-2xl font-serif text-center mb-6">
              Ingredients
            </h2>
            <ul className="space-y-3">
              {dummyRecipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-slate-700 rounded-sm"></div>
                  <span className="text-slate-800">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CHATBOT */}
          <div className="mt-8 p-4 border-2 border-dashed border-gray-400 text-center">
            [Chatbot Component Goes Here]
          </div>
        </div>
      </div>
    </div>
  );
}
