# 🧠 Dupermemory — AI Assistant with Real Long-Term MemorY

Dupermemory is an AI assistant that **actually remembers information across conversations**, even after server restarts.

Most chatbots *appear* to remember things, but in reality they:
- rely on short context windows
- or hallucinate based on patterns

Dupermemory solves this by using a **Vector Database (Qdrant)** to store and retrieve memories semantically — and now with a **smart memory layer** that only remembers what actually matters.


---

## ❓ Why Dupermemory Exists

Large Language Models (LLMs) like Gemini or GPT:
- ❌ do NOT have long-term memory
- ❌ forget everything after each request
- ❌ cannot recall user preferences on their own

So if you want an AI that remembers:
- user interests
- preferences
- goals
- personal facts

You must build a **memory layer outside the LLM**.

👉 That is exactly what Dupermemory does.

---

## 🧠 Core Idea (In Simple Words)

1. User sends a message
2. A **memory judge** decides if it contains useful long-term info
3. If yes — score it, embed it, store it in Qdrant
4. On every message — search Qdrant for relevant past memories
5. Inject those memories into the AI prompt
6. Gemini responds with full context of who the user is

This is **deterministic and reliable** — not hallucination.

---

## 🏗️ System Architecture

```
User Message
↓
Memory Judge (Gemini / Qwen fallback)
↓ (only if useful)
Memory Scorer → Importance Score (2 / 5 / 8)
↓
Gemini Embedding API
↓
Qdrant Vector Database (Docker)
↓
Top-3 Similar Memories Retrieved
↓
Prompt Injection
↓
Gemini LLM → Concise Response
```

---

## 🧠 Smart Memory System (New)

The original version stored **every message**. The upgraded version is smarter:

### 🔹 Step 1: Memory Judge
Before storing anything, the message is passed to an AI filter:

```
"Hello" → NO (not stored)
"My name is Dhruv and I love cybersecurity" → YES (stored)
```

Uses **Gemini** as primary judge. Falls back to **Qwen 2.5 (offline)** if Gemini is unavailable.

### 🔹 Step 2: Memory Scoring
Every stored memory gets an importance score:

| Score | Meaning |
|-------|---------|
| 8 | Strong personal info (name, goals, likes) |
| 5 | Decent length, probably useful |
| 2 | Short, low value |

### 🔹 Step 3: Embedding + Storage
Useful memories are embedded using Gemini's embedding model and stored in Qdrant with:

```json
{
  "text": "I love cybersecurity",
  "user_id": "default_user",
  "importance": 8,
  "created_at": 1718000000000
}
```

### 🔹 Step 4: Memory Retrieval
When the user asks something, the question is embedded and Qdrant finds the top-3 most semantically similar memories. These are injected into the prompt so Gemini has context about the user.

### 🔹 Step 5: Forgetting (Smart Cleanup)
When a user exceeds 300 stored memories, the **lowest importance memories are deleted first**. This runs occasionally (not every message) to avoid performance hits.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Primary LLM | Gemini 2.0 Flash |
| Fallback LLM | Qwen 2.5 0.5b (Ollama, offline) |
| Embeddings | Gemini Embedding API |
| Vector DB | Qdrant (Docker) |

---

## 🚀 Getting Started

### 1. Start Qdrant
```bash
docker run -p 6333:6333 qdrant/qdrant
```

### 2. Install dependencies
```bash
cd server
npm install
```

### 3. Set up `.env`
```env
OPENAI_API_KEY=your_gemini_api_key_here
```

### 4. Run the server
```bash
npm run dev
```

Server starts on `http://localhost:5000`

---

## 📡 API

### Chat (with auto memory)
```
POST /chat
Body: { "message": "My name is Dhruv", "userId": "dhruv123" }
Response: { "reply": "Nice to meet you, Dhruv!" }
```

Every message is automatically judged, scored, and stored if useful. No separate memory endpoint needed.

---

## 📁 Project Structure

```
server/
├── index.js                        # Entry point
├── routes/
│   └── chat.js                     # Chat endpoint
└── services/
    ├── vector.service.js           # Qdrant client + search
    ├── embedding.service.js        # Gemini embeddings
    ├── memoryStore.service.js      # Store memory in Qdrant
    ├── memoryjudge.service.js      # AI filter (useful or not)
    ├── memoryscore.service.js      # Importance scoring
    └── forget.service.js           # Delete old low-value memories
```
