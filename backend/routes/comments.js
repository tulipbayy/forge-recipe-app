import express from "express";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../firebaseAdmin.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/recipes/:recipeId/comments", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const snapshot = await db
      .collection("comments")
      .where("recipeId", "==", recipeId)
      .orderBy("createdAt", "desc")
      .get();

    const comments = snapshot.docs.map((doc) => ({
      commentId: doc.id,
      ...doc.data(),
    }));

    res.json(comments);
  } catch (err) {
    console.error("GET comments failed:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.post("/recipes/:recipeId/comments", requireAuth, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { text, parentCommentId = null } = req.body;
    const userId = req.user.userId;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    // Recipe must exist
    const recipeDoc = await db.collection("recipes").doc(recipeId).get();
    if (!recipeDoc.exists) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const { username = "", profilePicture = "" } = userDoc.data();

    if (parentCommentId) {
      const parentDoc = await db
        .collection("comments")
        .doc(parentCommentId)
        .get();
      if (!parentDoc.exists || parentDoc.data().recipeId !== recipeId) {
        return res.status(400).json({ error: "Invalid parent comment" });
      }
    }

    const ref = await db.collection("comments").add({
      recipeId,
      userId,
      username,
      profilePicture,
      text: text.trim(),
      upvotes: 0,
      parentCommentId,
      createdAt: FieldValue.serverTimestamp(),
    });

    const created = await ref.get();
    res.status(201).json({ commentId: created.id, ...created.data() });
  } catch (err) {
    console.error("POST comment failed:", err);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

router.delete("/comments/:commentId", requireAuth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const commentRef = db.collection("comments").doc(commentId);
    const commentSnap = await commentRef.get();
    if (!commentSnap.exists) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const comment = commentSnap.data();
    const userSnap = await db.collection("users").doc(userId).get();
    const isAdmin = userSnap.exists && userSnap.data().isAdmin === true;

    if (comment.userId !== userId && !isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await commentRef.delete();
    res.status(204).send();
  } catch (err) {
    console.error("DELETE comment failed:", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

router.post("/comments/:commentId/upvote", requireAuth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const commentRef = db.collection("comments").doc(commentId);
    const upvoteRef = commentRef.collection("upvotes").doc(userId);

    let upvoted;
    await db.runTransaction(async (tx) => {
      const upvoteSnap = await tx.get(upvoteRef);
      if (upvoteSnap.exists) {
        tx.delete(upvoteRef);
        tx.update(commentRef, { upvotes: FieldValue.increment(-1) });
        upvoted = false;
      } else {
        tx.set(upvoteRef, { createdAt: FieldValue.serverTimestamp() });
        tx.update(commentRef, { upvotes: FieldValue.increment(1) });
        upvoted = true;
      }
    });

    const updated = await commentRef.get();
    res.json({ commentId, upvotes: updated.data().upvotes, upvoted });
  } catch (err) {
    console.error("Upvote failed:", err);
    res.status(500).json({ error: "Failed to toggle upvote" });
  }
});

export default router;
