import express from "express";
import { FieldValue } from "firebase-admin/firestore";
import { admin, db } from "../firebaseAdmin.js";
import { requireAuth } from "../middleware/auth.js";
const router = express.Router();
function normalizeDummyRecipe(recipe) {
  return {
    recipeId: `official-${recipe.id}`,
    source: "official",
    externalRecipeId: String(recipe.id),
    title: recipe.name,
    imageUrl: recipe.image,
    category: recipe.mealType?.[0] || "Dinner",
    difficulty: recipe.difficulty || "Easy",
    description: `${recipe.cuisine || "Official"} recipe from DummyJSON.`,
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    rating: recipe.rating || 0,
    ratingCount: recipe.reviewCount || 0,
    averageRating: recipe.rating || 0,
  };
}
function normalizeEdamamRecipe(hit) {
  return {
    recipeId: hit.recipe.uri.split("#recipe_")[1],
    source: "edamam",
    title: hit.recipe.label,
    imageUrl: hit.recipe.image,
    category: hit.recipe.dishType?.[0] || "Dinner",
    difficulty: "Medium",
    description: `Source: ${hit.recipe.source}`,
    ingredients: hit.recipe.ingredientLines,
    instructions: [`For full instructions, visit: ${hit.recipe.url}`],
    rating: 0,
    ratingCount: 0,
    averageRating: null,
  };
}
async function fetchOfficialRecipes(query = "popular", limit = 8) {
  if (process.env.EDAMAM_APP_ID && process.env.EDAMAM_APP_KEY) {
    try {
      const url = `https://api.edamam.com/api/recipes/v2?type=public&app_id=${
        process.env.EDAMAM_APP_ID
      }&app_key=${process.env.EDAMAM_APP_KEY}&q=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: { "Edamam-Account-User": process.env.EDAMAM_ACCOUNT_USER },
      });
      if (response.ok) {
        const data = await response.json();
        return (data.hits || []).slice(0, limit).map(normalizeEdamamRecipe);
      }
    } catch (error) {
      console.warn("Edamam fetch failed:", error.message);
    }
  }
  try {
    const endpoint =
      query && query !== "popular"
        ? `https://dummyjson.com/recipes/search?q=${encodeURIComponent(query)}`
        : `https://dummyjson.com/recipes?limit=${limit}`;
    const response = await fetch(endpoint);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.recipes || []).slice(0, limit).map(normalizeDummyRecipe);
  } catch (error) {
    console.warn("DummyJSON fetch failed:", error.message);
    return [];
  }
}
async function fetchCommunityRecipes() {
  if (!db) return [];
  const snapshot = await db
    .collection("recipes")
    .where("approved", "==", true)
    .limit(8)
    .get();
  return snapshot.docs.map((doc) => ({
    recipeId: doc.id,
    source: "community",
    ...doc.data(),
  }));
}
router.get("/", async (req, res) => {
  const { source = "All", q = "" } = req.query;
  const recipes = [];
  try {
    if (source === "All" || source === "official" || source === "edamam") {
      recipes.push(...(await fetchOfficialRecipes(q || "popular", 8)));
    }
    if (source === "All" || source === "community") {
      recipes.push(...(await fetchCommunityRecipes()));
    }
    return res.json(recipes);
  } catch (error) {
    console.error("Error in GET /api/recipes", error);
    return res.status(500).json({ error: "Failed to fetch recipes" });
  }
});
router.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Please provide a search query" });
  try {
    const officialRecipes = await fetchOfficialRecipes(query, 8);
    const lowerQuery = query.toLowerCase();
    const communityRecipes = (await fetchCommunityRecipes()).filter((recipe) =>
      recipe.title?.toLowerCase().includes(lowerQuery)
    );
    return res.json([...communityRecipes, ...officialRecipes]);
  } catch (error) {
    console.error("Error in GET /api/recipes/search", error);
    return res.status(500).json({ error: "Failed to search recipes" });
  }
});
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, ingredients, instructions, imageUrl, category, description } =
      req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    const cleanIngredients = (ingredients || []).filter((i) => i?.trim());
    const cleanInstructions = (instructions || []).filter((i) => i?.trim());
    if (cleanIngredients.length === 0) {
      return res.status(400).json({ error: "At least one ingredient is required" });
    }
    if (cleanInstructions.length === 0) {
      return res.status(400).json({ error: "At least one instruction is required" });
    }
    const ref = await db.collection("recipes").add({
      title: title.trim(),
      ingredients: cleanIngredients,
      instructions: cleanInstructions,
      imageUrl: imageUrl || "",
      category: category || "Dinner",
      description: description || "",
      source: "community",
      authorId: req.user.userId,
      approved: false,
      rejected: false,
      ratings: [],
      ratingCount: 0,
      averageRating: null,
      createdAt: FieldValue.serverTimestamp(),
    });
    const created = await ref.get();
    res.status(201).json({ recipeId: created.id, ...created.data() });
  } catch (error) {
    console.error("Error in POST /api/recipes", error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const source = req.query.source || "";
  try {
    if (source === "official" || id.startsWith("official-")) {
      const externalId = id.replace("official-", "");
      const response = await fetch(`https://dummyjson.com/recipes/${externalId}`);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Official recipe not found" });
      }
      return res.json(normalizeDummyRecipe(await response.json()));
    }
    if (source === "edamam") {
      if (!db) {
        return res.status(503).json({ error: "Firebase Admin is not configured." });
      }
      const docRef = db.collection("recipes").doc(id);
      const cachedDoc = await docRef.get();
      if (cachedDoc.exists) {
        return res.json({ recipeId: cachedDoc.id, ...cachedDoc.data() });
      }
      const url = `https://api.edamam.com/api/recipes/v2/${id}?type=public&app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}`;
      const response = await fetch(url, {
        headers: { "Edamam-Account-User": process.env.EDAMAM_ACCOUNT_USER },
      });
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch from Edamam" });
      }
      const data = await response.json();
      const normalizedRecipe = normalizeEdamamRecipe({ recipe: data.recipe });
      await docRef.set(normalizedRecipe);
      return res.json({ recipeId: id, ...normalizedRecipe });
    }
    if (source === "community") {
      if (!db) {
        return res.status(503).json({ error: "Firebase Admin is not configured." });
      }
      const docSnap = await db.collection("recipes").doc(id).get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: "Community recipe not found" });
      }
      return res.json({ recipeId: docSnap.id, ...docSnap.data() });
    }
    return res.status(400).json({
      error: "Please provide a valid source (?source=official, ?source=edamam, or ?source=community)",
    });
  } catch (error) {
    console.error("Error in GET /api/recipes/:id", error);
    return res.status(500).json({ error: "Internal service error" });
  }
});
router.post("/:id/rate", async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;
  if (!db) {
    return res.status(503).json({ error: "Firebase Admin is not configured." });
  }
  try {
    const docRef = db.collection("recipes").doc(id);
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) throw new Error("Recipe not found");
      const data = doc.data();
      const currentRatings = data.ratings || [];
      const newRatings = [...currentRatings, rating];
      const sum = newRatings.reduce((total, value) => total + Number(value), 0);
      const averageRating = Number((sum / newRatings.length).toFixed(1));
      transaction.update(docRef, {
        ratings: newRatings,
        averageRating,
        ratingCount: admin.firestore.FieldValue.increment(1),
      });
    });
    return res.json({ message: "Rating saved and average calculated." });
  } catch (error) {
    console.error("Failed to save rating:", error);
    return res.status(500).json({ error: "Failed to save rating" });
  }
});
export default router;

// <<<<<<< HEAD
// import express from "express";
// import { FieldValue } from "firebase-admin/firestore";
// import { admin, db } from "../firebaseAdmin.js";
// import { requireAuth } from "../middleware/auth.js";

// const router = express.Router();

// function normalizeDummyRecipe(recipe) {
//   return {
//     recipeId: `official-${recipe.id}`,
//     source: "official",
//     externalRecipeId: String(recipe.id),
//     title: recipe.name,
//     imageUrl: recipe.image,
//     category: recipe.mealType?.[0] || "Dinner",
//     difficulty: recipe.difficulty || "Easy",
//     description: `${recipe.cuisine || "Official"} recipe from DummyJSON.`,
//     ingredients: recipe.ingredients || [],
//     instructions: recipe.instructions || [],
//     rating: recipe.rating || 0,
//     ratingCount: recipe.reviewCount || 0,
//     averageRating: recipe.rating || 0,
//   };
// }

// function normalizeEdamamRecipe(hit) {
//   return {
//     recipeId: hit.recipe.uri.split("#recipe_")[1],
//     source: "edamam",
//     title: hit.recipe.label,
//     imageUrl: hit.recipe.image,
//     category: hit.recipe.dishType?.[0] || "Dinner",
//     difficulty: "Medium",
//     description: `Source: ${hit.recipe.source}`,
//     ingredients: hit.recipe.ingredientLines,
//     instructions: [`For full instructions, visit: ${hit.recipe.url}`],
//     rating: 0,
//     ratingCount: 0,
//     averageRating: null,
//   };
// }

// async function fetchOfficialRecipes(query = "popular", limit = 8) {
//   if (process.env.EDAMAM_APP_ID && process.env.EDAMAM_APP_KEY) {
//     try {
//       const url = `https://api.edamam.com/api/recipes/v2?type=public&app_id=${
//         process.env.EDAMAM_APP_ID
//       }&app_key=${process.env.EDAMAM_APP_KEY}&q=${encodeURIComponent(query)}`;
//       const response = await fetch(url, {
//         headers: { "Edamam-Account-User": process.env.EDAMAM_ACCOUNT_USER },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         return (data.hits || []).slice(0, limit).map(normalizeEdamamRecipe);
//       }
//     } catch (error) {
//       console.warn("Edamam fetch failed:", error.message);
//     }
//   }

//   try {
//     const endpoint =
//       query && query !== "popular"
//         ? `https://dummyjson.com/recipes/search?q=${encodeURIComponent(query)}`
//         : `https://dummyjson.com/recipes?limit=${limit}`;
//     const response = await fetch(endpoint);

//     if (!response.ok) return [];

//     const data = await response.json();
//     return (data.recipes || []).slice(0, limit).map(normalizeDummyRecipe);
//   } catch (error) {
//     console.warn("DummyJSON fetch failed:", error.message);
//     return [];
//   }
// }

// async function fetchCommunityRecipes() {
//   if (!db) return [];

//   const snapshot = await db
//     .collection("recipes")
//     .where("approved", "==", true)
//     .limit(8)
//     .get();

//   return snapshot.docs.map((doc) => ({
//     recipeId: doc.id,
//     source: "community",
//     ...doc.data(),
//   }));
// }

// router.get("/", async (req, res) => {
//   const { source = "All", q = "" } = req.query;
//   const recipes = [];

//   try {
//     if (source === "All" || source === "official" || source === "edamam") {
//       recipes.push(...(await fetchOfficialRecipes(q || "popular", 8)));
//     }

//     if (source === "All" || source === "community") {
//       recipes.push(...(await fetchCommunityRecipes()));
//     }

//     return res.json(recipes);
//   } catch (error) {
//     console.error("Error in GET /api/recipes", error);
//     return res.status(500).json({ error: "Failed to fetch recipes" });
//   }
// });

// router.get("/search", async (req, res) => {
//   const query = req.query.q;
//   if (!query) return res.status(400).json({ error: "Please provide a search query" });

//   try {
//     const officialRecipes = await fetchOfficialRecipes(query, 8);
//     const lowerQuery = query.toLowerCase();
//     const communityRecipes = (await fetchCommunityRecipes()).filter((recipe) =>
//       recipe.title?.toLowerCase().includes(lowerQuery)
//     );

//     return res.json([...communityRecipes, ...officialRecipes]);
//   } catch (error) {
//     console.error("Error in GET /api/recipes/search", error);
//     return res.status(500).json({ error: "Failed to search recipes" });
//   }
// });

// router.post("/", requireAuth, async (req, res) => {
//   try {
//     const { title, ingredients, instructions, imageUrl, category, description } =
//       req.body;

//     if (!title || !title.trim()) {
//       return res.status(400).json({ error: "Title is required" });
//     }

//     const cleanIngredients = (ingredients || []).filter((i) => i?.trim());
//     const cleanInstructions = (instructions || []).filter((i) => i?.trim());

//     if (cleanIngredients.length === 0) {
//       return res.status(400).json({ error: "At least one ingredient is required" });
//     }
//     if (cleanInstructions.length === 0) {
//       return res.status(400).json({ error: "At least one instruction is required" });
//     }

//     const ref = await db.collection("recipes").add({
//       title: title.trim(),
//       ingredients: cleanIngredients,
//       instructions: cleanInstructions,
//       imageUrl: imageUrl || "",
//       category: category || "Dinner",
//       description: description || "",
//       source: "community",
//       authorId: req.user.userId,
//       approved: false,
//       rejected: false,
//       ratings: [],
//       ratingCount: 0,
//       averageRating: null,
//       createdAt: FieldValue.serverTimestamp(),
//     });

//     const created = await ref.get();
//     res.status(201).json({ recipeId: created.id, ...created.data() });
//   } catch (error) {
//     console.error("Error in POST /api/recipes", error);
//     res.status(500).json({ error: "Failed to create recipe" });
//   }
// });

// router.get("/:id", async (req, res) => {
//   const { id } = req.params;
//   const source = req.query.source || "";

//   try {
//     if (source === "official" || id.startsWith("official-")) {
//       const externalId = id.replace("official-", "");
//       const response = await fetch(`https://dummyjson.com/recipes/${externalId}`);

//       if (!response.ok) {
//         return res.status(response.status).json({ error: "Official recipe not found" });
//       }

//       return res.json(normalizeDummyRecipe(await response.json()));
//     }

//     if (source === "edamam") {
//       if (!db) {
//         return res.status(503).json({ error: "Firebase Admin is not configured." });
//       }

//       const docRef = db.collection("recipes").doc(id);
//       const cachedDoc = await docRef.get();
//       if (cachedDoc.exists) {
//         return res.json({ recipeId: cachedDoc.id, ...cachedDoc.data() });
//       }

//       const url = `https://api.edamam.com/api/recipes/v2/${id}?type=public&app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}`;
//       const response = await fetch(url, {
//         headers: { "Edamam-Account-User": process.env.EDAMAM_ACCOUNT_USER },
//       });

//       if (!response.ok) {
//         return res.status(response.status).json({ error: "Failed to fetch from Edamam" });
//       }

//       const data = await response.json();
//       const normalizedRecipe = normalizeEdamamRecipe({ recipe: data.recipe });
//       await docRef.set(normalizedRecipe);
//       return res.json({ recipeId: id, ...normalizedRecipe });
//     }

//     if (source === "community") {
//       if (!db) {
//         return res.status(503).json({ error: "Firebase Admin is not configured." });
//       }

//       const docSnap = await db.collection("recipes").doc(id).get();
//       if (!docSnap.exists) {
//         return res.status(404).json({ error: "Community recipe not found" });
//       }

//       return res.json({ recipeId: docSnap.id, ...docSnap.data() });
//     }

//     return res.status(400).json({
//       error: "Please provide a valid source (?source=official, ?source=edamam, or ?source=community)",
//     });
//   } catch (error) {
//     console.error("Error in GET /api/recipes/:id", error);
//     return res.status(500).json({ error: "Internal service error" });
//   }
// });

// router.post("/:id/rate", async (req, res) => {
//   const { id } = req.params;
//   const { rating } = req.body;

//   if (!db) {
//     return res.status(503).json({ error: "Firebase Admin is not configured." });
//   }

//   try {
//     const docRef = db.collection("recipes").doc(id);
//     await db.runTransaction(async (transaction) => {
//       const doc = await transaction.get(docRef);
//       if (!doc.exists) throw new Error("Recipe not found");
//       const data = doc.data();
//       const currentRatings = data.ratings || [];
//       const newRatings = [...currentRatings, rating];
//       const sum = newRatings.reduce((total, value) => total + Number(value), 0);
//       const averageRating = Number((sum / newRatings.length).toFixed(1));

//       transaction.update(docRef, {
//         ratings: newRatings,
//         averageRating,
//         ratingCount: admin.firestore.FieldValue.increment(1),
//       });
//     });

//     return res.json({ message: "Rating saved and average calculated." });
//   } catch (error) {
//     console.error("Failed to save rating:", error);
//     return res.status(500).json({ error: "Failed to save rating" });
//   }
// });

// export default router;
// =======
// import express from "express";
// import { admin, db } from "../firebaseAdmin.js";
// const router = express.Router();

// // 1. RYAN'S ROUTE: Get all recipes for the Home page
// router.get("/", async (req, res) => {
//   try {
//     const snapshot = await db
//       .collection("recipes")
//       .where("approved", "==", true)
//       .where("source", "==", "community") 
//       .limit(6)
//       .get();
//     const communityRecipes = snapshot.docs.map((doc) => ({
//       recipeId: doc.id,
//       source: "community",
//       ...doc.data(),
//     }));
//     const edamamUrl = `https://api.edamam.com/api/recipes/v2?type=public&app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}&q=popular`;
//     const edamamResponse = await fetch(edamamUrl, {
//       headers: {
//         "Edamam-Account-User": process.env.EDAMAM_ACCOUNT_USER,
//       },
//     });
//     let edamamRecipes = [];
//     if (edamamResponse.ok) {
//       const edamamData = await edamamResponse.json();
//       edamamRecipes = (edamamData.hits || []).slice(0, 6).map((hit) => ({
//         recipeId: hit.recipe.uri.split("#recipe_")[1],
//         source: "official",
//         title: hit.recipe.label,
//         imageUrl: hit.recipe.image,
//         category: hit.recipe.dishType?.[0] || "Dinner",
//         description: `Source: ${hit.recipe.source}`,
//         ingredients: hit.recipe.ingredientLines,
//         instructions: [`For full instructions, visit: ${hit.recipe.url}`],
//         averageRating: null,
//       }));
//     }
//     const mixed = [];
//     const maxLen = Math.max(communityRecipes.length, edamamRecipes.length);
//     for (let i = 0; i < maxLen; i++) {
//       if (i < communityRecipes.length) mixed.push(communityRecipes[i]);
//       if (i < edamamRecipes.length) mixed.push(edamamRecipes[i]);
//     }
//     return res.json(mixed);
//   } catch (error) {
//     console.error("Error in GET /api/recipes", error);
//     return res.status(500).json({ error: "Failed to fetch recipes" });
//   }
// });

// // 2. RYAN'S ROUTE: Search function
// router.get("/search", async (req, res) => {
//   const query = req.query.q;
//   if (!query)
//     return res.status(400).json({ error: "Please provide a search query" });
//   try {
//     const edamamUrl = `https://api.edamam.com/api/recipes/v2?type=public&app_id=${
//       process.env.EDAMAM_APP_ID
//     }&app_key=${process.env.EDAMAM_APP_KEY}&q=${encodeURIComponent(query)}`;
//     const edamamResponse = await fetch(edamamUrl, {
//       headers: { "Edamam-Account-User": process.env.EDAMAM_ACCOUNT_USER },
//     });
//     let edamamRecipes = [];
//     if (edamamResponse.ok) {
//       const edamamData = await edamamResponse.json();
//       edamamRecipes = (edamamData.hits || []).slice(0, 8).map((hit) => ({
//         recipeId: hit.recipe.uri.split("#recipe_")[1],
//         source: "official",
//         title: hit.recipe.label,
//         imageUrl: hit.recipe.image,
//         category: hit.recipe.dishType?.[0] || "Dinner",
//         description: `Source: ${hit.recipe.source}`,
//         ingredients: hit.recipe.ingredientLines,
//         instructions: [`For full instructions, visit: ${hit.recipe.url}`],
//         averageRating: null,
//       }));
//     }
//     const snapshot = await db
//       .collection("recipes")
//       .where("approved", "==", true)
//       .where("source", "==", "community") 
//       .get();
//     const lowerQuery = query.toLowerCase();
//     const communityRecipes = snapshot.docs
//       .map((doc) => ({ recipeId: doc.id, source: "community", ...doc.data() }))
//       .filter((r) => r.title?.toLowerCase().includes(lowerQuery));
//     const mixed = [];
//     const maxLen = Math.max(communityRecipes.length, edamamRecipes.length);
//     for (let i = 0; i < maxLen; i++) {
//       if (i < communityRecipes.length) mixed.push(communityRecipes[i]);
//       if (i < edamamRecipes.length) mixed.push(edamamRecipes[i]);
//     }
//     return res.json(mixed);
//   } catch (error) {
//     console.error("Error in GET /api/recipes/search", error);
//     return res.status(500).json({ error: "Failed to search recipes" });
//   }
// });

// // 3. MY ROUTE: Get Single Recipe + Edamam Caching
// router.get("/:id", async (req, res) => {
//   const recipeId = req.params.id;
//   const source = req.query.source;
//   try {
//     if (source === "official") {
//       const docRef = db.collection('recipes').doc(recipeId);
            
//       // 1. Check if we already cached this recipe in Firestore!
//       const cachedDoc = await docRef.get();
//       if (cachedDoc.exists) {
//           console.log(`Serving Edamam recipe ${recipeId} from Firestore Cache!`);
//           return res.json({ recipeId: cachedDoc.id, ...cachedDoc.data() });
//       }
//       console.log(`Cache miss. Fetching recipe ${recipeId} from Edamam API...`);
//       const url = `https://api.edamam.com/api/recipes/v2/${recipeId}?type=public&app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}`;
//       const response = await fetch(url, {
//         headers: {
//           "Edamam-Account-User": process.env.EDAMAM_ACCOUNT_USER,
//         },
//       });
//       if (!response.ok) {
//         return res.status(response.status).json({
//           error: "Failed to fetch from Edamam",
//         });
//       }

//       const data = await response.json();
//       const edamamRecipe = data.recipe;
//       const normalizedRecipe = {
//         title: edamamRecipe.label,
//         imageUrl: edamamRecipe.image,
//         imageUrls: [],
//         category: edamamRecipe.dishType ? edamamRecipe.dishType[0] : "Dinner",
//         description: `Source: ${edamamRecipe.source}`,
//         ingredients: edamamRecipe.ingredientLines,
//         instructions: [
//           `For full instructions, please visit: ${edamamRecipe.url}`,
//         ],
//         source: "official",
//         ratings: [],
//         ratingCount: 0,
//         averageRating: 0,
//         approved: true, // Auto-approve Edamam recipes so they show up in searches
//         rejected: false,
//         createdAt: admin.firestore.FieldValue.serverTimestamp(),
//         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//       };
//       await docRef.set(normalizedRecipe);
//       console.log(`Saved Edamam recipe ${recipeId} to cache!`);
//       return res.json({ recipeId: recipeId, ...normalizedRecipe });
//     } else if (source === "community") {
//       console.log(`Fetching recipe ${recipeId} from Firestore...`);
//       const docRef = db.collection("recipes").doc(recipeId);
//       const docSnap = await docRef.get();
//       if (!docSnap.exists) {
//         return res.status(404).json({ error: "Community recipe not found" });
//       }
//       return res.json({ recipeId: docSnap.id, ...docSnap.data() });
//     } else {
//       return res.status(400).json({
//         error:
//           "Please provide a valid source (?source=official or ?source=community)",
//       });
//     }
//   } catch (error) {
//     console.error("Error in GET /api/recipes/:id", error);
//     return res.status(500).json({ error: "Internal service error" });
//   }
// });

// // MY ROUTE: Add ratings
// router.post("/:id/rate", async (req, res) => {
//   const { id } = req.params;
//   const { rating } = req.body;

//   try {
//     const docRef = db.collection("recipes").doc(id);
//     await db.runTransaction(async (transaction) => {
//       const doc = await transaction.get(docRef);
//       if (!doc.exists) throw new Error("Recipe not found!");
//       const data = doc.data();
//       const currentRatings = data.ratings || [];
//       const newRatingCount = data.ratingCount + 1;
//       const newRatings = [...currentRatings, rating];
//       const sum = newRatings.reduce((a, b) => a + b, 0);
//       const averageRating = (sum / newRatings.length).toFixed(1);
//       transaction.update(docRef, {
//         ratings: newRatings,
//         averageRating: parseFloat(averageRating),
//         ratingCount: newRatingCount,
//       });
//     });
//     res.json({ message: "Rating saved and average calculated!" });
//   } catch (error) {
//     console.error("Failed to save rating:", error);
//     res.status(500).json({ error: "Failed to save rating" });
//   }
// });

// export default router;
// >>>>>>> b7943d1 (fixed small bug in home page and recipe details)
