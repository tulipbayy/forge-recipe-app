const officialRecipes = [
  {
    recipeId: "official-1",
    title: "Big Max Taco",
    description: "Crunchy tortillas with spiced beef, shredded lettuce, pickles, and tangy sauce.",
    imageUrl:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80",
    category: "Dinner",
    difficulty: "Easy",
    rating: 4.8,
    ratingCount: 231,
    source: "official",
    author: "Official",
  },
  {
    recipeId: "official-2",
    title: "Dumpling Ramen",
    description: "Brothy ramen with pan dumplings, soft egg, greens, and chili oil.",
    imageUrl:
      "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=900&q=80",
    category: "Lunch",
    difficulty: "Medium",
    rating: 4.9,
    ratingCount: 184,
    source: "official",
    author: "Official",
  },
  {
    recipeId: "official-3",
    title: "Turkish Egg",
    description: "Garlicky yogurt, poached eggs, toasted bread, herbs, and paprika butter.",
    imageUrl:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80",
    category: "Breakfast",
    difficulty: "Easy",
    rating: 4.7,
    ratingCount: 149,
    source: "official",
    author: "Official",
  },
  {
    recipeId: "official-4",
    title: "Lemon Herb Pasta",
    description: "Creamy pasta tossed with roasted tomatoes, basil, lemon zest, and parmesan.",
    imageUrl:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80",
    category: "Dinner",
    difficulty: "Easy",
    rating: 4.6,
    ratingCount: 98,
    source: "official",
    author: "Official",
  },
];

const communityRecipes = [
  {
    recipeId: "community-1",
    title: "Pasta",
    description: "A cozy baked pasta with melted cheese and fresh basil.",
    imageUrl:
      "https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=900&q=80",
    category: "Dinner",
    difficulty: "Medium",
    rating: 4.5,
    ratingCount: 42,
    source: "community",
    author: "JD",
    authorId: "demo-user",
  },
  {
    recipeId: "community-2",
    title: "Big Max Taco",
    description: "A community spin with toasted tortillas and extra sauce.",
    imageUrl:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80",
    category: "Lunch",
    difficulty: "Easy",
    rating: 4.3,
    ratingCount: 27,
    source: "community",
    author: "JD",
    authorId: "demo-user",
  },
  {
    recipeId: "community-3",
    title: "Breakfast Tacos",
    description: "Eggs, cheese, salsa, and crispy potatoes wrapped in warm tortillas.",
    imageUrl:
      "https://images.unsplash.com/photo-1611250188496-e966043a0629?auto=format&fit=crop&w=900&q=80",
    category: "Breakfast",
    difficulty: "Easy",
    rating: 4.4,
    ratingCount: 33,
    source: "community",
    author: "JD",
    authorId: "demo-user",
  },
];

const savedRecipeIds = ["official-1", "community-2"];

export async function getRecipes({ source = "official", search = "", category = "All", difficulty = "All", minRating = "All" } = {}) {
  const baseRecipes =
    source === "All" ? [...officialRecipes, ...communityRecipes] : source === "community" ? communityRecipes : officialRecipes;
  const normalizedSearch = search.trim().toLowerCase();

  return baseRecipes.filter((recipe) => {
    const matchesSearch =
      !normalizedSearch ||
      recipe.title.toLowerCase().includes(normalizedSearch) ||
      recipe.description.toLowerCase().includes(normalizedSearch);
    const matchesCategory = category === "All" || recipe.category === category;
    const matchesDifficulty = difficulty === "All" || recipe.difficulty === difficulty;
    const matchesRating = minRating === "All" || recipe.rating >= Number(minRating);

    return matchesSearch && matchesCategory && matchesDifficulty && matchesRating;
  });
}

export async function getMyCreatedRecipes() {
  return communityRecipes.filter((recipe) => recipe.authorId === "demo-user");
}

export async function getMySavedRecipes() {
  const allRecipes = [...officialRecipes, ...communityRecipes];
  return allRecipes.filter((recipe) => savedRecipeIds.includes(recipe.recipeId));
}

export async function deleteCreatedRecipe(recipeId) {
  return { recipeId };
}

export async function removeSavedRecipe(recipeId) {
  return { recipeId };
}

export async function saveRecipe(recipeId) {
  return { recipeId };
}
