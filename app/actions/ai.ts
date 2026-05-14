"use server";

/**
 * Draft listing description from owner bullet points.
 * Set OPENAI_API_KEY in .env.local to enable AI; otherwise returns a structured template.
 */
export async function generateListingDescription(formData: FormData): Promise<{
  text?: string;
  error?: string;
  usedAi?: boolean;
}> {
  const title = String(formData.get("title") ?? "").trim();
  const propertyType = String(formData.get("property_type") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const dealType = String(formData.get("deal_type") ?? "rent").trim();
  const category = String(formData.get("category") ?? "residential").trim();
  const bullets = String(formData.get("bullets") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();

  if (!title && !bullets) {
    return { error: "Add a title or a few bullet points first." };
  }

  const key = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const dealPhrase = dealType === "sale" ? "for sale" : "for rent";
  const catPhrase = category === "commercial" ? "commercial" : "residential";

  if (!key) {
    const lines = [
      title ? `${title} — ${catPhrase} property ${dealPhrase} in Nashik.` : `A ${catPhrase} ${propertyType || "property"} ${dealPhrase} in Nashik.`,
      location ? `Located in ${location}.` : null,
      price ? (dealType === "sale" ? `Asking price: ₹${price}.` : `Monthly rent: ₹${price}.`) : null,
      bullets ? bullets : "Contact the owner for a visit and more details.",
    ].filter(Boolean);
    return { text: lines.join("\n\n"), usedAi: false };
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
        temperature: 0.7,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "You write concise, honest property listing descriptions for Nashik, India. Use plain English, 2-4 short paragraphs, no hype or fake claims. Mention rent vs sale correctly.",
          },
          {
            role: "user",
            content: [
              `Title: ${title || "—"}`,
              `Deal: ${dealPhrase}`,
              `Category: ${catPhrase}`,
              `Type: ${propertyType || "—"}`,
              `Location: ${location || "—"}`,
              `Price: ${price || "—"}`,
              `Owner notes:\n${bullets || "—"}`,
            ].join("\n"),
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[generateListingDescription]", res.status, errText);
      return { error: "AI service unavailable. Try again or write manually." };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return { error: "No description returned from AI." };
    }
    return { text, usedAi: true };
  } catch (e) {
    console.error("[generateListingDescription]", e);
    return { error: "Could not reach AI service." };
  }
}
