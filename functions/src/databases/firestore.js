const admin = require('firebase-admin');
 
let db;
 
function initFirestore() {
  if (!admin.apps.length) {
    // In CI/CD: service account JSON is injected as env variable
    // Locally: reads from JSON file
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      : require(`../../${process.env.NODE_ENV}-service-account.json`);
 
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: api-surface[process.env.FIREBASE_PROJECT_ID],
    });
  }
  db = admin.firestore();
  return db;
}
 
function getDb() {
  if (!db) return initFirestore();
  return db;
}
 
module.exports = { getDb, initFirestore };

