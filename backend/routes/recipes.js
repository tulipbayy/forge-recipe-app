import express from 'express';
import { db } from '../firebaseAdmin.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    const recipeId = req.params.id;
    const source = req.query.source;

    try {
        if (source === 'edamam') {
            console.log(`Fetching recipe ${recipeId} from Edamam...`);

            const url = `https://api.edamam.com/api/recipes/v2/${recipeId}?type=public&app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}`;

            const response = await fetch(url, {
                headers: {
                    'Edamam-Account-User': process.env.EDAMAM_ACCOUNT_USER
                }
            });

            if (!response.ok) {
                return res.status(response.status).json({
                    error: "Failed to fetch from Edamam"
                });
            }

            const data = await response.json();
            const edamamRecipe = data.recipe;

            // translating Edamam schema into ours
            const normalizedRecipe = {
                title: edamamRecipe.label,
                imageUrl: edamamRecipe.image,
                category: edamamRecipe.dishType ? edamamRecipe.dishType[0] : "Dinner", 
                description: `Source: ${edamamRecipe.source}`, 
                ingredients: edamamRecipe.ingredientLines,
                // Edamam returns a URL to the blog instead of full instructions
                instructions: [`For full instructions, please visit: ${edamamRecipe.url}`] 
            };
            return res.json(normalizedRecipe);
        } else if (source === 'community') {
            if (!db) {
                return res.status(503).json({
                    error: "Firebase Admin is not configured. Add backend/serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT in backend/.env."
                });
            }

            console.log(`Fetching recipe ${recipeId} from Firestore...`);

            const docRef = db.collection('recipes').doc(recipeId);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return res.status(404).json({
                    error: "Community recipe not found"
                });
            }

            return res.json({ recipeId: docSnap.id, ...docSnap.data() });
        } else {
            return res.status(400).json({
                error: "Please provide a valid source (?source=edamam or ?source=community)"
                });
            }
    } catch (error) {
        console.error("Error in GET /api/recipes/:id", error);
        return res.status(500).json({
            error: "Internal service error"
        });
    }
});

export default router;
