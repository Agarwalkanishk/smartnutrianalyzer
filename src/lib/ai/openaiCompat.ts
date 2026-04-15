import { env } from "@/env";

export type OpenAICompatChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function openAICompatJsonChat(input: {
  messages: OpenAICompatChatMessage[];
  model?: string;
  temperature?: number;
}) {
  const baseUrl = env.AI_BASE_URL ?? "https://api.openai.com/v1";
  const apiKey = env.AI_API_KEY;
  const model = input.model ?? env.AI_MODEL ?? "gpt-4.1-mini";

  if (!apiKey) {
    return {
      ok: false as const,
      error: "AI_API_KEY is not configured",
    };
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: input.temperature ?? 0.2,
      messages: input.messages,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false as const, error: "Upstream error", status: res.status, text };
  }

  const json = (await res.json().catch(() => null)) as any;
  const content = json?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    return { ok: false as const, error: "Invalid upstream response" };
  }

  return { ok: true as const, model, content };
}

