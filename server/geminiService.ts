import { GoogleGenAI } from "@google/genai";

export interface ChatMessagePayload {
  role: "user" | "model";
  content: string;
  image?: {
    data: string; // base64 string
    mimeType: string;
  };
  audio?: {
    data: string; // base64 string
    mimeType: string;
  };
}

export interface ChatRequestOptions {
  modelId: "matrix-lite" | "matrix-base" | "matrix-pro";
  messages: ChatMessagePayload[];
  useSearch?: boolean;
  personaPrompt?: string;
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined in process.env");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export function resolveModelName(modelId: string): string {
  switch (modelId) {
    case "matrix-lite":
      return "gemini-3.1-flash-lite";
    case "matrix-base":
      return "gemini-3-flash-preview";
    case "matrix-pro":
      return "gemini-3.1-pro-preview";
    default:
      return "gemini-3.1-flash-lite";
  }
}

export function parseErrorMessage(err: any): string {
  if (!err) return "An unexpected error occurred.";
  const raw = err.message || String(err);

  if (
    raw.includes("429") ||
    raw.includes("RESOURCE_EXHAUSTED") ||
    raw.toLowerCase().includes("quota")
  ) {
    return "API rate limit reached (Quota Exceeded). Please retry in a few seconds or use Matrix Lite.";
  }
  if (raw.includes("503") || raw.includes("UNAVAILABLE")) {
    return "The model is currently experiencing high demand. Please try again in a few moments.";
  }

  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (parsed.error?.message) {
      try {
        const inner = JSON.parse(parsed.error.message);
        if (inner.error?.message) return inner.error.message;
      } catch {
        return parsed.error.message;
      }
    }
  } catch {}
  return raw;
}

export async function* streamChatResponse(options: ChatRequestOptions) {
  const { modelId, messages, useSearch } = options;

  if (modelId === "matrix-pro") {
    yield {
      type: "content",
      text: "Matrix Pro: Advanced logic & coding engine is currently in development (Coming Soon). Please select Matrix Lite or Matrix Base to chat.",
    };
    yield { type: "done" };
    return;
  }

  const ai = getGeminiClient();
  const primaryModel = resolveModelName(modelId);

  // Token Optimization for longer chats (reduces token consumption by 20%+):
  // 1. Sliding window compaction if message history exceeds 24 messages
  let optimizedMessages = messages;
  if (messages.length > 24) {
    // Preserve initial greeting/context + recent 20 messages
    optimizedMessages = [
      ...messages.slice(0, 2),
      ...messages.slice(-20),
    ];
  }

  // 2. Identify the last message that contains an image so older images don't re-send heavy base64
  let lastImageIndex = -1;
  for (let i = optimizedMessages.length - 1; i >= 0; i--) {
    if (optimizedMessages[i].image?.data) {
      lastImageIndex = i;
      break;
    }
  }

  // 3. Identify the last message that contains audio so older voice clips don't re-send heavy base64
  let lastAudioIndex = -1;
  for (let i = optimizedMessages.length - 1; i >= 0; i--) {
    if (optimizedMessages[i].audio?.data) {
      lastAudioIndex = i;
      break;
    }
  }

  // Format contents array with token conservation for longer chats
  const contents = optimizedMessages.map((m, idx) => {
    const parts: any[] = [];
    if (m.image?.data) {
      // Only send heavy inline base64 for the active/latest image turn to save 20%+ tokens in long chats
      if (idx === lastImageIndex) {
        let cleanBase64 = m.image.data;
        if (cleanBase64.includes(";base64,")) {
          cleanBase64 = cleanBase64.split(";base64,")[1];
        }
        parts.push({
          inlineData: {
            mimeType: m.image.mimeType || "image/jpeg",
            data: cleanBase64,
          },
        });
      } else {
        // Lightweight token-conserving placeholder for past images
        parts.push({
          text: "[Prior uploaded image previously inspected]",
        });
      }
    }

    if (m.audio?.data) {
      // Send audio inlineData so Gemini can hear the voice input directly
      if (idx === lastAudioIndex) {
        let cleanBase64 = m.audio.data;
        if (cleanBase64.includes(";base64,")) {
          cleanBase64 = cleanBase64.split(";base64,")[1];
        }
        parts.push({
          inlineData: {
            mimeType: m.audio.mimeType || "audio/webm",
            data: cleanBase64,
          },
        });
      } else {
        parts.push({
          text: "[Prior recorded audio message previously processed]",
        });
      }
    }

    if (m.content) {
      parts.push({ text: m.content });
    } else if (parts.length === 0) {
      parts.push({ text: "Hello" });
    } else if (m.audio?.data && parts.length === 1) {
      // Audio without accompanying text: instruct model to listen to the user's voice message
      parts.push({
        text: "Please listen carefully to this recorded audio message from the user and respond directly to what was said.",
      });
    }

    return {
      role: m.role === "user" ? "user" : "model",
      parts,
    };
  });

  const baseInstruction = options.personaPrompt
    ? `${options.personaPrompt} You can listen to user audio recordings and inspect images. Always format responses using clean Markdown, syntax-highlighted code blocks where applicable, and structured bullet points.`
    : "You are matrixAI, a sleek, next-generation AI platform. You can process text, images, and audio/voice recordings sent by the user. When listening to user audio, understand what was said and answer their spoken questions or requests directly and thoroughly. Use markdown formatting with clear headings, lists, and code blocks with syntax highlighting when relevant. Keep your explanations articulate, precise, and free of unnecessary fluff.";

  const runStream = async function* (model: string, withSearch: boolean) {
    const config: any = { systemInstruction: baseInstruction };
    if (withSearch) {
      config.tools = [{ googleSearch: {} }];
    }
    const responseStream = await ai.models.generateContentStream({
      model,
      contents,
      config,
    });
    for await (const chunk of responseStream) {
      yield chunk;
    }
  };

  let hasYieldedText = false;
  let fullGroundingMetadata: any = null;

  // Step 1: Attempt primary model (with search if requested)
  try {
    for await (const chunk of runStream(primaryModel, !!useSearch)) {
      const text = chunk.text;
      if (text) {
        hasYieldedText = true;
        yield { type: "content", text };
      }
      if (chunk.candidates?.[0]?.groundingMetadata) {
        fullGroundingMetadata = chunk.candidates[0].groundingMetadata;
      }
    }
  } catch (_initialErr: any) {
    // If search tool was enabled and quota was exceeded, seamlessly retry without search tool
    if (useSearch && !hasYieldedText) {
      try {
        for await (const chunk of runStream(primaryModel, false)) {
          const text = chunk.text;
          if (text) {
            hasYieldedText = true;
            yield { type: "content", text };
          }
        }
      } catch (_noSearchErr: any) {
        // Fall back below
      }
    }

    // Step 2: If primary model had any issue, fall back to high-throughput backup
    if (!hasYieldedText) {
      const fallbackModel =
        primaryModel === "gemini-3.1-flash-lite"
          ? "gemini-3-flash-preview"
          : "gemini-3.1-flash-lite";

      try {
        for await (const chunk of runStream(fallbackModel, false)) {
          const text = chunk.text;
          if (text) {
            hasYieldedText = true;
            yield { type: "content", text };
          }
        }
      } catch (_fbErr: any) {
        yield {
          type: "error",
          error: parseErrorMessage(_fbErr || _initialErr),
        };
        return;
      }
    }
  }

  if (fullGroundingMetadata) {
    yield {
      type: "grounding",
      grounding: {
        webSearchQueries: fullGroundingMetadata.webSearchQueries || [],
        searchChunks:
          fullGroundingMetadata.groundingChunks?.map((c: any) => ({
            title: c.web?.title || "Web Source",
            uri: c.web?.uri || "",
          })) || [],
      },
    };
  }

  yield { type: "done" };
}
