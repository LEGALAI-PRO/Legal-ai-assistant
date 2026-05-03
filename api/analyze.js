const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing GROQ_API_KEY configuration." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
  }
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Expected JSON body" });
    return;
  }

  const { model, messages, temperature, response_format } = body;
  if (!model || typeof model !== "string") {
    res.status(400).json({ error: "Missing or invalid model" });
    return;
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Missing or invalid messages" });
    return;
  }

  let groqRes;
  try {
    groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: typeof temperature === "number" ? temperature : 0.2,
        response_format:
          response_format && typeof response_format === "object"
            ? response_format
            : { type: "json_object" },
      }),
    });
  } catch (err) {
    res.status(502).json({ error: err.message || "Failed to reach Groq API" });
    return;
  }

  const data = await groqRes.json().catch(() => ({}));
  if (!groqRes.ok) {
    const msg =
      typeof data?.error === "string"
        ? data.error
        : data?.error?.message || groqRes.statusText || "Groq request failed";
    res.status(groqRes.status).json({ error: msg });
    return;
  }

  res.status(200).json(data);
};
