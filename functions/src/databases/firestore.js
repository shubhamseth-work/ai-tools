const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp(); // Uses default service account in Cloud Functions
}

const db = admin.firestore();

if (process.env.FUNCTIONS_EMULATOR === 'true') {
  firestore.settings({
    host: 'localhost:8080',
    ssl: false
  });
}

module.exports = { admin, db };