# DuperMemory 🧠

DuperMemory is an experimental AI memory system designed to solve a common limitation of most AI applications — **lack of persistent memory across sessions**.

Most AI systems forget user context when a session ends.  
DuperMemory explores how semantic memory can be added using embeddings and similarity matching.

🚧 **Status:** Active Development / Prototype

---

## ❓ Problem

Traditional AI applications are stateless:

- They forget who the user is
- They forget preferences mentioned earlier
- They cannot recall past context meaningfully

This makes AI interactions feel repetitive and disconnected.

---

## 💡 Current Solution (Prototype Implementation)

DuperMemory introduces a **semantic memory layer** using embeddings and similarity matching.

### Memory Storage (Current)

- Important user statements are converted into **embeddings**
- These embeddings are stored **in memory (RAM)**
- No external vector database is used yet

Example:

> User says casually: _“I like going to the gym.”_  
> This statement is embedded and stored temporarily in memory.

---

### Memory Recall (Current)

1. User asks a question later (e.g., _“What should I do tomorrow?”_)
2. The query is converted into an embedding
3. **Cosine similarity** is used to match it against stored embeddings
4. The most relevant memory is returned

Example response:

> _“You could go to the gym tomorrow morning, since you mentioned earlier that you enjoy working out.”_

---

## ⚠️ Current Limitations

- Memory is stored **only in RAM**
- Memory resets when the server restarts
- No user authentication (login/register) implemented
- Single-user, session-based prototype

These limitations are intentional at this stage to focus on **core memory logic**.

---

## 🧠 Key Concepts Used

- Embeddings for semantic representation
- Cosine similarity for relevance matching
- In-memory storage (RAM-based memory)
- Context-aware memory retrieval
- Client–server architecture

---

## 🏗️ Project Architecture

- **Server:** Handles embedding generation, memory storage, and similarity search
- **Client:** Handles user interaction and displays AI responses

---

## 🛠️ Tech Stack

**Backend**

- Node.js
- Express
- Embedding-based AI models
- In-memory data structures

**Frontend**

- Vite
- JavaScript
- HTML & CSS

---

## 🚀 Planned Improvements

- Replace in-memory storage with a **vector database**
- Add long-term persistent memory
- Implement user authentication (login & registration)
- Add memory relevance scoring & filtering
- Improve frontend memory visualization
- Explore privacy-first and offline memory approaches

---

## 🎯 Vision

The long-term goal of DuperMemory is to build a **persistent, human-like memory layer for AI systems**, enabling more personalized and context-aware interactions over time.

---

## 📌 Note

This project is a **learning-focused prototype**.  
Architecture and features will evolve as the system matures.
