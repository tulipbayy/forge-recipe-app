import express from 'express';
import { db, admin } from '../firebaseAdmin.js';
const router = express.Router();

// Route: POST /api/savedRecipes/:uid
router.post('/:uid', async (req, res) => {
    const { uid } = req.params;
    const { recipeId } = req.body;
    try {
        const userRef = db.collection('users').doc(uid);
        
        await userRef.set({
            savedRecipes: admin.firestore.FieldValue.arrayUnion(recipeId)
        }, { merge: true });
        res.json({ message: "Recipe saved successfully!" });
    } catch (error) {
        console.error("Error saving recipe:", error);
        res.status(500).json({ error: "Failed to save recipe" });
    }
});

export default router;