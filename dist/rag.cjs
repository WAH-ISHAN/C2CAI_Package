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

// src/rag.ts
var rag_exports = {};
__export(rag_exports, {
  answerWithRAG: () => answerWithRAG,
  pickContext: () => pickContext
});
module.exports = __toCommonJS(rag_exports);

// src/db.ts
var import_nedb_promises = __toESM(require("nedb-promises"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var dataDir = import_path.default.resolve(".c2cai");
import_fs.default.mkdirSync(dataDir, { recursive: true });
var pagesDB = import_nedb_promises.default.create({ filename: import_path.default.join(dataDir, "pages.db"), autoload: true });
var chatsDB = import_nedb_promises.default.create({ filename: import_path.default.join(dataDir, "chats.db"), autoload: true });
async function getAllPages() {
  return await pagesDB.find({});
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

// src/rag.ts
async function pickContext(queryVec, topK = 5) {
  const pages = await getAllPages();
  const scored = pages.map((p) => ({ p, s: cosineSim(queryVec, p.embedding) })).sort((a, b) => b.s - a.s).slice(0, topK);
  return scored.map((x) => x.p);
}
async function answerWithRAG(opts) {
  const { client, model, embedModel, question, pageHint } = opts;
  const qEmb = await client.embeddings.create({ model: embedModel, input: question });
  const contextPages = await pickContext(qEmb.data[0].embedding, 5);
  const ctx = contextPages.map(
    (p, i) => `# Source ${i + 1}: ${p.title}
URL: ${p.url}
${p.content.slice(0, 1200)}`
  ).join("\n\n");
  const pageCtx = pageHint?.text ? `Current Page: ${pageHint.title || ""} (${pageHint.url || ""})
${pageHint.text.slice(0, 1200)}` : "";
  const system = [
    "You are C2CAI, a helpful website assistant.",
    "Use the given sources to answer.",
    "If you don't know, say you don't know and suggest where to find it.",
    "Detect user's language and respond in that language (Sinhala/English/Tamil).",
    "Be concise, friendly, and cite sources by title/URL when helpful."
  ].join(" ");
  const messages = [
    { role: "system", content: system },
    { role: "user", content: `User question:
${question}

Context:
${ctx}

Page Context:
${pageCtx}` }
  ];
  const resp = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.3
  });
  const answer = resp.choices[0]?.message?.content || "Sorry, I couldn't generate an answer.";
  const sources = contextPages.slice(0, 3).map((p) => `${p.title} \u2014 ${p.url}`);
  return { answer, sources };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  answerWithRAG,
  pickContext
});
//# sourceMappingURL=rag.cjs.map