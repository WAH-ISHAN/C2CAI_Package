import OpenAI from "openai";
import { cosineSim, getAllPages } from "./db.js";

export async function pickContext(queryVec: number[], topK = 5) {
  const pages = await getAllPages();
  const scored = pages
    .map((p) => ({ p, s: cosineSim(queryVec, p.embedding) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, topK);
  return scored.map((x) => x.p);
}

export async function answerWithRAG(opts: {
  client: OpenAI;
  model: string;
  embedModel: string;
  question: string;
  pageHint?: { url?: string; title?: string; text?: string };
  allowLangs?: string[];
}) {
  const { client, model, embedModel, question, pageHint } = opts;

  // create embedding for question
  const qEmb = await client.embeddings.create({ model: embedModel, input: question });

  // use top‑5 context
  const contextPages = await pickContext(qEmb.data[0].embedding as number[], 5);

  // build context string
  const ctx = contextPages
    .map(
      (p, i) =>
        `# Source ${i + 1}: ${p.title}\nURL: ${p.url}\n${p.content.slice(0, 1200)}`
    )
    .join("\n\n");

  const pageCtx = pageHint?.text
    ? `Current Page: ${pageHint.title || ""} (${pageHint.url || ""})\n${pageHint.text.slice(0, 1200)}`
    : "";

  const system = [
    "You are C2CAI, a helpful website assistant.",
    "Use the given sources to answer.",
    "If you don't know, say you don't know and suggest where to find it.",
    "Detect user's language and respond in that language (Sinhala/English/Tamil).",
    "Be concise, friendly, and cite sources by title/URL when helpful.",
  ].join(" ");

  const messages: any[] = [
    { role: "system", content: system },
    { role: "user", content: `User question:\n${question}\n\nContext:\n${ctx}\n\nPage Context:\n${pageCtx}` },
  ];

  const resp = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.3,
  });

  const answer =
    resp.choices[0]?.message?.content ||
    "Sorry, I couldn't generate an answer.";

  const sources = contextPages
    .slice(0, 3)
    .map((p) => `${p.title} — ${p.url}`);

  return { answer, sources };
}