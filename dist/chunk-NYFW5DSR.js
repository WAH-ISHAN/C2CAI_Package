import {
  crawlAndSplit
} from "./chunk-UTLNIB7F.js";
import {
  initDB
} from "./chunk-FFCAIR6W.js";
import {
  SITE_URL
} from "./chunk-PJ6TVNZO.js";

// src/indexer.ts
async function indexSite() {
  console.log(`Indexing ${SITE_URL}...`);
  const docs = await crawlAndSplit(SITE_URL);
  await initDB(docs);
  console.log("Indexing complete!");
}

export {
  indexSite
};
//# sourceMappingURL=chunk-NYFW5DSR.js.map