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

// src/server.ts
var server_exports = {};
__export(server_exports, {
  createC2CAIServer: () => createC2CAIServer
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_openai = __toESM(require("openai"), 1);

// src/config.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config({ path: ".env.c2cai" });
function loadConfig() {
  const p = import_path.default.resolve(process.cwd(), "c2cai.config.json");
  const cfg = JSON.parse(import_fs.default.readFileSync(p, "utf8"));
  return cfg;
}
var env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MODEL: process.env.C2CAI_MODEL || "gpt-4o-mini",
  EMBED_MODEL: process.env.C2CAI_EMBED_MODEL || "text-embedding-3-small"
};

// src/db.ts
var import_nedb_promises = __toESM(require("nedb-promises"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var dataDir = import_path2.default.resolve(".c2cai");
import_fs2.default.mkdirSync(dataDir, { recursive: true });
var pagesDB = import_nedb_promises.default.create({ filename: import_path2.default.join(dataDir, "pages.db"), autoload: true });
var chatsDB = import_nedb_promises.default.create({ filename: import_path2.default.join(dataDir, "chats.db"), autoload: true });
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

// src/rag.ts
async function pickContext(queryVec, topK = 5) {
  const pages = await getAllPages();
  const scored = pages.map((p) => ({ p, s: cosineSim(queryVec, p.embedding) })).sort((a, b) => b.s - a.s).slice(0, topK);
  return scored.map((x) => x.p);
}
async function answerWithRAG(opts) {
  var _a, _b;
  const { client, model, embedModel, question, pageHint } = opts;
  const qEmb = await client.embeddings.create({ model: embedModel, input: question });
  const contextPages = await pickContext(qEmb.data[0].embedding, 5);
  const ctx = contextPages.map(
    (p, i) => `# Source ${i + 1}: ${p.title}
URL: ${p.url}
${p.content.slice(0, 1200)}`
  ).join("\n\n");
  const pageCtx = (pageHint == null ? void 0 : pageHint.text) ? `Current Page: ${pageHint.title || ""} (${pageHint.url || ""})
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
  const answer = ((_b = (_a = resp.choices[0]) == null ? void 0 : _a.message) == null ? void 0 : _b.content) || "Sorry, I couldn't generate an answer.";
  const sources = contextPages.slice(0, 3).map((p) => `${p.title} \u2014 ${p.url}`);
  return { answer, sources };
}

// src/server.ts
var import_crypto = __toESM(require("crypto"), 1);
function createC2CAIServer() {
  const cfg = loadConfig();
  const client = new import_openai.default({ apiKey: env.OPENAI_API_KEY });
  const router = import_express.default.Router();
  router.use(import_express.default.json({ limit: "1mb" }));
  router.post("/chat", async (req, res) => {
    try {
      const { message, page, sessionId } = req.body;
      const out = await answerWithRAG({
        client,
        model: env.MODEL,
        embedModel: env.EMBED_MODEL,
        question: message,
        pageHint: page,
        allowLangs: cfg.allowLanguages
      });
      await logChat({
        id: sessionId || import_crypto.default.randomUUID(),
        ts: Date.now(),
        lang: "auto",
        user: message,
        assistant: out.answer,
        sources: out.sources
      });
      res.json(out);
    } catch (e) {
      res.status(500).json({ error: e.message || "server_error" });
    }
  });
  return router;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createC2CAIServer
});
