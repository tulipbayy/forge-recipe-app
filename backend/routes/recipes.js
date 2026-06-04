import express from "express";
import { admin, db } from "../firebaseAdmin.js";
const router = express.Router();

// 1. RYAN'S ROUTE: Get all recipes for the Home page
router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("recipes")
      .where("approved", "==", true)
      .limit(6)
      .get();
    const communityRecipes = snapshot.docs.map((doc) => ({
      recipeId: doc.id,
      source: "community",
      ...doc.data(),
    }));
    const edamamUrl = `https://api.edamam.com/api/recipes/v2?type=public&app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}&q=popular`;
    const edamamResponse = await fetch(edamamUrl, {
      headers: {
        "Edamam-Account-User": process.env.EDAMAM_ACCOUNT_USER,
      },
    });
    let edamamRecipes = [];
    if (edamamResponse.ok) {
      const edamamData = await edamamResponse.json();
      edamamRecipes = (edamamData.hits || []).slice(0, 6).map((hit) => ({
        recipeId: hit.recipe.uri.split("#recipe_")[1],
        source: "edamam",
        title: hit.recipe.label,
        imageUrl: hit.recipe.image,
        category: hit.recipe.dishType?.[0] || "Dinner",
        description: `Source: ${hit.recipe.source}`,
        ingredients: hit.recipe.ingredientLines,
        instructions: [`For full instructions, visit: ${hit.recipe.url}`],
        averageRating: null,
      }));
    }
    const mixed = [];
    const maxLen = Math.max(communityRecipes.length, edamamRecipes.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < communityRecipes.length) mixed.push(communityRecipes[i]);
      if (i < edamamRecipes.length) mixed.push(edamamRecipes[i]);
    }
    return res.json(mixed);
  } catch (error) {
    console.error("Error in GET /api/recipes", error);
    return res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

// 2. RYAN'S ROUTE: Search function
router.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query)
    return res.status(400).json({ error: "Please provide a search query" });
  try {
    const edamamUrl = `https://api.edamam.com/api/recipes/v2?type=public&app_id=${
      process.env.EDAMAM_APP_ID
    }&app_key=${process.env.EDAMAM_APP_KEY}&q=${encodeURIComponent(query)}`;
    const edamamResponse = await fetch(edamamUrl, {
      headers: { "Edamam-Account-User": process.env.EDAMAM_ACCOUNT_USER },
    });
    let edamamRecipes = [];
    if (edamamResponse.ok) {
      const edamamData = await edamamResponse.json();
      edamamRecipes = (edamamData.hits || []).slice(0, 8).map((hit) => ({
        recipeId: hit.recipe.uri.split("#recipe_")[1],
        source: "edamam",
        title: hit.recipe.label,
        imageUrl: hit.recipe.image,
        category: hit.recipe.dishType?.[0] || "Dinner",
        description: `Source: ${hit.recipe.source}`,
        ingredients: hit.recipe.ingredientLines,
        instructions: [`For full instructions, visit: ${hit.recipe.url}`],
        averageRating: null,
      }));
    }
    const snapshot = await db
      .collection("recipes")
      .where("approved", "==", true)
      .get();
    const lowerQuery = query.toLowerCase();
    const communityRecipes = snapshot.docs
      .map((doc) => ({ recipeId: doc.id, source: "community", ...doc.data() }))
      .filter((r) => r.title?.toLowerCase().includes(lowerQuery));
    const mixed = [];
    const maxLen = Math.max(communityRecipes.length, edamamRecipes.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < communityRecipes.length) mixed.push(communityRecipes[i]);
      if (i < edamamRecipes.length) mixed.push(edamamRecipes[i]);
    }
    return res.json(mixed);
  } catch (error) {
    console.error("Error in GET /api/recipes/search", error);
    return res.status(500).json({ error: "Failed to search recipes" });
  }
});

// 3. MY ROUTE: Get Single Recipe + Edamam Caching
router.get("/:id", async (req, res) => {
  const recipeId = req.params.id;
  const source = req.query.source;
  try {
    if (source === "edamam") {
      const docRef = db.collection('recipes').doc(recipeId);
            
      // 1. Check if we already cached this recipe in Firestore!
      const cachedDoc = await docRef.get();
      if (cachedDoc.exists) {
          console.log(`Serving Edamam recipe ${recipeId} from Firestore Cache!`);
          return res.json({ recipeId: cachedDoc.id, ...cachedDoc.data() });
      }
      console.log(`Cache miss. Fetching recipe ${recipeId} from Edamam API...`);
      const url = `https://api.edamam.com/api/recipes/v2/${recipeId}?type=public&app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}`;
      const response = await fetch(url, {
        headers: {
          "Edamam-Account-User": process.env.EDAMAM_ACCOUNT_USER,
        },
      });
      if (!response.ok) {
        return res.status(response.status).json({
          error: "Failed to fetch from Edamam",
        });
      }

      const data = await response.json();
      const edamamRecipe = data.recipe;
      const normalizedRecipe = {
        title: edamamRecipe.label,
        imageUrl: edamamRecipe.image,
        category: edamamRecipe.dishType ? edamamRecipe.dishType[0] : "Dinner",
        description: `Source: ${edamamRecipe.source}`,
        ingredients: edamamRecipe.ingredientLines,
        instructions: [
          `For full instructions, please visit: ${edamamRecipe.url}`,
        ],
      };
      await docRef.set(normalizedRecipe);
      console.log(`Saved Edamam recipe ${recipeId} to cache!`);
      return res.json({ recipeId: recipeId, ...normalizedRecipe });
    } else if (source === "community") {
      console.log(`Fetching recipe ${recipeId} from Firestore...`);
      const docRef = db.collection("recipes").doc(recipeId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: "Community recipe not found" });
      }
      return res.json({ recipeId: docSnap.id, ...docSnap.data() });
    } else {
      return res.status(400).json({
        error:
          "Please provide a valid source (?source=edamam or ?source=community)",
      });
    }
  } catch (error) {
    console.error("Error in GET /api/recipes/:id", error);
    return res.status(500).json({ error: "Internal service error" });
  }
});

// MY ROUTE: Add ratings
router.post("/:id/rate", async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  try {
    const docRef = db.collection("recipes").doc(id);
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) throw new Error("Recipe not found!");
      const data = doc.data();
      const currentRatings = data.ratings || [];
      const newRatingCount = data.ratingCount + 1;
      const newRatings = [...currentRatings, rating];
      const sum = newRatings.reduce((a, b) => a + b, 0);
      const averageRating = (sum / newRatings.length).toFixed(1);
      transaction.update(docRef, {
        ratings: newRatings,
        averageRating: parseFloat(averageRating),
        ratingCount: newRatingCount,
      });
    });
    res.json({ message: "Rating saved and average calculated!" });
  } catch (error) {
    console.error("Failed to save rating:", error);
    res.status(500).json({ error: "Failed to save rating" });
  }
});

export default router;

// import express from "express";
// import { admin, db } from "../firebaseAdmin.js";

// const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const snapshot = await db
//       .collection("recipes")
//       .where("approved", "==", true)
//       .limit(6)
//       .get();

//     const communityRecipes = snapshot.docs.map((doc) => ({
//       recipeId: doc.id,
//       source: "community",
//       ...doc.data(),
//     }));

//     const edamamUrl = `https://api.edamam.com/api/recipes/v2?type=public&app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}&q=popular`;
//     try {
//         if (source === 'edamam') {
//             const docRef = db.collection('recipes').doc(recipeId);
            
//             // check if we already cached this recipe in Firestore
//             const cachedDoc = await docRef.get();
//             if (cachedDoc.exists) {
//                 console.log(`Serving Edamam recipe ${recipeId} from Firestore Cache!`);
//                 return res.json({ recipeId: cachedDoc.id, ...cachedDoc.data() });
//             }

//             console.log(`Cache miss. Fetching recipe ${recipeId} from Edamam API...`);
//             const url = `https://api.edamam.com/api/recipes/v2/${recipeId}?type=public&app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}`;

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
//         source: "edamam",
//         title: hit.recipe.label,
//         imageUrl: hit.recipe.image,
//         category: hit.recipe.dishType?.[0] || "Dinner",
//         description: `Source: ${hit.recipe.source}`,
//         ingredients: hit.recipe.ingredientLines,
//         instructions: [`For full instructions, visit: ${hit.recipe.url}`],
//         averageRating: null,
//       }));
//             if (!response.ok) {
//                 return res.status(response.status).json({
//                     error: "Failed to fetch from Edamam"
//                 });
//             }

//             const data = await response.json();
//             const edamamRecipe = data.recipe;

//             // translating Edamam schema into ours
//             const normalizedRecipe = {
//                 title: edamamRecipe.label,
//                 imageUrl: edamamRecipe.image,
//                 category: edamamRecipe.dishType ? edamamRecipe.dishType[0] : "Dinner", 
//                 description: `Source: ${edamamRecipe.source}`, 
//                 ingredients: edamamRecipe.ingredientLines,
//                 // Edamam returns a URL to the blog instead of full instructions
//                 instructions: [`For full instructions, please visit: ${edamamRecipe.url}`] 
//             };
//             await docRef.set(normalizedRecipe);
//             console.log(`Saved Edamam recipe ${recipeId} to cache!`);

//             return res.json({ recipeId: recipeId, ...normalizedRecipe });
//         } else if (source === 'community') {
//             console.log(`Fetching recipe ${recipeId} from Firestore...`);

//             const docRef = db.collection('recipes').doc(recipeId);
//             const docSnap = await docRef.get();

//             if (!docSnap.exists) {
//                 return res.status(404).json({
//                     error: "Community recipe not found"
//                 });
//             }

//             return res.json({ recipeId: docSnap.id, ...docSnap.data() });
//         } else {
//             return res.status(400).json({
//                 error: "Please provide a valid source (?source=edamam or ?source=community)"
//                 });
//             }
//     } catch (error) {
//         console.error("Error in GET /api/recipes/:id", error);
//         return res.status(500).json({
//             error: "Internal service error"
//         });
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
//         source: "edamam",
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

// router.get("/:id", async (req, res) => {
//   const recipeId = req.params.id;
//   const source = req.query.source;

//   try {
//     if (source === "edamam") {
//       console.log(`Fetching recipe ${recipeId} from Edamam...`);

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
//         category: edamamRecipe.dishType ? edamamRecipe.dishType[0] : "Dinner",
//         description: `Source: ${edamamRecipe.source}`,
//         ingredients: edamamRecipe.ingredientLines,
//         instructions: [
//           `For full instructions, please visit: ${edamamRecipe.url}`,
//         ],
//       };
//       return res.json(normalizedRecipe);
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
//           "Please provide a valid source (?source=edamam or ?source=community)",
//       });
//     }
//   } catch (error) {
//     console.error("Error in GET /api/recipes/:id", error);
//     return res.status(500).json({ error: "Internal service error" });
//   }
// });

// // Add ratings
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
