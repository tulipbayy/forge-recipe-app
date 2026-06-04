import express from 'express';
import { db } from '../firebaseAdmin.js';

const router = express.Router();

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

