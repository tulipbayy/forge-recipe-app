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
            return res.json(data.recipe);
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

export default router;