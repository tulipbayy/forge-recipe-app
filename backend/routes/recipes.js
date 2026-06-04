import express from 'express';
import { admin, db } from '../firebaseAdmin.js';

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

// Add ratings
router.post('/:id/rate', async (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;
    try {
        const docRef = db.collection('recipes').doc(id);
        
         await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) throw new Error("Recipe not found!");
            const data = doc.data();
            const currentRatings = data.ratings || [];
            const newRatingCount = data.ratingCount + 1;
            
            // Add the new rating to the list
            const newRatings = [...currentRatings, rating];
            
            // Calculate the math average
            const sum = newRatings.reduce((a, b) => a + b, 0);
            const averageRating = (sum / newRatings.length).toFixed(1);

            // Save both the new array AND the new average back to Firestore
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