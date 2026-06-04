import express from "express";
import { db, auth } from "../firebaseAdmin.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Helper to fetch user doc
async function getUserDoc(userId) {
  const ref = db.collection("users").doc(userId);
  const snap = await ref.get();
  return snap.exists ? snap.data() : null;
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
