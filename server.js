import dotenv from 'dotenv';
dotenv.config();
// import 'newrelic';
import express from 'express';
import axios from 'axios';
import cors from 'cors';

 // Ensure you have newrelic installed and configured
const app = express();
import { getWeatherByCity } from './functions/src/weather/weatherService.js';
import { processDocumentFromGCS, processDocumentFromLocal } from './functions/src/gcp/document-ai/imagesExtract.js';
import { sendPromtOutput } from './functions/src/gcp/gen-ai/generativeApi.js';
import { sendOpenAiPrompt } from './functions/src/langchain/openAiApi.js';
import { queryApi } from './functions/src/mcp/firestoreQueryApi.js';
import { slotGame } from './functions/src/games/slotMachine.js';
import {reviewCode} from './functions/src/openai/review.js';
import { sendMsgAlerts } from './functions/src/gcp/pubsub/sendMsgAlerts.js';
import { downloadPdfFromUrl } from './functions/src/scripts/downloadPdfByUrl.js';
import { extractRecrodFromDocument } from './functions/src/scripts/extractDataFromPdf.js';
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

app.get('/',async (req,res)=>{

    const response = await axios.get('https://jsonplaceholder.typicode.com/users');
    const users= response.data;
    let html = `<h1>User List</h1><ul>`;
    users.forEach(user => {
      html += `<li><strong>${user.name}</strong> - ${user.email}</li>`;
    });
    html += `</ul>`;
    res.send(html);
}) 

app.get('/images-scan',async (req,res)=>{
    try {
        console.log('🖼️ Processing document from GCS...');
        const extracted = await processDocumentFromGCS();
        console.log('Data extracted');
        return res.status(200).json({ data: extracted });
    } catch (error) {
        console.error('❌ Error processing document:', error.message);  
        return res.status(500).json({ error: 'Failed to process document' });
    }
}) 

app.get('/weather', async (req, res) => {
  console.log(req.query, req. rams, req.body)
    const { city } = req.query;

    try {
        const weatherData = await getWeatherByCity(city);
        console.log('Home page hit');
        res.json(weatherData);
        res.json(false)
    } catch (error) {
        res.status(500).json({ error: error.message || 'Could not fetch weather data' });
    }
});


app.post('/api/gen-ai', async (req, res) => {
    let { prompt } = req.body;
    console.log('Received prompt:',  prompt);
    await sendPromtOutput(prompt)
      .then(response => {
        res.json({ response });
      })
      .catch(error => {
        console.error('Error sending prompt:', error);
        res.status(500).json({ error: 'Failed to process prompt' });
      });
   

});


app.post('/api/open-ai', async (req, res) => {
    let { prompt } = req.body;
    console.log('Received open ai prompt:',  prompt);
    await sendOpenAiPrompt(prompt)
      .then(response => {
        res.json({ response });
      })
      .catch(error => {
        console.error('Error sending prompt:', error);
        res.status(500).json({ error: 'Failed to process prompt' });
      });
});

app.get('/api/firestore-query-ai', async (req, res) => {
    let { prompt } = req.body;
    console.log('Received firestore query',  prompt);
    await queryApi(prompt)
      .then(response => {
        res.json({ response });
      })
      .catch(error => {
        console.error('Error sending prompt:', error);
        res.status(500).json({ error: 'Failed to process prompt' });
      });
});


app.get('/api/slot-machine', async (req, res) => {
    const { result, message } = await slotGame(); 
    console.log('Slot machine result:', result, 'Message:', message);
    res.json({ result, message });
}); 


app.get('/api/review-code', async (req, res) => {
    const result = await reviewCode(); 
    console.log('Review code:', result);
    res.json({ result });
}); 

app.get('/send-message-alerts',async (req,res)=>{
  console.log('Sending Alerts message...');
  try {
    const messageId = await sendMsgAlerts(req, res);
    console.log('Published MessageId', messageId);
    return res.status(200).json({ messageId: messageId });
  } catch (error) {
    console.error('Error in sendMsgAlerts call:', error);
    return res.status(400).json({ error: error.message || 'Error sending message alert' });
  }
})


app.get('/download-pdf',async (req,res)=>{
  console.log('Downloading pdf from url dynamic...');
  try {
    const downloadFolder = await downloadPdfFromUrl(req, res);
    console.log('Downloaded pdfs', downloadFolder);
    return res.status(200).json({ downloadFolder: downloadFolder });
  } catch (error) {
    console.error('Error in downloading pdf:', error);
    return res.status(400).json({ error: error.message || 'Error in downloading pdf'});
  }
})

app.get('/extract-pdf',async (req,res)=>{
  console.log('Extracting from pdf...');
  try {
    const result = await extractRecrodFromDocument(req, res);
    console.log('Extracting pdfs', result);
    return res.status(200).json({ result: result });
  } catch (error) {
    console.error('Error in Error in extracting pdf:', error);
    return res.status(400).json({ error: error.message || 'Error in extracting pdf'});
  }
})

function listRoutes(app) {
    console.log("📌 Registered Routes:");
    app._router.stack
        .filter(r => r.route)
        .forEach(r => {
            const route = r.route;
            const method = Object.keys(route.methods)[0].toUpperCase();
            console.log(`${method}  http://localhost:${PORT}${route.path}`);
        });
}
listRoutes(app);

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})