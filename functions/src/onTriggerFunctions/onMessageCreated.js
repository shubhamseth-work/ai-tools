const admin = require('firebase-admin');
const {db} = require('../firebase');

import {
  onDocumentCreated,
} from "firebase-functions/v2/firestore";

exports.messagesCreated = onDocumentCreated('messages/{docId}', async (event) => {
  try {
    console.log('Received Firestore document creation event:', JSON.stringify(event, null, 2));

    // Extract document path from event.data.value.name
    // Example: projects/PROJECT_ID/databases/(default)/documents/messages/MESSAGE_ID
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }

    // Get the new document's data from the event payload
    const newDocData = snapshot.data();
    const documentId = snapshot.id;
    console.log(`Processing new message document: ${documentId}`);
    console.log('New document data:', newDocData);

  } catch (error) {
    console.error('Error processing Firestore document:', error);
    // Re-throw the error to indicate failure to Cloud Run
    throw new Error(`Failed to process document: ${error.message}`);
  }
});