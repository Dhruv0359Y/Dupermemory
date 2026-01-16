import express from "express";
import { addMemory, getMemories } from "../memoryStore.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { cosineSimilarity } from "../similarity.js";

const router = express.Router();


router.post("/add", async (req, res) => {
  const { text } = req.body;

  const embedding = await generateEmbedding(text);
  addMemory(text, embedding);

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
