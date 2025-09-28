// src/server.ts
import express from 'express';
import { indexSite } from './indexer.js';
import { generateResponse } from './rag.js';
import { config, PORT } from './config.js';
import cors from 'cors'; // npm i cors if needed

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // For widget JS

// Health check
app.get('/health', (req, res) => res.send('OK'));

// RAG endpoint for voice proxy
app.post('/chat', async (req, res) => {
  const { query, lang } = req.body;
  try {
    const response = await generateResponse(query, lang);
    res.json({ response });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Init on start
app.listen(PORT, async () => {
  await indexSite();
  console.log(`Server running on http://localhost:${PORT}`);
});