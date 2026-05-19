export function getGeminiConfig() {
  const key =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  return { key, model };
}

function stripMarkdownFences(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  return trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

export async function chatCompletion(
  system: string,
  user: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<{ text?: string; error?: string }> {
  const { key, model } = getGeminiConfig();
  if (!key) {
    return { error: "GEMINI_API_KEY not configured" };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: system }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: user }],
          },
        ],
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 400,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[gemini chat]", res.status, errText);
      return { error: "AI service unavailable." };
    }

    const json = (await res.json()) as {
      candidates?: {
        content?: { parts?: { text?: string }[] };
        finishReason?: string;
      }[];
      error?: { message?: string };
    };

    if (json.error?.message) {
      console.error("[gemini chat]", json.error.message);
      return { error: "AI service unavailable." };
    }

    const raw = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!raw) return { error: "Empty AI response." };

    return { text: stripMarkdownFences(raw) };
  } catch (e) {
    console.error("[gemini chat]", e);
    return { error: "Could not reach AI service." };
  }
}
