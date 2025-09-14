import { initializeApp, getApps, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { credential } from "firebase-admin";

// const serviceKey = require("@/service_key.json");

let app: App;

if (getApps().length === 0) {
  // Use environment variable instead of JSON file
  const serviceKey = JSON.parse(process.env.FIREBASE_SERVICE_KEY || "{}");

  app = initializeApp({
    credential: credential.cert(serviceKey),
  });
} else {
  app = getApps()[0];
}

export const adminDb = getFirestore(app);
