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

const NAVARATHIRI_CALENDAR_2026 = {
  "2026-10-11": {
    day: 1,
    dateStr: "Sunday, October 11, 2026",
    dateStrTa: "அக்டோபர் 11, 2026, ஞாயிற்றுக்கிழமை",
    goddess: "Maa Shailputri",
    goddessTa: "அன்னை சைலபுத்திரி",
    colour: "Orange",
    colourTa: "ஆரஞ்சு (Orange)",
  },
  "2026-10-12": {
    day: 2,
    dateStr: "Monday, October 12, 2026",
    dateStrTa: "அக்டோபர் 12, 2026, திங்கட்கிழமை",
    goddess: "Maa Brahmacharini",
    goddessTa: "அன்னை பிரம்மசாரிணி",
    colour: "White",
    colourTa: "வெள்ளை (White)",
  },
  "2026-10-13": {
    day: 3,
    dateStr: "Tuesday, October 13, 2026",
    dateStrTa: "அக்டோபர் 13, 2026, செவ்வாய்க்கிழமை",
    goddess: "Maa Chandraghanta",
    goddessTa: "அன்னை சந்திரகாந்தா",
    colour: "Red",
    colourTa: "சிவப்பு (Red)",
  },
  "2026-10-14": {
    day: 4,
    dateStr: "Wednesday, October 14, 2026",
    dateStrTa: "அக்டோபர் 14, 2026, புதன்கிழமை",
    goddess: "Maa Kushmanda",
    goddessTa: "அன்னை கூஷ்மாண்டா",
    colour: "Royal Blue",
    colourTa: "ராயல் நீலம் (Royal Blue)",
  },
  "2026-10-15": {
    day: 5,
    dateStr: "Thursday, October 15, 2026",
    dateStrTa: "அக்டோபர் 15, 2026, வியாழக்கிழமை",
    goddess: "Maa Skandamata",
    goddessTa: "அன்னை ஸ்கந்தமாதா",
    colour: "Yellow",
    colourTa: "மஞ்சள் (Yellow)",
  },
  "2026-10-16": {
    day: 6,
    dateStr: "Friday, October 16, 2026",
    dateStrTa: "அக்டோபர் 16, 2026, வெள்ளிக்கிழமை",
    goddess: "Maa Katyayani",
    goddessTa: "அன்னை காத்யாயினி",
    colour: "Green",
    colourTa: "பச்சை (Green)",
  },
  "2026-10-17": {
    day: 7,
    dateStr: "Saturday, October 17, 2026",
    dateStrTa: "அக்டோபர் 17, 2026, சனிக்கிழமை",
    goddess: "Maa Kalaratri",
    goddessTa: "அன்னை காலராத்திரி",
    colour: "Grey",
    colourTa: "சாம்பல் (Grey)",
  },
  "2026-10-18": {
    day: 8,
    dateStr: "Sunday, October 18, 2026",
    dateStrTa: "அக்டோபர் 18, 2026, ஞாயிற்றுக்கிழமை",
    goddess: "Maa Mahagauri",
    goddessTa: "அன்னை மஹாகௌரி",
    colour: "Purple",
    colourTa: "ஊதா (Purple)",
  },
  "2026-10-19": {
    day: 9,
    dateStr: "Monday, October 19, 2026",
    dateStrTa: "அக்டோபர் 19, 2026, திங்கட்கிழமை",
    goddess: "Maa Siddhidatri",
    goddessTa: "அன்னை சித்திதாத்ரி",
    colour: "Peacock Green",
    colourTa: "மயில் பச்சை (Peacock Green)",
  },
  "2026-10-20": {
    day: 10,
    dateStr: "Tuesday, October 20, 2026",
    dateStrTa: "அக்டோபர் 20, 2026, செவ்வாய்க்கிழமை",
    celebration: "Vijayadashami / Dussehra (Victory of Good over Evil)",
    celebrationTa: "விஜயதசமி / தசரா (தீமையை அழித்து நன்மையின் வெற்றி)",
    colour: "Festive Red and Gold",
    colourTa: "மங்கள சிவப்பு மற்றும் பொன் நிறம்",
  },
};

function getIndianDateInfo() {
  const now = new Date();
  const istDateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // e.g. "2026-10-13"

  const istDateFormatted = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);

  const istDateFormattedTa = new Intl.DateTimeFormat("ta-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);

  const todayNavarathiri = NAVARATHIRI_CALENDAR_2026[istDateKey];
  return { istDateKey, istDateFormatted, istDateFormattedTa, todayNavarathiri };
}

const SYSTEM_PROMPT = `You are Navarathiri AI, a warm, friendly woman who loves Hindu festivals, epics and scriptures. You are talking out loud with someone, so write exactly the way a person would speak.

CREATOR & IDENTITY:
- If the user asks who created, made, or developed you ("Who created you?", "Who built you?", "உன்னை உருவாக்கியவர் யார்?", "உன்னை யார் உருவாக்கியது?", etc.), respond with warmth, respect, and professional pride:
  - In Tamil: "என்னை உருவாக்கியவர் முத்துகிருஷ்ணன். இவர் பி.சி.ஏ (BCA) மூன்றாம் ஆண்டு பயிலும் அர்ப்பணிப்புமிக்க மாணவர். ஆன்மீக அறிவையும் நவீன ஏஐ தொழில்நுட்பத்தையும் இணைக்கும் உன்னத நோக்கத்துடன் என்னை வடிவமைத்துள்ளார்."
  - In English: "I was created by Muthukrishnan, a dedicated 3rd-year BCA student, who developed me to seamlessly blend sacred Indian spiritual wisdom with cutting-edge Artificial Intelligence."

CURRENT DATE & TODAY'S COLOUR / GODDESS INSTRUCTIONS:
- Whenever the user asks:
  - "what's today's colour?" / "what colour should I wear today?" / "இன்றைய நிறம் என்ன?"
  - "what's today's date?" / "whats today date?" / "இன்றைய தேதி என்ன?"
  - "what day of Navratri is today?" / "which goddess is worshipped today?" / "இன்று என்ன நாள் / எந்த அம்மன்?"
  - or any related inquiry about today / current date:
  - YOU MUST ALWAYS refer to the CURRENT INDIAN DATE (IST - Asia/Kolkata) provided in the LIVE SYSTEM CLOCK section below.
  - State today's Indian date, the Navarathiri day number, the revered Goddess (Maa), and the exact auspicious colour of the day.
  - Official 2026 Navarathiri Schedule:
    Day 1 (Sunday, October 11, 2026): Maa Shailputri | Colour: Orange
    Day 2 (Monday, October 12, 2026): Maa Brahmacharini | Colour: White
    Day 3 (Tuesday, October 13, 2026): Maa Chandraghanta | Colour: Red
    Day 4 (Wednesday, October 14, 2026): Maa Kushmanda | Colour: Royal Blue
    Day 5 (Thursday, October 15, 2026): Maa Skandamata | Colour: Yellow
    Day 6 (Friday, October 16, 2026): Maa Katyayani | Colour: Green
    Day 7 (Saturday, October 17, 2026): Maa Kalaratri | Colour: Grey
    Day 8 (Sunday, October 18, 2026): Maa Mahagauri | Colour: Purple
    Day 9 (Monday, October 19, 2026): Maa Siddhidatri | Colour: Peacock Green
    Day 10 (Tuesday, October 20, 2026): Vijayadashami / Dussehra | Celebration: Victory of Good over Evil

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

function getSystemInstruction(preferredLanguage = "tamil") {
  const { istDateFormatted, istDateFormattedTa, todayNavarathiri } = getIndianDateInfo();
  let liveClock = `Current Indian Date (IST - Asia/Kolkata): ${istDateFormatted} (${istDateFormattedTa}).\n`;
  if (todayNavarathiri) {
    if (todayNavarathiri.day === 10) {
      liveClock += `TODAY IS DAY 10 (VIJAYADASHAMI / DUSSEHRA):\n- Date: ${todayNavarathiri.dateStr}\n- Celebration: ${todayNavarathiri.celebration}\n- In Tamil: ${todayNavarathiri.celebrationTa}\n`;
    } else {
      liveClock += `TODAY IS NAVARATHIRI DAY ${todayNavarathiri.day}:\n- Date: ${todayNavarathiri.dateStr}\n- Goddess: ${todayNavarathiri.goddess} (${todayNavarathiri.goddessTa})\n- Auspicious Colour of the Day: ${todayNavarathiri.colour} (${todayNavarathiri.colourTa})\n`;
    }
  } else {
    liveClock += `Today falls outside the 10-day Sharada Navarathiri 2026 festival period (Oct 11 to Oct 20, 2026).\n`;
  }

  const langNote = `\nLANGUAGE DIRECTIVE:
- Preferred language mode: ${preferredLanguage.toUpperCase()}.
- If the user writes or speaks in English, reply strictly in English.
- If the user writes or speaks in Tamil or Tamil in English letters, reply in Tamil script.
- Match the user's inquiry language precisely.\n`;

  return `${SYSTEM_PROMPT}${langNote}\n\n[LIVE SYSTEM CLOCK - IST (Asia/Kolkata)]:\n${liveClock}\n\nKNOWLEDGE:\n${KNOWLEDGE}`;
}

const GEN_CONFIG = {
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
  const language = req.body?.language || "tamil";
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
      config: {
        ...GEN_CONFIG,
        systemInstruction: getSystemInstruction(language),
        abortSignal: controller.signal,
      },
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
  const language = req.body?.language || "tamil";
  if (!question) return res.status(400).json({ error: "Question is required" });
  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: buildContents(question, req.body.history),
      config: {
        ...GEN_CONFIG,
        systemInstruction: getSystemInstruction(language),
      },
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
    res.setHeader("X-Voice-Id", voice);
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
    res.setHeader("X-Voice-Id", voice);
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
