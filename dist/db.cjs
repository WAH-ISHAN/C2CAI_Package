"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/db.ts
var db_exports = {};
__export(db_exports, {
  getDB: () => getDB,
  initDB: () => initDB,
  retrieveFromDB: () => retrieveFromDB
});
module.exports = __toCommonJS(db_exports);
var import_memory = require("langchain/vectorstores/memory");
var import_openai = require("@langchain/openai");

// src/config.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenv.default.config({ path: ".env.c2cai" });
var configPath = import_path.default.join(process.cwd(), "c2cai.config.json");
var defaultConfig = {
  openai: { model: "gpt-4o-mini", temperature: 0 },
  crawler: { chunkSize: 2e3, chunkOverlap: 300, maxPages: 10 },
  voice: { defaultLang: "si-LK", languages: ["si-LK", "en-US", "ta-IN"] },
  sales: { enableLeadCapture: true, recommendPrompt: "Recommend products/services if relevant." },
  promptTemplate: "Context: {context}\nQuestion: {question}\nSales Tip: {salesTip}\nAnswer in detail:"
};
var config = defaultConfig;
if (import_fs.default.existsSync(configPath)) {
  const userConfig = JSON.parse(import_fs.default.readFileSync(configPath, "utf8"));
  config = { ...defaultConfig, ...userConfig };
}
var OPENAI_API_KEY = process.env.OPENAI_API_KEY;
var PORT = parseInt(process.env.PORT || "3000");
var SITE_URL = process.env.SITE_URL || "https://example.com";

// src/db.ts
var embeddings = new import_openai.OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });
var vectorStore = null;
async function initDB(docs) {
  vectorStore = await import_memory.MemoryVectorStore.fromDocuments(docs, embeddings);
}
async function retrieveFromDB(query, k = 4) {
  if (!vectorStore) throw new Error("DB not initialized");
  return await vectorStore.similaritySearch(query, k);
}
function getDB() {
  return vectorStore;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getDB,
  initDB,
  retrieveFromDB
});
//# sourceMappingURL=db.cjs.map