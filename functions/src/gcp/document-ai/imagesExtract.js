import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const json = {
  "type": process.env.type,
  "project_id": process.env.project_id,
  "private_key_id": process.env.private_key_id,
  "private_key": process.env.private_key,
  "client_email": process.env.client_email,
  "client_id": process.env.client_id,
  "auth_uri": process.env.auth_uri,
  "token_uri": process.env.token_uri,
  "auth_provider_x509_cert_url": process,
  "client_x509_cert_url": process.env.client_x509_cert_url,
  "universe_domain": process.env.universe_domain
}
const keyPath = path.join(__dirname, '..', '..', 'sa', 'sa-keys.json');
import {
    BUCKET_NAME,
    FILENAME,
    PROJECT_ID,
    LOCATION,
    PROCESSOR_ID,
    MIME_TYPE_JPEG,
} from '../../util/constant.js';
import { v4 as uuidv4 } from 'uuid';

const docAIClient = new DocumentProcessorServiceClient()
const storage = new Storage();

process.env.GOOGLE_APPLICATION_CREDENTIALS = json;



async function processDocumentFromLocal() {
  const name = `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`;
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, FILENAME);
  await storage.bucket(BUCKET_NAME).file(FILENAME).download({ destination: tempFilePath });
  console.log(`✅ Downloaded: ${FILENAME} → ${tempFilePath}`);

  // const filePath = path.join(__dirname, '..', 'document-ai','images', 'Invoice_A0001.jpg');
  const fileBuffer = fs.readFileSync(tempFilePath);
  const request = {
    name,
    rawDocument: {
      content: fileBuffer,
      mimeType: 'image/jpeg',
    },
  };

  try {
    const [result] = await docAIClient.processDocument(request);
    const { document } = result;
    console.log('📄 Extracted Document JSON:\n', document);
    return document;
  } catch (err) {
    console.error('Document AI:', err);
  }
}


// 📄 Function to process document from GCS
async function processDocumentFromGCS() {
  try {
    
    const name = `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`;
    const gcsInputUri = `gs://${BUCKET_NAME}/${FILENAME}`;
    let uniqueId = uuidv4();
    // uniqueId = 'a0392a00-79e0-45af-9f78-204a78c34aae';
    const outputPrefix = `output/${uniqueId}/`;
    const gcsOutputUri  = `gs://${BUCKET_NAME}/${outputPrefix}`;

    const request = {
      name,
      inputDocuments: {
        gcsDocuments: {
          documents: [
            {
              gcsUri: gcsInputUri,
              mimeType: 'image/jpeg', // or 'application/pdf' for PDFs
            },
          ],
        },
      },
      documentOutputConfig: {
        gcsOutputConfig: {
          gcsUri: gcsOutputUri, // output folder
        },
      },
    };

    const [result] = await docAIClient.batchProcessDocuments(request);
    console.log('Waiting for operation to complete...');
    await result.promise();
    console.log('Operation completed successfully', gcsOutputUri);
    // Read output JSON
    try {
      const [files] = await storage.bucket(BUCKET_NAME).getFiles({ prefix: outputPrefix });
      const jsonFiles = files
        .map(file => file.name)
        .filter(name => path.extname(name).toLowerCase() === '.json');
      console.log('Extracted Fields:', jsonFiles);
      if (jsonFiles.length === 0) {
        console.log('No JSON files found.');
        return;
      }
      const filepath = jsonFiles[0]; 
      const file = await storage.bucket(BUCKET_NAME).file(filepath);
      const [contents] = await file.download();
      const jsonOutput = JSON.parse(contents.toString('utf8'));
      console.log(jsonOutput.entities);

      if (jsonOutput.entities && jsonOutput.entities.length > 0) {
          const formatOutput = jsonOutput.entities.reduce((acc, item) => {
          acc[item.type] = item.mentionText;
          return acc;
        }, {});  
        console.log('Extracted Fields:', formatOutput);
        return formatOutput;
      } else {
        console.log('No fields extracted.');
        return { message: 'No fields extracted'};
      }
    } catch (error) {
      console.error('❌ Error reading output JSON:', error);
      throw error;
    }
  } catch (error) {
    console.error('❌ Error processing document from GCS:', error);
    throw error;
  }
}

async function createDataset(projectId, location, displayName) {
  const parent = `projects/${projectId}/locations/${location}`;
  const request = {
    parent,
    dataset: { displayName }
  };

  const [operation] = await client.createDataset(request);
  const [response] = await operation.promise();
  return response.name; // datasetId
}

async function importDocumentToDataset(datasetId, gcsUri) {
  const request = {
    name: datasetId,
    importConfig: {
      gcsSource: {
        uris: [gcsUri]
      },
      importSchemaUri: 'gs://google-cloud-aiplatform/schema/dataset/schema-documentai-v1beta3.yaml'
    }
  };

  const [operation] = await client.importDocuments(request);
  await operation.promise();
}


async function readOutputJson() {
  const outputPrefix = 'output/';
  const outputFiles = await storage.bucket(BUCKET_NAME).getFiles({ prefix: outputPrefix });

  const jsonFiles = outputFiles[0].filter(file => file.name.endsWith('.json'));

  if (jsonFiles.length === 0) {
    console.log('No JSON output found.');
    return;
  }

  const file = jsonFiles[0]; // take the first JSON output
  const [contents] = await file.download();
  const extractedData = JSON.parse(contents);
  console.log('Extracted Fields', extractedData.entities);
  const outputObject = extractedData.entities.reduce((acc, item) => {
    acc[item.type] = item.mentionText;
    return acc;
  }, {});
  return outputObject;
}



export {processDocumentFromGCS, processDocumentFromLocal};