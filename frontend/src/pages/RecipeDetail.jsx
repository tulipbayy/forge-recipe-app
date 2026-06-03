import React from 'react';

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
    return ( 
        <div className="min-h-screen bg-[#E8F3EB] p-8 font-sans text-gray-800">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                {/*Left column */}
                <div className="md:col-span-2 space-y-6">

                    {/* Title and Ratings */}
                    <div className="text-center">

                    </div>

                    {/* Main image */}
                    <div>

                    </div>

                    {/* Tags, Description, Instructions */}
                    <div>

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