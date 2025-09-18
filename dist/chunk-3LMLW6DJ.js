import {
  env,
  loadConfig
} from "./chunk-LJXTQQMK.js";
import {
  answerWithRAG
} from "./chunk-QEOBEW76.js";
import {
  logChat
} from "./chunk-SAS7MPEH.js";

// src/server.ts
import express from "express";
import OpenAI from "openai";
import crypto from "crypto";
function createC2CAIServer() {
  const cfg = loadConfig();
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const router = express.Router();
  router.use(express.json({ limit: "1mb" }));
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
        id: sessionId || crypto.randomUUID(),
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

export {
  createC2CAIServer
};
