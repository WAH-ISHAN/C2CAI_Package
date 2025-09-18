#!/usr/bin/env node
import { loadConfig, env } from "../dist/config.js";
import { crawlSite } from "../dist/crawler.js";
import { indexPages } from "../dist/indexer.js";
import { initDB } from "../dist/db.js";
import OpenAI from "openai";
import express from "express";
import { createC2CAIServer } from "../dist/server.js";

const cmd = process.argv[2];

if (cmd === "init") {
  console.log("Config already created by postinstall. Edit c2cai.config.json and .env.c2cai");
} else if (cmd === "crawl") {
  const cfg = loadConfig();
  const base = process.argv[3] || cfg.site.baseUrl;
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const db = initDB(cfg.dbPath);
  const pages = await crawlSite(base, cfg.site.maxPages, cfg.site.sameDomainOnly);
  await indexPages(db, client, pages, env.EMBED_MODEL);
  console.log(`Indexed ${pages.length} pages`);
} else if (cmd === "serve") {
  const app = express();
  app.use("/api/c2cai", createC2CAIServer());
  const port = process.env.PORT || 8787;
  app.listen(port, () => console.log(`C2CAI server on http://localhost:${port}/api/c2cai`));
} else {
  console.log("Usage: c2cai [init|crawl <url>|serve]");
}