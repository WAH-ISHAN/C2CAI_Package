// src/db.ts
import Datastore from "nedb-promises";
import fs from "fs";
import path from "path";
var dataDir = path.resolve(".c2cai");
fs.mkdirSync(dataDir, { recursive: true });
var pagesDB = Datastore.create({ filename: path.join(dataDir, "pages.db"), autoload: true });
var chatsDB = Datastore.create({ filename: path.join(dataDir, "chats.db"), autoload: true });
async function upsertPage(p) {
  await pagesDB.update({ url: p.url }, p, { upsert: true });
}
async function getAllPages() {
  return await pagesDB.find({});
}
async function logChat(rec) {
  await chatsDB.insert(rec);
}
function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

export {
  upsertPage,
  getAllPages,
  logChat,
  cosineSim
};
//# sourceMappingURL=chunk-YGW57ZIY.js.map