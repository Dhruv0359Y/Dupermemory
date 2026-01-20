import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
  url: "http://localhost:6333",
});

const COLLECTION = "dupermemory_collection2";

export async function initVectorDB() {
  const collections = await qdrant.getCollections();
  const exists = collections.collections.find((c) => c.name === COLLECTION);

  if (!exists) {
    await qdrant.createCollection(COLLECTION, {
      vectors: {
        size: 768, // Gemini embedding size
        distance: "Cosine",
      },
    });
    console.log("✅ Vector collection created");
  }
}

export async function addVector({ text, embedding }) {
  await qdrant.upsert(COLLECTION, {
    points: [
      {
        id: Date.now(),
        vector: embedding,
        payload: { text },
      },
    ],
  });
}

export async function searchVector(embedding, limit = 3) {
  const result = await qdrant.search(COLLECTION, {
    vector: embedding,
    limit,
  });

  return result.map((r) => ({
    text: r.payload.text,
    score: r.score,
  }));
  console.log("🧠 Retrieved memories:", memories);
}
