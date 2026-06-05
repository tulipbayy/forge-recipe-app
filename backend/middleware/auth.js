import { auth } from "../firebaseAdmin.js";

export async function requireAuth(req, res, next) {
  if (!auth) {
    return res.status(503).json({
      error:
        "Firebase Admin is not configured. Add backend/serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT in backend/.env.",
    });
  }

  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
    }

    const idToken = header.substring(7); // strip "Bearer "
    const decoded = await auth.verifyIdToken(idToken);

    req.user = {
      userId: decoded.uid, // matches users.userId in schema
      email: decoded.email,
      username: decoded.name || decoded.email?.split("@")[0] || "User",
      profilePicture: decoded.picture || "",
    };

    next();
  } catch (err) {
    console.error("Auth verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
