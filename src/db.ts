// src/db.ts (Simple in-memory DB for vector store persistence – upgrade to SQLite/Pinecone for prod)
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { OPENAI_API_KEY } from './config.js';

const embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });

let vectorStore: MemoryVectorStore | null = null;

export async function initDB(docs: Document[]) {
  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
}

export async function retrieveFromDB(query: string, k: number = 4) {
  if (!vectorStore) throw new Error('DB not initialized');
  return await vectorStore.similaritySearch(query, k);
}

export function getDB() {
  return vectorStore;
}