import {
  createC2CAIServer
} from "./chunk-PLJARXVO.js";
import "./chunk-BAHV6534.js";
import "./chunk-CWH5OPNT.js";
import {
  upsertPage
} from "./chunk-YGW57ZIY.js";
import {
  C2CAIWidget
} from "./chunk-JQR7JA5I.js";

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
export {
  C2CAIWidget,
  createC2CAIServer,
  indexPages
};
//# sourceMappingURL=indexer.js.map