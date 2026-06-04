import express from "express";
import { admin, db, auth } from "../firebaseAdmin.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use((req, res, next) => {
  if (!db) {
    return res.status(503).json({
      error:
        "Firebase Admin is not configured. Add backend/serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT in backend/.env.",
    });
  }

  next();
});

// Helper to fetch user doc
async function getUserDoc(userId) {
  const ref = db.collection("users").doc(userId);
  const snap = await ref.get();
  return snap.exists ? snap.data() : null;
}

async function requesterCanAccess(req, userId) {
  const requester = req.user.userId;
  if (requester === userId) return true;

  const requesterDoc = await getUserDoc(requester);
  return requesterDoc?.isAdmin === true;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

// GET /api/users/me - current user's profile
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const doc = await db.collection("users").doc(userId).get();
    if (!doc.exists) {
      // return minimal profile from token if no profile doc yet
      return res.json({ userId, email: req.user.email });
    }
    return res.json(doc.data());
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load profile" });
  }
});

// POST /api/users - create or update current user's profile (upsert)
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, profilePicture } = req.body || {};

    if (!username) {
      return res.status(400).json({ error: "username is required" });
    }

    const ref = db.collection("users").doc(userId);
    const now = new Date();
    await ref.set(
      {
        userId,
        username,
        email: req.user.email || null,
        profilePicture: profilePicture || null,
        isAdmin: false,
        createdAt: now,
      },
      { merge: true }
    );

    const doc = await ref.get();
    return res.status(201).json(doc.data());
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save profile" });
  }
});

// POST /api/users/saved - save a recipe for the current user
router.post("/saved", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipeId } = req.body || {};

    if (!recipeId) {
      return res.status(400).json({ error: "recipeId is required" });
    }

    const now = new Date();
    await db.collection("savedRecipes").doc(`${userId}_${recipeId}`).set(
      {
        userId,
        recipeId,
        savedAt: now,
      },
      { merge: true }
    );

    await db.collection("users").doc(userId).set(
      {
        userId,
        email: req.user.email || null,
        savedRecipes: admin.firestore.FieldValue.arrayUnion(recipeId),
        updatedAt: now,
      },
      { merge: true }
    );

    return res.status(201).json({ userId, recipeId, savedAt: now });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save recipe" });
  }
});

// DELETE /api/users/saved/:recipeId - remove a saved recipe for current user
router.delete("/saved/:recipeId", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipeId } = req.params;

    await db.collection("savedRecipes").doc(`${userId}_${recipeId}`).delete();
    await db.collection("users").doc(userId).set(
      {
        savedRecipes: admin.firestore.FieldValue.arrayRemove(recipeId),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return res.json({ userId, recipeId, removed: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to remove saved recipe" });
  }
});

// GET /api/users/:id/recipes - recipes created by a user
router.get("/:id/recipes", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await requesterCanAccess(req, id))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const snap = await db
      .collection("recipes")
      .where("authorId", "==", id)
      .orderBy("createdAt", "desc")
      .get();

    const recipes = snap.docs.map((doc) => ({ recipeId: doc.id, ...doc.data() }));
    return res.json(recipes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load created recipes" });
  }
});

// GET /api/users/:id/saved - recipes saved by a user
router.get("/:id/saved", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await requesterCanAccess(req, id))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const savedSnap = await db.collection("savedRecipes").where("userId", "==", id).get();
    const savedIds = savedSnap.docs.map((doc) => doc.data().recipeId).filter(Boolean);

    if (savedIds.length === 0) {
      const userDoc = await getUserDoc(id);
      savedIds.push(...(Array.isArray(userDoc?.savedRecipes) ? userDoc.savedRecipes : []));
    }

    if (savedIds.length === 0) return res.json([]);

    const recipeDocs = [];
    for (const chunk of chunkArray(savedIds, 10)) {
      const snap = await db
        .collection("recipes")
        .where(admin.firestore.FieldPath.documentId(), "in", chunk)
        .get();
      recipeDocs.push(...snap.docs);
    }

    const recipesById = new Map(
      recipeDocs.map((doc) => [doc.id, { recipeId: doc.id, ...doc.data() }])
    );

    const recipes = savedIds.map((recipeId) => recipesById.get(recipeId) || { recipeId });
    return res.json(recipes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load saved recipes" });
  }
});

// PUT /api/users/:id - update profile (self only or admin)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user.userId;

    // allow if self or admin
    const requesterDoc = await getUserDoc(requester);
    const isAdmin = requesterDoc?.isAdmin === true;
    if (requester !== id && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updates = {};
    const allowed = ["username", "profilePicture", "isAdmin"];
    for (const k of allowed) {
      if (k in req.body) updates[k] = req.body[k];
    }
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No valid fields to update" });

    updates.updatedAt = new Date();
    await db.collection("users").doc(id).set(updates, { merge: true });
    const doc = await db.collection("users").doc(id).get();
    return res.json(doc.data());
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// GET /api/users/:id - public profile (limited fields)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("users").doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });
    const data = doc.data();
    // only expose non-sensitive fields
    const publicData = {
      userId: data.userId,
      username: data.username,
      profilePicture: data.profilePicture || null,
      createdAt: data.createdAt || null,
    };
    return res.json(publicData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load user" });
  }
});

// GET /api/users - list users (admin only)
router.get("/", requireAuth, async (req, res) => {
  try {
    const requester = req.user.userId;
    const requesterDoc = await getUserDoc(requester);
    if (!requesterDoc?.isAdmin) return res.status(403).json({ error: "Forbidden" });

    const snap = await db.collection("users").orderBy("createdAt", "desc").limit(200).get();
    const users = snap.docs.map((d) => d.data());
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to list users" });
  }
});

// DELETE /api/users/:id - admin only (deletes user doc; optionally delete auth account)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user.userId;
    const requesterDoc = await getUserDoc(requester);
    if (!requesterDoc?.isAdmin) return res.status(403).json({ error: "Forbidden" });

    await db.collection("users").doc(id).delete();

    if (req.query.deleteAuth === "true") {
      try {
        await auth.deleteUser(id);
      } catch (e) {
        console.warn("Failed to delete auth user:", e.message);
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
