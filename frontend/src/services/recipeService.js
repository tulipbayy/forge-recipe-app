import { API_BASE_URL } from "./api";
import { auth } from "../../public/firebase";

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
    ingredients: [
      "6 small tortillas",
      "1 lb ground beef",
      "1 cup shredded lettuce",
      "1/2 cup diced pickles",
      "1/2 cup shredded cheddar",
      "1/3 cup tangy burger sauce",
    ],
    instructions: [
      "Brown the ground beef in a skillet and season to taste.",
      "Warm the tortillas until soft and flexible.",
      "Fill each tortilla with beef, lettuce, pickles, cheddar, and sauce.",
      "Serve immediately while the tortillas are warm.",
    ],
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
    ingredients: [
      "2 packs ramen noodles",
      "4 cups broth",
      "8 dumplings",
      "2 soft boiled eggs",
      "1 cup greens",
      "Chili oil",
    ],
    instructions: [
      "Simmer broth in a pot and cook the ramen noodles.",
      "Pan-fry or steam dumplings until cooked through.",
      "Add greens to the broth until just wilted.",
      "Serve noodles with dumplings, egg, and chili oil.",
    ],
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
    ingredients: [
      "2 eggs",
      "1 cup Greek yogurt",
      "1 garlic clove",
      "2 slices toasted bread",
      "2 tbsp butter",
      "Paprika and herbs",
    ],
    instructions: [
      "Mix yogurt with grated garlic and a pinch of salt.",
      "Poach or fry the eggs to your preference.",
      "Melt butter with paprika until fragrant.",
      "Serve eggs over yogurt with paprika butter, herbs, and toast.",
    ],
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
    ingredients: [
      "8 oz pasta",
      "1 cup roasted tomatoes",
      "1 lemon",
      "1/2 cup parmesan",
      "Fresh basil",
      "2 tbsp olive oil",
    ],
    instructions: [
      "Cook pasta until al dente.",
      "Toss pasta with roasted tomatoes, olive oil, lemon zest, and parmesan.",
      "Fold in basil and season to taste.",
      "Serve warm with extra parmesan.",
    ],
  },
];

const communityRecipeFallbacks = [
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
    ingredients: [
      "8 oz pasta",
      "1 cup marinara",
      "1/2 cup mozzarella",
      "Fresh basil",
      "Salt and pepper",
    ],
    instructions: [
      "Cook pasta until al dente.",
      "Toss with marinara and mozzarella.",
      "Bake or broil until the cheese melts.",
      "Top with basil and serve.",
    ],
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
    ingredients: [
      "6 small tortillas",
      "1 lb seasoned beef",
      "Shredded lettuce",
      "Pickles",
      "Cheddar",
      "Special sauce",
    ],
    instructions: [
      "Cook seasoned beef until browned.",
      "Warm tortillas in a dry skillet.",
      "Layer beef, lettuce, pickles, cheddar, and sauce.",
      "Fold and serve hot.",
    ],
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
    ingredients: [
      "4 tortillas",
      "4 eggs",
      "1 cup crispy potatoes",
      "1/2 cup cheese",
      "Salsa",
      "Fresh cilantro",
    ],
    instructions: [
      "Scramble eggs until just set.",
      "Warm tortillas and fill with eggs, potatoes, and cheese.",
      "Top with salsa and cilantro.",
      "Serve immediately.",
    ],
  },
];

const savedRecipeFallbackIds = ["official-1", "community-2"];

const localRecipes = [...officialRecipes, ...communityRecipeFallbacks];

// Fetch community recipes from backend
async function getCommunityRecipes() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      signal: controller.signal,
    });
    if (!response.ok) return communityRecipeFallbacks;
    const data = await response.json();
    // Filter for only community recipes
    return Array.isArray(data)
      ? data.filter((recipe) => recipe.source === "community")
      : communityRecipeFallbacks;
  } catch (err) {
    return communityRecipeFallbacks;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

// Helper to get auth headers
async function authHeaders() {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function getRecipes({ source = "All", search = "", category = "All", difficulty = "All", minRating = "All" } = {}) {
  let recipes = [];
  const normalizedSource = String(source).toLowerCase();

  // Get official recipes (always include if source is "All" or "official")
  if (normalizedSource === "all" || normalizedSource === "official") {
    recipes.push(...officialRecipes);
  }

  // Get community recipes from backend if needed
  if (normalizedSource === "all" || normalizedSource === "community") {
    const communityRecipes = await getCommunityRecipes();
    recipes.push(...communityRecipes);
  }

  // Apply filters
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = recipes.filter((recipe) => {
    const matchesSearch =
      !normalizedSearch ||
      recipe.title?.toLowerCase().includes(normalizedSearch) ||
      recipe.description?.toLowerCase().includes(normalizedSearch);
    const matchesCategory = category === "All" || recipe.category === category;
    const matchesDifficulty = difficulty === "All" || recipe.difficulty === difficulty;
    const recipeRating = recipe.averageRating ?? recipe.rating;
    const matchesRating = minRating === "All" || (recipeRating && recipeRating >= Number(minRating));

    return matchesSearch && matchesCategory && matchesDifficulty && matchesRating;
  });

  return filtered;
}

export async function getRecipeById(recipeId) {
  return localRecipes.find((recipe) => recipe.recipeId === recipeId) || null;
}

export async function getMyCreatedRecipes() {
  try {
    const user = auth.currentUser;
    if (!user) return communityRecipeFallbacks;
    
    const response = await fetch(`${API_BASE_URL}/users/${user.uid}/recipes`, {
      headers: await authHeaders(),
    });
    if (!response.ok) return communityRecipeFallbacks;
    return await response.json();
  } catch (err) {
    console.error("Failed to fetch my created recipes:", err);
    return communityRecipeFallbacks;
  }
}

export async function getMySavedRecipes() {
  try {
    const user = auth.currentUser;
    const fallbackRecipes = [...officialRecipes, ...communityRecipeFallbacks].filter((recipe) =>
      savedRecipeFallbackIds.includes(recipe.recipeId)
    );
    if (!user) return fallbackRecipes;
    
    const response = await fetch(`${API_BASE_URL}/users/${user.uid}/saved`, {
      headers: await authHeaders(),
    });
    if (!response.ok) return fallbackRecipes;
    return await response.json();
  } catch (err) {
    console.error("Failed to fetch my saved recipes:", err);
    return [...officialRecipes, ...communityRecipeFallbacks].filter((recipe) =>
      savedRecipeFallbackIds.includes(recipe.recipeId)
    );
  }
}

export async function deleteCreatedRecipe(recipeId) {
  if (!auth.currentUser) return { recipeId };

  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete recipe");
    return await response.json();
  } catch (err) {
    console.error("Delete recipe failed:", err);
    throw err;
  }
}

export async function removeSavedRecipe(recipeId) {
  if (!auth.currentUser) return { recipeId };

  try {
    const response = await fetch(`${API_BASE_URL}/users/saved/${recipeId}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    if (!response.ok) throw new Error("Failed to remove saved recipe");
    return await response.json();
  } catch (err) {
    console.error("Remove saved recipe failed:", err);
    throw err;
  }
}

export async function saveRecipe(recipeId) {
  if (!auth.currentUser) return { recipeId };

  try {
    const response = await fetch(`${API_BASE_URL}/users/saved`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify({ recipeId }),
    });
    if (!response.ok) throw new Error("Failed to save recipe");
    return await response.json();
  } catch (err) {
    console.error("Save recipe failed:", err);
    throw err;
  }
}
