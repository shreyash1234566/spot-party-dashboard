const admin = require('firebase-admin');

// Removed service account credentials and related code as per user request

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
  });
  console.log('Firebase Admin SDK initialized successfully.');
}

module.exports = admin;