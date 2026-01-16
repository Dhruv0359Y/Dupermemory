import express from "express";
import { addMemory, getMemories } from "../memoryStore.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { cosineSimilarity } from "../similarity.js";
import { addVector } from "../services/vector.service.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });

  const embedding = await generateEmbedding(text);
  await addVector({ text, embedding });

  res.json({ success: true });
});

router.post("/search", async (req, res) => {
  const { query } = req.body;
  const queryEmbedding = await generateEmbedding(query);

  const results = getMemories()
    .map((mem) => ({
      text: mem.text,
      score: cosineSimilarity(queryEmbedding, mem.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  res.json(results);
});

export default router;
