// src/indexer.ts
import { crawlAndSplit } from './crawler.js';
import { initDB } from './db.js';
import { SITE_URL } from './config.js';

export async function indexSite() {
  console.log(`Indexing ${SITE_URL}...`);
  const docs = await crawlAndSplit(SITE_URL);
  await initDB(docs);
  console.log('Indexing complete!');
}