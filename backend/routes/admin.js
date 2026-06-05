import express from 'express';
import { db } from '../firebaseAdmin.js';
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

async function requireAdmin(req, res, next) {
    try {
        if (!db) {
            return res.status(503).json({
                error: "Firebase Admin is not configured. Add backend/serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT in backend/.env.",
            });
        }

        const userDoc = await db.collection("users").doc(req.user.userId).get();
        if (!userDoc.exists || userDoc.data().isAdmin !== true) {
            return res.status(403).json({ error: "Admin access required" });
        }

        next();
    } catch (err) {
        console.error("Admin authorization failed:", err);
        res.status(500).json({ error: "Failed to verify admin access" });
    }
}

router.use(requireAdmin);

// get all pending recipes 
router.get('/pending', async (req, res) => {
    try {
        const snapshot = await db.collection('recipes')
            .where('approved', '==', false)
            .where('source', '==', 'community')
            //.orderBy('createdAt', 'desc')
            .get();

        const recipes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(recipes);
    }   catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// approve 
router.patch('/:id/approve', async (req, res) => {
    try{
        await db.collection('recipes').doc(req.params.id).update({
            approved: true,
            rejected: false,
            updatedAt: new Date()
        });
        res.json({success: true});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

router.patch('/:id/reject', async(req, res) => {
    try {
        await db.collection('recipes').doc(req.params.id).update({
            approved: false,
            rejected: true,
            updatedAt: new Date()
        });
        res.json({success: true});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

export default router;
