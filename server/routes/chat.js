import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ollama from "ollama";

import { generateEmbedding } from "../services/embedding.service.js";
import { searchVector } from "../services/vector.service.js";

dotenv.config();

const router = express.Router();
const client = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    // 1️⃣ Embed query
    const qEmbedding = await generateEmbedding(message);

    // 2️⃣ Vector search (REAL MEMORY)
    const memories = await searchVector(qEmbedding, 3);

    const memoryBlock = memories.length
      ? memories.map((m) => `- ${m.text}`).join("\n")
      : "No stored memory.";

    const prompt = `
You are an assistant with long-term memory.

User memory:
${memoryBlock}

User question:
${message}
`;

    let reply = "";

    // 3️⃣ PRIMARY: Gemini
    try {
      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });

      const result = await model.generateContent(prompt);
      reply = result.response.text();
    } catch (geminiError) {
      console.warn("Gemini failed. Switching to local LLM.");

      // 4️⃣ FALLBACK: Local LLM (Qwen 2.5)
      const response = await ollama.chat({
        model: "qwen2.5:0.5b",
        messages: [{ role: "user", content: prompt }],
      });

      reply = response.message.content;
    }

    res.json({ reply });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.status(500).json({ error: "Chat failed" });
  }
});

export default router;
