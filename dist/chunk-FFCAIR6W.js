import {
  OPENAI_API_KEY
} from "./chunk-PJ6TVNZO.js";

// src/db.ts
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
var embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });
var vectorStore = null;
async function initDB(docs) {
  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
}
async function retrieveFromDB(query, k = 4) {
  if (!vectorStore) throw new Error("DB not initialized");
  return await vectorStore.similaritySearch(query, k);
}
function getDB() {
  return vectorStore;
}

export {
  initDB,
  retrieveFromDB,
  getDB
};
//# sourceMappingURL=chunk-FFCAIR6W.js.map