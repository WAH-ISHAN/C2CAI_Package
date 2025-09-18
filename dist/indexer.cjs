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

// src/indexer.ts
var indexer_exports = {};
__export(indexer_exports, {
  C2CAIWidget: () => C2CAIWidget,
  createC2CAIServer: () => createC2CAIServer,
  indexPages: () => indexPages
});
module.exports = __toCommonJS(indexer_exports);

// src/db.ts
var import_nedb_promises = __toESM(require("nedb-promises"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var dataDir = import_path.default.resolve(".c2cai");
import_fs.default.mkdirSync(dataDir, { recursive: true });
var pagesDB = import_nedb_promises.default.create({ filename: import_path.default.join(dataDir, "pages.db"), autoload: true });
var chatsDB = import_nedb_promises.default.create({ filename: import_path.default.join(dataDir, "chats.db"), autoload: true });
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

// src/server.ts
var import_express = __toESM(require("express"), 1);
var import_openai = __toESM(require("openai"), 1);

// src/config.ts
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config({ path: ".env.c2cai" });
function loadConfig() {
  const p = import_path2.default.resolve(process.cwd(), "c2cai.config.json");
  const cfg = JSON.parse(import_fs2.default.readFileSync(p, "utf8"));
  return cfg;
}
var env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MODEL: process.env.C2CAI_MODEL || "gpt-4o-mini",
  EMBED_MODEL: process.env.C2CAI_EMBED_MODEL || "text-embedding-3-small"
};

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

// src/client/widget.ts
function C2CAIWidget(opts) {
  const state = { open: false, sessionId: crypto.randomUUID() };
  const btn = document.createElement("button");
  btn.textContent = "\u{1F4AC} Chat";
  Object.assign(btn.style, { position: "fixed", bottom: "20px", right: "20px", zIndex: "9999", padding: "10px 14px", borderRadius: "999px", background: "#111", color: "#fff" });
  document.body.appendChild(btn);
  const panel = document.createElement("div");
  panel.innerHTML = `<div style="width:320px;height:420px;background:#fff;position:fixed;bottom:70px;right:20px;border:1px solid #ddd;border-radius:12px;display:none;flex-direction:column;overflow:hidden;font-family:system-ui">
    <div style="padding:10px;border-bottom:1px solid #eee;font-weight:600">C2CAI Assistant</div>
    <div id="c2cai-log" style="flex:1;padding:10px;overflow:auto;font-size:14px"></div>
    <div style="display:flex;border-top:1px solid #eee">
      <input id="c2cai-in" style="flex:1;padding:10px;border:0;outline:none" placeholder="Ask me anything..." />
      <button id="c2cai-send" style="padding:10px 12px;border:0;background:#111;color:#fff">Send</button>
    </div>
  </div>`;
  Object.assign(panel.style, { zIndex: "9999" });
  document.body.appendChild(panel);
  const box = panel.firstElementChild;
  const log = panel.querySelector("#c2cai-log");
  const input = panel.querySelector("#c2cai-in");
  const send = panel.querySelector("#c2cai-send");
  function pageContext() {
    const main = document.querySelector("main") || document.body;
    const txt = ((main == null ? void 0 : main.textContent) || "").replace(/\s+/g, " ").trim().slice(0, 4e3);
    return { url: location.href, title: document.title, text: txt };
  }
  function add(role, text) {
    const div = document.createElement("div");
    div.style.margin = "6px 0";
    div.innerHTML = `<div style="font-weight:600">${role}</div><div>${text}</div>`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }
  btn.onclick = () => {
    state.open = !state.open;
    box.style.display = state.open ? "flex" : "none";
  };
  send.onclick = async () => {
    const msg = input.value.trim();
    if (!msg) return;
    add("You", msg);
    input.value = "";
    const res = await fetch(opts.endpoint + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, page: pageContext(), sessionId: state.sessionId })
    }).then((r) => r.json());
    add("C2CAI", `${res.answer}

Sources:
${(res.sources || []).join("\n")}`);
  };
  ["popstate", "hashchange"].forEach((ev) => window.addEventListener(ev, () => {
  }));
}

// src/indexer.ts
async function indexPages(client, pages, embedModel) {
  for (const p of pages) {
    const input = `${p.title}

${p.text}`.slice(0, 8e3);
    const emb = await client.embeddings.create({ model: embedModel, input });
    const vec = emb.data[0].embedding;
    const row = {
      url: p.url,
      title: p.title,
      content: p.text,
      embedding: vec
    };
    await upsertPage(row);
    await new Promise((r) => setTimeout(r, 50));
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  C2CAIWidget,
  createC2CAIServer,
  indexPages
});
