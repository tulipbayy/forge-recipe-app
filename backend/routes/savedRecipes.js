import express from 'express';
import { db, admin } from '../firebaseAdmin.js';
const router = express.Router();

// Route: POST /api/savedRecipes/:uid
router.post('/:uid', async (req, res) => {
    const { uid } = req.params;
    const { recipeId } = req.body;
    try {
        if (!db) {
            return res.status(503).json({
                error: "Firebase Admin is not configured. Add backend/serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT in backend/.env."
            });
        }

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
