import React from 'react';
import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../public/firebase";
import { useParams, useSearchParams } from 'react-router-dom';
import CommentSection from "../components/CommentSection";
// import Chatbot from "../components/Chatbot";

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
    const [userRating, setUserRating] = useState(0);
    const [commentCount, setCommentCount] = useState(0);

    // get data from backend
    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/recipes/${id}?source=${source}`);
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
  }

  const handleRate = async (starNumber) => {
    setUserRating(starNumber);
    
    try {
        await fetch(`http://localhost:5001/api/recipes/${id}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating: starNumber })
        });
        console.log("Rating saved to database!");

        const freshResponse = await fetch(`http://localhost:5001/api/recipes/${id}?source=${source}`);
        const freshData = await freshResponse.json();
        setRecipe(freshData);
    } catch (error) {
        console.error("Failed to save rating", error);
    }
  };

    return ( 
      <div className="min-h-screen bg-[#E8F3EB] p-8 font-sans text-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* LEFT COLUMN */}
          <div className="md:col-span-2 space-y-6" key={recipe.title}>
            
            {/* Title */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-serif text-slate-800 mb-2">
                {recipe.title}
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center items-center gap-6 mt-4 text-slate-700 font-medium">
              <button className="flex items-center gap-2 hover:text-slate-900 transition">
                <span className="text-xl">⊕</span> Save Recipe
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xl">★</span> Rating: {recipe.averageRating ? recipe.averageRating : "New"}/5.0
              </div>
              <a href="#comments-section" className="flex items-center gap-2 hover:text-slate-900 transition">
                <span className="text-xl">💬</span> {commentCount} Comment(s)
              </a>
            </div>

            {/* Main Image */}
            <div>
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full aspect-video object-cover rounded-xl shadow-lg"
              />
            </div>

            {/* Upload Photo Button */}
            <div className="mt-4 text-center">
              <label className="cursor-pointer bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-700 transition">
                Upload Photo
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
              </label>
            </div>

            {uploadedImageUrl && (
              <div className="mt-4 text-center">
                <p><strong>Your Uploaded Photo: </strong></p>
                <img src={uploadedImageUrl} className="w-48 h-auto rounded-lg shadow-md mx-auto" />
              </div>
            )}

            {/* Tags, Description, Instructions */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-3xl font-serif text-slate-800 mb-4 mt-8">Tags:</h2>
              <p>{recipe.category}</p>
              <h2 className="text-3xl font-serif text-slate-800 mb-4 mt-8">Description:</h2>
              <p>{recipe.description}</p>
              <h2 className="text-3xl font-serif text-slate-800 mb-4 mt-8">Instructions:</h2>
              <ol className="list-decimal list-outside ml-6 space-y-4 text-lg text-slate-700">
                {recipe.instructions?.map((step, index) => (
                  <li key={index} className="pl-2">{step}</li>
                ))}
              </ol>
            </div>

            {/* Rating Section */}
            <div className="mt-12 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-xl font-serif text-slate-800 mb-3">Rate this recipe:</h3>
                <div className="flex gap-2">

                    {/* for 5 stars */}
                    {[1, 2, 3, 4, 5].map((starNumber) => (
                        <button
                            key={starNumber}
                            onClick={() => handleRate(starNumber)}
                            className="text-4xl focus:outline-none transition-transform hover:scale-110"
                        >
                            <span className={userRating >= starNumber ? "text-yellow-400" : "text-gray-300"}>
                                ★
                            </span>
                        </button>
                    ))}
                </div>

                {userRating > 0 && (
                    <p className="mt-2 text-green-600 font-medium">You rated this {userRating} stars!</p>
                )}
            </div>

            {/* COMMENT SECTION */}
            <div className="mt-12" id="comments-section">
              <CommentSection recipeId={id} onCommentsLoaded={setCommentCount} />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="md:col-span-1">
            <div className="sticky top-8 space-y-8">
              
              {/* Ingredients Box */}
              <div className="bg-[#D9D9D9] p-6 rounded-md shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-serif">Ingredients</h2>
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
                        <label className="flex items-center gap-3 cursor-pointer group">
                            {/* Hidden checkbox */}
                            <input type="checkbox" className="peer hidden" />
                            
                            {/* The visible custom box */}
                            <div className="w-6 h-6 border-2 border-slate-400 rounded flex items-center justify-center peer-checked:bg-slate-800 peer-checked:border-slate-800 transition-colors">
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
                )}
              </div>

              {/* Chatbot */}
              <div>
                {/* <Chatbot /> */}
                [Chatbot Component Goes Here]
              </div>
              
            </div>
          </div>
        </div>
    </div>
  );
}
