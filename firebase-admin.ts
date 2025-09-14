import { initializeApp, getApps, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { credential } from "firebase-admin";

// const serviceKey = require("@/service_key.json");

let app: App;

if (getApps().length === 0) {
  let serviceKey;

  if (process.env.FIREBASE_SERVICE_KEY) {
    // Production: use environment variable
    serviceKey = JSON.parse(process.env.FIREBASE_SERVICE_KEY);
  } else {
    // Development: use local file
    serviceKey = require("./service_key.json");
  }

  app = initializeApp({
    credential: credential.cert(serviceKey),
  });
} else {
  app = getApps()[0];
}

export const adminDb = getFirestore(app);
