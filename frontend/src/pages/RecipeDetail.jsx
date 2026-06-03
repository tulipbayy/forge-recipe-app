import React from 'react';
import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../public/firebase";

const dummyRecipe = {
  title: "Spicy Garlic Butter Pasta",
  imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=800&auto=format&fit=crop",
  category: "Dinner",
  description: "A quick, 15-minute pasta dish coated in a rich, spicy garlic butter sauce. Perfect for a weeknight dinner!",
  ingredients: [
    "8 oz linguine or spaghetti",
    "4 tbsp unsalted butter",
    "4 cloves garlic, minced",
    "1 tsp red pepper flakes (adjust to taste)",
    "1/4 cup grated Parmesan cheese",
    "1 tbsp fresh parsley, chopped"
  ],
  instructions: [
    "Boil a large pot of salted water. Cook the pasta according to package directions until al dente. Reserve 1/2 cup of pasta water before draining.",
    "While pasta cooks, melt the butter in a large skillet over medium-low heat.",
    "Add the minced garlic and red pepper flakes. Sauté for 1-2 minutes until fragrant, being careful not to burn the garlic.",
    "Toss the drained pasta into the skillet. Add a splash of the reserved pasta water and stir vigorously until a silky sauce forms.",
    "Remove from heat, stir in the Parmesan cheese and garnish with fresh parsley. Serve immediately."
  ]
};

export default function RecipeDetail() {
    const [uploadedImageUrl, setUploadedImageUrl] = useState("");

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) { return; }

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

    return ( 
        <div className="min-h-screen bg-[#E8F3EB] p-8 font-sans text-gray-800">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                {/*Left column */}
                <div className="md:col-span-2 space-y-6"
                    key={dummyRecipe.title}>

                    {/* Title, Ratings, Comments, etc. */}
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-serif text-slate-800 mb-2">{dummyRecipe.title}</h1>
                    </div>

                    {/* Main image */}
                    <div>
                        <img 
                            src={dummyRecipe.imageUrl}
                            alt={dummyRecipe.title}
                            className="w-full aspect-video object-cover rounded-xl shadow-lg"
                        />
                    </div>

                    {/* Tags, Description, Instructions */}
                    <div>
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

                        <h2 className="text-3xl font-serif text-slate-800 mb-4 mt-8">Tags: </h2>
                        <p>{dummyRecipe.category}</p>

                        <h2 className="text-3xl font-serif text-slate-800 mb-4 mt-8">Description: </h2>
                        <p>{dummyRecipe.description}</p>

                        <h2 className="text-3xl font-serif text-slate-800 mb-4 mt-8">Instructions: </h2>
                        <ol className="list-decimal list-outside ml-6 space-y-4 text-lg text-slate-700">
                            {dummyRecipe.instructions.map((step, index) => (
                                <li key={index} className="pl-2">
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Comment Section */}
                    <div className="mt-12 p-4 border-2 border-dashed border-gray-400 text-center">
                            [CommentSection Component Goes Here]
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="md:col-span-1">

                    {/* Ingredients Box */}
                    <div className="bg-[#D9D9D9] p-6 rounded-md shadow-sm sticky top-8">
                        {/* Ingredients checklist here */}
                        <h2 className="text-2xl font-serif text-center mb-6">Ingredients</h2>
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