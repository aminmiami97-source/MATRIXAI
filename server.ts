import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { handleApiRequest } from "./server/apiRouter.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// API middleware
app.use(async (req, res, next) => {
  if (req.url?.startsWith("/api/")) {
    const handled = await handleApiRequest(req, res);
    if (handled) return;
  }
  next();
});

// Serve static assets in production
app.use(express.static(path.join(__dirname, "dist")));

// Fallback to index.html for SPA routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`matrixAI production server running on http://0.0.0.0:${PORT}`);
});
