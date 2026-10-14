import { streamChatResponse } from "./geminiService.ts";

export const MODELS_CATALOG = [
  {
    id: "matrix-lite",
    name: "Matrix Lite",
    tagline: "Fast, everyday response model.",
    description: "Optimized for ultra-low latency, everyday inquiries, concise drafts, and high-frequency tasks.",
    geminiModel: "gemini-3.1-flash-lite",
    status: "active",
    badge: "Fast & Light",
    iconColor: "#00E5FF", // Cyber Cyan
    contextWindow: "1M Tokens",
    latency: "Ultra-Fast",
    supportsVision: true,
    supportsSearch: false,
  },
  {
    id: "matrix-base",
    name: "Matrix Base",
    tagline: "Standard, balanced smart model.",
    description: "Flagship intelligence for rich dialogue, complex multi-step reasoning, real-time Google search grounding, and multimodal image inspection.",
    geminiModel: "gemini-3-flash-preview",
    status: "active",
    badge: "Balanced & Smart",
    iconColor: "#6366F1", // Soft Violet Blue
    contextWindow: "1M Tokens",
    latency: "High Speed",
    supportsVision: true,
    supportsSearch: true,
  },
  {
    id: "matrix-pro",
    name: "Matrix Pro",
    tagline: "Advanced logic & coding engine.",
    description: "Deep algorithmic reasoning, automated software synthesis, and advanced mathematical proofing. Currently in development.",
    geminiModel: "gemini-3.1-pro-preview",
    status: "coming-soon",
    badge: "Coming Soon",
    iconColor: "#F59E0B",
    contextWindow: "2M Tokens",
    latency: "Deep Logic",
    supportsVision: true,
    supportsSearch: true,
  },
];

export async function handleApiRequest(req: any, res: any): Promise<boolean> {
  const url = req.url?.split("?")[0];

  if (url === "/api/models" && req.method === "GET") {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ models: MODELS_CATALOG }));
    return true;
  }

  if (url === "/api/chat" && req.method === "POST") {
    let bodyData = "";
    let isClientDisconnected = false;

    req.on("error", (err: any) => {
      console.error("Chat incoming request stream error:", err);
      isClientDisconnected = true;
    });

    req.on("close", () => {
      isClientDisconnected = true;
    });

    res.on("close", () => {
      isClientDisconnected = true;
    });

    req.on("data", (chunk: any) => {
      bodyData += chunk;
    });

    req.on("end", async () => {
      if (isClientDisconnected) return;

      try {
        const body = JSON.parse(bodyData || "{}");
        const { modelId = "matrix-lite", messages = [], useSearch = false, personaPrompt } = body;

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        for await (const chunk of streamChatResponse({
          modelId,
          messages,
          useSearch,
          personaPrompt,
        })) {
          if (isClientDisconnected || res.writableEnded) {
            break;
          }
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }

        if (!res.writableEnded && !isClientDisconnected) {
          res.end();
        }
      } catch (err: any) {
        console.error("Chat API error:", err);
        if (!isClientDisconnected && !res.writableEnded) {
          if (!res.headersSent) {
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || "Internal Server Error" }));
          } else {
            res.write(`data: ${JSON.stringify({ type: "error", error: err.message })}\n\n`);
            res.end();
          }
        }
      }
    });
    return true;
  }

  return false;
}
