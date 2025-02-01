import * as admin from "firebase-admin";
import path from "path";

// Path to your Firebase service account JSON file
const serviceAccount = path.resolve(__dirname, "../firebase.json");

try {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccount)),
    databaseURL: "https://pledgex-68789.firebaseio.com", // Replace with your Firebase database URL
  });
  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
}

export default admin;
