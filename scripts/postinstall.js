#!/usr/bin/env node
import fs from "fs";
import path from "path";
const root = process.env.INIT_CWD || process.cwd();

const envPath = path.join(root, ".env.c2cai");
const cfgPath = path.join(root, "c2cai.config.json");

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, "OPENAI_API_KEY=\nC2CAI_MODEL=gpt-4o-mini\nC2CAI_EMBED_MODEL=text-embedding-3-small\n", "utf8");
  console.log("Created .env.c2cai");
}

if (!fs.existsSync(cfgPath)) {
  fs.writeFileSync(cfgPath, JSON.stringify({
    site: { baseUrl: "https://your-portfolio.com", maxPages: 50, sameDomainOnly: true },
    dbPath: ".c2cai/data.sqlite",
    topK: 5,
    allowLanguages: ["si", "en", "ta"]
  }, null, 2), "utf8");
  console.log("Created c2cai.config.json");
}