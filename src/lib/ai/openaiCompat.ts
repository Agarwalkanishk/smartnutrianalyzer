import { env } from "@/env";

export type OpenAICompatChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export async function openAICompatJsonChat(input: {
  messages: OpenAICompatChatMessage[];
  model?: string;
  temperature?: number;
}) {
  const apiKey = env.GEMINI_API_KEY;
  const model = input.model ?? env.GEMINI_MODEL ?? "gemini-2.0-flash";

  if (!apiKey) {
    return {
      ok: false as const,
      error: "GEMINI_API_KEY is not configured",
    };
  }

  const systemPrompt =
    input.messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n")
      .trim() || "Return only valid JSON.";
  const userPrompt = input.messages
    .filter((m) => m.role !== "system")
    .map((m) => m.content)
    .join("\n\n")
    .trim();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: input.temperature ?? 0.2,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false as const, error: "Upstream error", status: res.status, text };
  }

  const json = (await res.json().catch(() => null)) as GeminiGenerateResponse | null;
  const content = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content || typeof content !== "string") {
    return { ok: false as const, error: "Invalid upstream response" };
  }

  return { ok: true as const, model, content };
}

export async function openAICompatMultimodalChat(input: {
  systemPrompt: string;
  userPrompt: string;
  imageBase64?: string;
  imageMimeType?: string;
  model?: string;
}) {
  const apiKey = env.GEMINI_API_KEY;
  const model = input.model ?? env.GEMINI_MODEL ?? "gemini-2.0-flash";

  if (!apiKey) {
    return {
      ok: false as const,
      error: "GEMINI_API_KEY is not configured",
    };
  }

  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  if (input.imageBase64 && input.imageMimeType) {
    parts.push({
      inlineData: {
        mimeType: input.imageMimeType,
        data: input.imageBase64,
      },
    });
  }

  parts.push({ text: input.userPrompt });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: input.systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false as const, error: "Upstream error", status: res.status, text };
  }

  const json = (await res.json().catch(() => null)) as GeminiGenerateResponse | null;
  const content = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content || typeof content !== "string") {
    return { ok: false as const, error: "Invalid upstream response" };
  }

  return { ok: true as const, model, content };
}
