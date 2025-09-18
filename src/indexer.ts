import OpenAI from "openai";
import type { PageRow } from "./db.js";
import { upsertPage } from "./db.js";
export { createC2CAIServer } from "./server.js";
export { C2CAIWidget } from "./client/widget.js";

export async function indexPages(
  client: OpenAI,
  pages: { url: string; title: string; text: string }[],
  embedModel: string
) {
  for (const p of pages) {
    const input = `${p.title}\n\n${p.text}`.slice(0, 8000);
    const emb = await client.embeddings.create({ model: embedModel, input });
    const vec = emb.data[0].embedding as number[];
    const row: PageRow = {
      url: p.url,
      title: p.title,
      content: p.text,
      embedding: vec,
    };
    await upsertPage(row); // ✅ only one arg now
    await new Promise((r) => setTimeout(r, 50));
  }
}