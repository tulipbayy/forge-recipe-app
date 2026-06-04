import admin from "firebase-admin";
import { access, readFile } from "fs/promises";

async function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  const localKeyUrl = new URL("./serviceAccountKey.json", import.meta.url);

  try {
    await access(localKeyUrl);
    return JSON.parse(await readFile(localKeyUrl, "utf8"));
  } catch {
    return null;
  }
}

const serviceAccount = await loadServiceAccount();

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  console.warn(
    "Firebase Admin is not configured. Add backend/serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT in backend/.env for Firestore/Auth routes."
  );
}

export const firebaseAdminReady = Boolean(serviceAccount);
export const db = firebaseAdminReady ? admin.firestore() : null;
export const auth = firebaseAdminReady ? admin.auth() : null;
