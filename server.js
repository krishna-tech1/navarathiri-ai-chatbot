import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

if (!API_KEY) {
  console.error("GEMINI_API_KEY is missing in .env file!");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));

/* ---------- Created once at startup ---------- */
const ai = new GoogleGenAI({ apiKey: API_KEY });

const KNOWLEDGE_PATH = fs.existsSync(path.join(__dirname, "knowledge.txt"))
  ? path.join(__dirname, "knowledge.txt")
  : path.join(process.cwd(), "knowledge.txt");

const KNOWLEDGE = fs.existsSync(KNOWLEDGE_PATH)
  ? fs.readFileSync(KNOWLEDGE_PATH, "utf8").trim()
  : "";
if (!KNOWLEDGE) console.warn("WARNING: knowledge.txt missing or empty.");

const SYSTEM_PROMPT = `You are Navarathiri AI, a warm, friendly woman who loves Hindu festivals, epics and scriptures. You are talking out loud with someone, so write exactly the way a person would speak.

CREATOR & IDENTITY:
- If the user asks who created, made, or developed you ("Who created you?", "Who built you?", "உன்னை உருவாக்கியவர் யார்?", "உன்னை யார் உருவாக்கியது?", etc.), respond with warmth, respect, and professional pride:
  - In Tamil: "என்னை உருவாக்கியவர் முத்துகிருஷ்ணன். இவர் பி.சி.ஏ (BCA) மூன்றாம் ஆண்டு பயிலும் அர்ப்பணிப்புமிக்க மாணவர். ஆன்மீக அறிவையும் நவீன ஏஐ தொழில்நுட்பத்தையும் இணைக்கும் உன்னத நோக்கத்துடன் என்னை வடிவமைத்துள்ளார்."
  - In English: "I was created by Muthukrishnan, a dedicated 3rd-year BCA student, who developed me to seamlessly blend sacred Indian spiritual wisdom with cutting-edge Artificial Intelligence."

LANGUAGE
- Reply in the language the user used. Tamil script in, Tamil out (natural spoken Tamil, not stiff written Tamil). English in, English out.
- If they naturally mix Tamil and English, reply in the same natural mix.
- If they type Tamil in English letters, reply in Tamil script.

STYLE (this is spoken aloud)
- One to three short sentences, four at most. Lead with the answer.
- Sound like a kind friend, not a textbook. Contractions and soft connectors are fine.
- No markdown, lists, emojis, brackets, or symbols. Write numbers and dates the way you would say them.
- Don't open with "Great question", "Sure", or "Of course". Don't repeat the question back.

ACCURACY
- Use the KNOWLEDGE section first.
- If it doesn't cover the question, answer from well-established general knowledge only when you are confident, and mention that customs vary by region and family when it matters.
- If you are not confident, say so in one short sentence in the user's language and suggest asking a temple priest or scholar. Never invent details.
- If the question is completely unrelated to Hindu festivals, epics, scriptures, or your creator Muthukrishnan, say kindly that it's outside what you cover and invite a question about Navarathiri, Ramayana or Mahabharata.`;

// Identical on every request -> enables implicit caching on the prefix
const SYSTEM_INSTRUCTION = `${SYSTEM_PROMPT}\n\nKNOWLEDGE:\n${KNOWLEDGE}`;

const GEN_CONFIG = {
  systemInstruction: SYSTEM_INSTRUCTION,
  temperature: 0.7,
  topP: 0.9,
  maxOutputTokens: 256,
  // Biggest latency win. If your SDK version rejects this, use { thinkingBudget: 0 }
  thinkingConfig: { thinkingLevel: "minimal" },
};

function buildContents(question, history) {
  const contents = [];
  const recent = Array.isArray(history) ? history.slice(-3) : [];
  for (const t of recent) {
    if (t?.question) contents.push({ role: "user", parts: [{ text: String(t.question) }] });
    if (t?.answer) contents.push({ role: "model", parts: [{ text: String(t.answer) }] });
  }
  contents.push({ role: "user", parts: [{ text: question }] });
  return contents;
}

/* ---------- Streaming endpoint (use this for voice) ---------- */
app.post("/api/chat/stream", async (req, res) => {
  const question = req.body?.question?.trim();
  if (!question) return res.status(400).json({ error: "Question is required" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const controller = new AbortController();
  res.on("close", () => controller.abort()); // user interrupted or left

  try {
    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents: buildContents(question, req.body.history),
      config: { ...GEN_CONFIG, abortSignal: controller.signal },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err) {
    if (!controller.signal.aborted) {
      console.error("Gemini API Error:", err.message);
      res.write(`data: ${JSON.stringify({ error: "Failed to get response" })}\n\n`);
    }
  } finally {
    res.end();
  }
});

/* ---------- Non-streaming fallback (same behaviour, one JSON reply) ---------- */
app.post("/api/chat", async (req, res) => {
  const question = req.body?.question?.trim();
  if (!question) return res.status(400).json({ error: "Question is required" });
  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: buildContents(question, req.body.history),
      config: GEN_CONFIG,
    });
    res.json({ answer: (result.text || "").trim() });
  } catch (err) {
    console.error("Gemini API Error:", err.message);
    res.status(500).json({ error: "Failed to get response from AI", details: err.message });
  }
});

/* =========================================================
   TEXT TO SPEECH — HIGH FIDELITY NEURAL VOICES
   Default: 'ta-IN-PallaviNeural' (Sweet, warm, natural Indian Tamil)
   Secondary: 'ta-IN-ValluvarNeural' (Resonant classical Tamil male)
   Alternative: 'ta-LK-SaranyaNeural' (Calm, soothing traditional female)
   English: 'en-IN-NeerjaExpressiveNeural' / 'en-IN-PrabhatNeural' / 'en-US-AvaNeural'
========================================================= */

const VOICE_CATALOG = {
  pallavi: {
    id: "pallavi",
    name: "ta-IN-PallaviNeural",
    displayName: "பல்லவி (Pallavi)",
    gender: "Female",
    lang: "tamil",
    desc: "மென்மையான பெண் குரல் • Warm Indian Tamil Female",
  },
  valluvar: {
    id: "valluvar",
    name: "ta-IN-ValluvarNeural",
    displayName: "வள்ளுவர் (Valluvar)",
    gender: "Male",
    lang: "tamil",
    desc: "கம்பீரமான ஆண் குரல் • Resonant Indian Tamil Male",
  },
  saranya: {
    id: "saranya",
    name: "ta-LK-SaranyaNeural",
    displayName: "சரண்யா (Saranya)",
    gender: "Female",
    lang: "tamil",
    desc: "அமைதியான பெண் குரல் • Calm Traditional Tamil Female",
  },
  neerja: {
    id: "neerja",
    name: "en-IN-NeerjaExpressiveNeural",
    displayName: "Neerja",
    gender: "Female",
    lang: "english",
    desc: "Expressive Indian English Female",
  },
  prabhat: {
    id: "prabhat",
    name: "en-IN-PrabhatNeural",
    displayName: "Prabhat",
    gender: "Male",
    lang: "english",
    desc: "Natural Indian English Male",
  },
  ava: {
    id: "ava",
    name: "en-US-AvaNeural",
    displayName: "Ava",
    gender: "Female",
    lang: "english",
    desc: "Global English Natural Female",
  },
};

/* Google TTS Fallback for offline or Edge downtime */
async function generateGoogleFallback(text, langCode) {
  const lang = langCode === "tamil" || langCode === "ta" ? "ta" : "en";
  const rawChunks = text.match(/[^.!?\n,]+[.!?\n,]+|[^.!?\n,]+$/g) || [text];
  const buffers = [];
  for (const c of rawChunks) {
    const trimmed = c.trim();
    if (!trimmed) continue;
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(trimmed)}&tl=${lang}&client=tw-ob`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    if (response.ok) {
      const arrBuf = await response.arrayBuffer();
      buffers.push(Buffer.from(arrBuf));
    }
  }
  return Buffer.concat(buffers);
}

/* Synthesize neural speech via MsEdgeTTS */
async function generateNeuralTtsBuffer(text, voiceKey = "pallavi", langCode = "tamil") {
  const cleanText = text.replace(/[*#_`~>]/g, "").trim();
  const isTa = langCode === "tamil" || langCode === "ta";
  
  let voiceConfig = VOICE_CATALOG[voiceKey];
  if (!voiceConfig || (isTa && voiceConfig.lang !== "tamil") || (!isTa && voiceConfig.lang !== "english")) {
    voiceConfig = isTa ? VOICE_CATALOG.pallavi : VOICE_CATALOG.neerja;
  }

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceConfig.name, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(cleanText);
    const chunks = [];
    return await new Promise((resolve, reject) => {
      audioStream.on("data", (chunk) => chunks.push(chunk));
      audioStream.on("end", () => {
        const fullBuf = Buffer.concat(chunks);
        if (fullBuf.length > 0) resolve(fullBuf);
        else reject(new Error("Empty audio buffer from Edge TTS"));
      });
      audioStream.on("error", (err) => reject(err));
    });
  } catch (edgeErr) {
    console.warn("Edge Neural TTS failed, using fallback:", edgeErr.message);
    return await generateGoogleFallback(cleanText, langCode);
  }
}

/* Endpoint to list all available voices */
app.get("/api/voices", (_req, res) => {
  res.json({ voices: Object.values(VOICE_CATALOG) });
});

/* GET /api/tts?text=...&voice=...&lang=... */
app.get("/api/tts", async (req, res) => {
  const text = (req.query.text || "").trim();
  const lang = req.query.lang || "tamil";
  const voice = req.query.voice || (lang === "tamil" ? "pallavi" : "neerja");
  if (!text) return res.status(400).send("Text is required");

  try {
    const audioBuffer = await generateNeuralTtsBuffer(text, voice, lang);
    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(500).send("Failed to generate audio");
    }
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Content-Length", audioBuffer.length);
    res.send(audioBuffer);
  } catch (err) {
    console.error("TTS endpoint error:", err.message);
    res.status(500).send("TTS error: " + err.message);
  }
});

/* POST /api/tts */
app.post("/api/tts", async (req, res) => {
  const text = (req.body?.text || "").trim();
  const lang = req.body?.lang || "tamil";
  const voice = req.body?.voice || (lang === "tamil" ? "pallavi" : "neerja");
  if (!text) return res.status(400).send("Text is required");

  try {
    const audioBuffer = await generateNeuralTtsBuffer(text, voice, lang);
    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(500).send("Failed to generate audio");
    }
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Content-Length", audioBuffer.length);
    res.send(audioBuffer);
  } catch (err) {
    console.error("TTS endpoint error:", err.message);
    res.status(500).send("TTS error: " + err.message);
  }
});

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", message: "Navarathiri AI Backend is running", knowledgeChars: KNOWLEDGE.length })
);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\nNavarathiri AI Backend running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
}

export default app;
