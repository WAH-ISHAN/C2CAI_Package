// src/config.ts
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.c2cai' });

const configPath = path.join(process.cwd(), 'c2cai.config.json');
const defaultConfig = {
  openai: { model: 'gpt-4o-mini', temperature: 0 },
  crawler: { chunkSize: 2000, chunkOverlap: 300, maxPages: 10 },
  voice: { defaultLang: 'si-LK', languages: ['si-LK', 'en-US', 'ta-IN'] },
  sales: { enableLeadCapture: true, recommendPrompt: 'Recommend products/services if relevant.' },
  promptTemplate: 'Context: {context}\nQuestion: {question}\nSales Tip: {salesTip}\nAnswer in detail:'
};

export let config = defaultConfig;

if (fs.existsSync(configPath)) {
  const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  config = { ...defaultConfig, ...userConfig };
}

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const PORT = parseInt(process.env.PORT || '3000');
export const SITE_URL = process.env.SITE_URL || 'https://example.com';