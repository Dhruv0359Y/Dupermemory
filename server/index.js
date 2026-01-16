import express from "express";
import cors from "cors";
import memoryRoutes from "./routes/memory.js";
import chatRoutes from "./routes/chat.js";
import { initVectorDB } from "./services/vector.service.js";

const app = express();
app.use(express.json());
app.use(cors());
(async () => {
  await initVectorDB();
})();
app.use("/memory", memoryRoutes);
app.use("/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("SuperMemory API running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
