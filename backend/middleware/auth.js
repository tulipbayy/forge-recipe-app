import { auth } from "../firebaseAdmin.js";

export async function requireAuth(req, res, next) {
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
    };

    next();
  } catch (err) {
    console.error("Auth verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
