import dotenv from "dotenv";
import admin from "firebase-admin";
import path from "path";

// Carrega o arquivo de credenciais
dotenv.config();

const firebaseKeyPath = process.env.FIREBASE_KEY_PATH as string;
const serviceAccount = require(path.resolve(__dirname, firebaseKeyPath));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
