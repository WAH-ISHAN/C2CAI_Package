import {
  cosineSim,
  getAllPages
} from "./chunk-SAS7MPEH.js";

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

export {
  pickContext,
  answerWithRAG
};
