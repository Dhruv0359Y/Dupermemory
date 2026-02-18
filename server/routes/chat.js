import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ollama from "ollama";

import { generateEmbedding } from "../services/embedding.service.js";
import { searchVector } from "../services/vector.service.js";
import { isUsefulMemory } from "../services/memoryjudge.service.js";
import { scoreMemory } from "../services/memoryscore.service.js";
import { storeMemory } from "../services/memoryStore.service.js";
import { forgetOldMemories } from "../services/forget.service.js";

dotenv.config();

const router = express.Router();
const client = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { message, userId = "default_user" } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    // 1️⃣ Smart memory storing
    try {
      const useful = await isUsefulMemory(message);
      console.log("🧠 Is useful memory?", useful);

      if (useful) {
        const importance = scoreMemory(message);
        await storeMemory(message, userId, importance);
        console.log("✅ Memory stored with importance:", importance);

        // 2% chance to clean up — not every message
        if (Math.random() < 0.02) {
          await forgetOldMemories(userId, 300);
        }
      }
    } catch (memErr) {
      console.warn("Memory storing failed:", memErr.message);
    }

    // 2️⃣ Embed + search memories
    const qEmbedding = await generateEmbedding(message);
    const memories = await searchVector(qEmbedding, 3);

    const memoryBlock = memories.length
      ? memories.map((m) => `- ${m.text}`).join("\n")
      : "No stored memory.";

    // 3️⃣ Tight prompt
    const prompt = `You are a concise AI assistant. You have access to facts about the USER you are talking to. These are facts about THEM, not about you.

Facts about the user:
${memoryBlock}

User's question: ${message}

Reply concisely. Never claim the user's personal info (name, hobbies, goals) as your own:`;

    let reply = "";

    // 4️⃣ PRIMARY: Gemini
    try {
      const model = client.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.5,
        },
      });

      const result = await model.generateContent(prompt);
      reply = result.response.text();
    } catch (geminiError) {
      console.warn("Gemini failed. Switching to local LLM.");
      console.error("Gemini error:", geminiError.message);

      // 5️⃣ FALLBACK: Qwen
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
