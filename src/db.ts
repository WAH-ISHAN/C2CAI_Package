import Datastore from "nedb-promises";
import fs from "fs";
import path from "path";

const dataDir = path.resolve(".c2cai");
fs.mkdirSync(dataDir, { recursive: true });

const pagesDB = Datastore.create({ filename: path.join(dataDir, "pages.db"), autoload: true });
const chatsDB = Datastore.create({ filename: path.join(dataDir, "chats.db"), autoload: true });

export type PageRow = {
  url: string;
  title: string;
  content: string;
  embedding: number[];
};

export async function upsertPage(p: PageRow) {
  await pagesDB.update({ url: p.url }, p, { upsert: true });
}

export async function getAllPages(): Promise<PageRow[]> {
  return await pagesDB.find({});
}

export async function logChat(rec: {
  id: string;
  ts: number;
  lang: string;
  user: string;
  assistant: string;
  sources: string[];
}) {
  await chatsDB.insert(rec);
}

// Dummy cosine similarity – same as before
export function cosineSim(a: number[], b: number[]) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i],
      y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}