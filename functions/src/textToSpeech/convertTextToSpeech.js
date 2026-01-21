import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputAudioFolder = path.join(__dirname, "audioOutputs");

import express from "express";
import gTTS from "node-gtts";

const ttsRouter = express.Router();
const gtts = gTTS("en");

ttsRouter.get("/tts", (req, res) => {
  try {
    const text = req.query.text || req?.body?.text || "Madam / Sir, The Result of the Treasury bills auction for 91 Days, 182 Days and 364 Days tenor conducted today is as underThe Treasury Bills Auction is announced on Friday of every week. The same will be available for bidding from Friday 18:30 hrs to Wednesday 08:00 hrs.";
    if (!text) {
      return res.status(400).json({ message: "Query param 'text' is required" });
    }
    // Set audio headers
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": "inline; filename=tts.mp3",
      "Cache-Control": "no-cache",
    });
    gtts.stream(text).pipe(res);
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ message: "Text to speech failed" });
  }
});


export default ttsRouter;