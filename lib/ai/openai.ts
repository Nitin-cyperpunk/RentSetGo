export function getOpenAiConfig() {
  const key = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  return { key, model };
}

export async function chatCompletion(
  system: string,
  user: string,
  options?: { maxTokens?: number; temperature?: number },
): Promise<{ text?: string; error?: string }> {
  const { key, model } = getOpenAiConfig();
  if (!key) {
    return { error: "OPENAI_API_KEY not configured" };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 400,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[openai chat]", res.status, errText);
      return { error: "AI service unavailable." };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) return { error: "Empty AI response." };
    return { text };
  } catch (e) {
    console.error("[openai chat]", e);
    return { error: "Could not reach AI service." };
  }
}
