import express from "express";
import OpenAI from "openai";
import crypto from "crypto";
import { loadConfig, env } from "./config.js";
import { logChat } from "./db.js";
import { answerWithRAG } from "./rag.js";

export function createC2CAIServer() {
  const cfg = loadConfig();
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const router = express.Router();
  router.use(express.json({ limit: "1mb" }));

  router.post("/chat", async (req, res) => {
    try {
      const { message, page, sessionId } = req.body;  // ✅ no TS types in .js

      const out = await answerWithRAG({
        client,
        model: env.MODEL,
        embedModel: env.EMBED_MODEL,
        question: message,
        pageHint: page,
        allowLangs: cfg.allowLanguages,
      });

      await logChat({
        id: sessionId || crypto.randomUUID(),
        ts: Date.now(),
        lang: "auto",
        user: message,
        assistant: out.answer,
        sources: out.sources,
      });

      res.json(out);
    } catch (e) {
      res.status(500).json({ error: e.message || "server_error" });
    }
  });

  return router;
}