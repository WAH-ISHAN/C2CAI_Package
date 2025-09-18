import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: ".env.c2cai" });

export type C2CConfig = {
  site: { baseUrl: string; maxPages: number; sameDomainOnly: boolean };
  dbPath: string;
  topK: number;
  allowLanguages: string[];
};

export function loadConfig(): C2CConfig {
  const p = path.resolve(process.cwd(), "c2cai.config.json");
  const cfg = JSON.parse(fs.readFileSync(p, "utf8"));
  return cfg;
}

export const env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  MODEL: process.env.C2CAI_MODEL || "gpt-4o-mini",
  EMBED_MODEL: process.env.C2CAI_EMBED_MODEL || "text-embedding-3-small",
};