import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import OpenAI from "openai";
import Content from "./models/Content.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const TYPES = {
  blog: "a blog post",
  email: "a professional email",
  social: "a short social media post",
  product: "a product description",
};

// Generate content and stream it back as plain text
app.post("/api/generate", async (req, res) => {
  const { prompt, type = "blog", tone = "professional" } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  let output = "";
  try {
    const stream = await openai.chat.completions.create({
      model: MODEL,
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are a skilled content writer. Write ${TYPES[type] || TYPES.blog} in a ${tone} tone.`,
        },
        { role: "user", content: prompt },
      ],
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        output += text;
        res.write(text);
      }
    }

    await Content.create({ prompt, type, tone, output });
    res.end();
  } catch (err) {
    console.error("Generate error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Could not generate content. Check your API key and try again." });
    } else {
      res.end();
    }
  }
});

app.get("/api/history", async (_req, res) => {
  const items = await Content.find().sort({ createdAt: -1 }).limit(20);
  res.json(items);
});

app.delete("/api/history/:id", async (req, res) => {
  await Content.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
