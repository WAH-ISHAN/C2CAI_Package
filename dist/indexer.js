import {
  createC2CAIServer
} from "./chunk-3LMLW6DJ.js";
import "./chunk-LJXTQQMK.js";
import "./chunk-QEOBEW76.js";
import {
  upsertPage
} from "./chunk-SAS7MPEH.js";
import {
  C2CAIWidget
} from "./chunk-B7U3IVDM.js";

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
