import { useEffect, useRef, useState } from "react";
import "./App.css";
import "./sundarakanda.css";
import { askGemini } from "./services/geminiService";

/* =========================================================
   NAVARATHIRI NINE FORMS (NAVADURGA) METADATA
========================================================= */

const NAVARATHIRI_DAYS = {
  1: {
    goddess: "Shailaputri",
    goddessTamil: "சைலபுத்திரி",
    color: "Golden Yellow",
    colorTamil: "பொன் மஞ்சள்",
    colorCode: "#f59e0b",
    vahana: "Nandi (Bull)",
    vahanaTamil: "நந்தி பகவான்",
    mantra: "ॐ देवी शैलपुत्र्यै नमः",
    significanceEn: "Goddess of the Himalayas, representing purity, patience, and awakening of spiritual devotion.",
    significanceTa: "இமயத்தின் மகள். தூய்மை, பொறுமை மற்றும் முதல் ஆன்மீக விழிப்புணர்வின் சின்னம்.",
  },
  2: {
    goddess: "Brahmacharini",
    goddessTamil: "பிரம்மசாரிணி",
    color: "Peacock Green",
    colorTamil: "பச்சை",
    colorCode: "#10b981",
    vahana: "Barefoot (Ascetic)",
    vahanaTamil: "தவக்கோலம்",
    mantra: "ॐ देवी ब्रह्मचारिण्यै नमः",
    significanceEn: "Embodiment of penance, discipline, calm devotion, and relentless spiritual effort.",
    significanceTa: "தவத்தின் தாய். மன உறுதி, அடக்கம் மற்றும் தியாகத்தின் வடிவமாக விளங்குபவர்.",
  },
  3: {
    goddess: "Chandraghanta",
    goddessTamil: "சந்திரகாந்தா",
    color: "Ash Grey & Silver",
    colorTamil: "சாம்பல் நிறம்",
    colorCode: "#94a3b8",
    vahana: "Tiger / Lion",
    vahanaTamil: "புலி வாகனம்",
    mantra: "ॐ देवी चन्द्रघण्टायै नमः",
    significanceEn: "Bearer of the crescent bell moon. Grants immense courage and dispels all evil spirits.",
    significanceTa: "பிறைச்சந்திரன் கொண்டவள். தைரியம் தந்து அச்சங்களை அகற்றி தீமைகளை அழிப்பவள்.",
  },
  4: {
    goddess: "Kushmanda",
    goddessTamil: "கூஷ்மாண்டா",
    color: "Radiant Orange",
    colorTamil: "ஆரஞ்சு",
    colorCode: "#ea580c",
    vahana: "Lion",
    vahanaTamil: "சிம்ம வாகனம்",
    mantra: "ॐ देवी कूष्माण्डायै नमः",
    significanceEn: "Creator of the cosmic egg through her divine smiling luminescence; source of all light.",
    significanceTa: "புன்னகையால் பிரபஞ்சத்தை உருவாக்கியவள்; சூரியனின் பிரகாசத்தை அளிப்பவள்.",
  },
  5: {
    goddess: "Skandamata",
    goddessTamil: "ஸ்கந்தமாதா",
    color: "Sacred White",
    colorTamil: "வெள்ளை",
    colorCode: "#f8fafc",
    vahana: "Lion",
    vahanaTamil: "சிம்ம வாகனம்",
    mantra: "ॐ देवी स्कन्दमात्रे नमः",
    significanceEn: "Mother of Lord Muruga (Skanda). Bestows eternal maternal grace, knowledge, and salvation.",
    significanceTa: "முருகனின் தாய். தாய்மையின் கருணை, பேரறிவு மற்றும் முக்தியை அருள்பவள்.",
  },
  6: {
    goddess: "Katyayani",
    goddessTamil: "காத்யாயினி",
    color: "Ruby Red",
    colorTamil: "சிவப்பு",
    colorCode: "#dc2626",
    vahana: "Lion",
    vahanaTamil: "சிம்ம வாகனம்",
    mantra: "ॐ देवी कात्यायन्यै नमः",
    significanceEn: "Fierce warrior incarnation born to sage Katyayana. Slayer of the demon Mahishasura.",
    significanceTa: "காத்யாயன முனிவரின் மகள்; மகிஷாசுரனை வதம் செய்த வீரத்தின் தெய்வம்.",
  },
  7: {
    goddess: "Kalaratri",
    goddessTamil: "காலராத்திரி",
    color: "Royal Midnight Blue",
    colorTamil: "நீலம்",
    colorCode: "#2563eb",
    vahana: "Donkey / Dark Steed",
    vahanaTamil: "கழுதை வாகனம்",
    mantra: "ॐ देवी कालरात्र्यै नमः",
    significanceEn: "Darkest night of dissolution. Destroyer of darkness, ignorance, and fears; the fierce protector.",
    significanceTa: "இருளையும் அஞ்ஞானத்தையும் அழிக்கும் வீர காளி. பக்தர்களை காக்கும் சுபங்கரி.",
  },
  8: {
    goddess: "Mahagauri",
    goddessTamil: "மஹாகௌரி",
    color: "Pink & Auspicious Saffron",
    colorTamil: "இளஞ்சிவப்பு",
    colorCode: "#ec4899",
    vahana: "White Bull",
    vahanaTamil: "வெள்ளை நந்தி",
    mantra: "ॐ देवी महागौर्यै नमः",
    significanceEn: "Goddess of profound purity, calm, and forgiveness. Fulfills sincere inner prayers.",
    significanceTa: "தூய்மை மற்றும் அமைதியின் வடிவம். பாவங்களை நீக்கி மன அமைதி தருபவள்.",
  },
  9: {
    goddess: "Siddhidatri",
    goddessTamil: "சித்திதாத்ரி",
    color: "Imperial Purple",
    colorTamil: "ஊதா",
    colorCode: "#7c3aed",
    vahana: "Lotus & Lion",
    vahanaTamil: "தாமரை ஆசனம்",
    mantra: "ॐ देवी सिद्धिदात्र्यै नमः",
    significanceEn: "Granter of all 26 supernatural attainments (Siddhis). The culmination of divine bliss.",
    significanceTa: "அனைத்து சித்துக்களையும் ஞானத்தையும் அருள்பவள்; நவசக்தியின் நிறைவு வடிவம்.",
  },
};

/* =========================================================
   TOPIC CATEGORIES & CURATED DEVOTIONAL PROMPTS
========================================================= */

const DEVOTIONAL_CATEGORIES = [
  { id: "all", labelEn: "All Devotions", labelTa: "அனைத்தும்", icon: "✦" },
  { id: "navarathiri", labelEn: "Navarathiri 9 Days", labelTa: "நவராத்திரி 9 நாட்கள்", icon: "🪔" },
  { id: "sundarakanda", labelEn: "Sundarakanda", labelTa: "சுந்தரகாண்டம்", icon: "🙏" },
  { id: "ramayana", labelEn: "Ramayana", labelTa: "ராமாயணம்", icon: "🏹" },
  { id: "mahabharata", labelEn: "Mahabharata & Gita", labelTa: "மகாபாரதம் & கீதை", icon: "⚔️" },
];

const DEVOTIONAL_PROMPTS = [
  {
    category: "all",
    icon: "👨‍💻",
    textEn: "Who created you and what is your purpose?",
    textTa: "உங்களை உருவாக்கியவர் யார்?",
  },
  {
    category: "navarathiri",
    icon: "🪔",
    textEn: "What is the spiritual significance of Navarathiri?",
    textTa: "நவராத்திரி திருவிழாவின் ஆன்மீக தத்துவம் என்ன?",
  },
  {
    category: "navarathiri",
    icon: "🌸",
    textEn: "Tell me about Day 1 Goddess Shailaputri",
    textTa: "முதல் நாள் அம்மன் சைலபுத்திரி பற்றி கூறுங்கள்",
  },
  {
    category: "navarathiri",
    icon: "🪷",
    textEn: "What are the 9 forms of Goddess Durga?",
    textTa: "நவராத்திரியின் 9 நவதுர்க்கை வடிவங்கள் யாவை?",
  },
  {
    category: "navarathiri",
    icon: "🎎",
    textEn: "Why is Golu kept during Navarathiri?",
    textTa: "நவராத்திரியில் கொலு வைப்பதன் ஆன்மீக தத்துவம் என்ன?",
  },
  {
    category: "navarathiri",
    icon: "🌺",
    textEn: "What is Day 9 Siddhidatri and Vijayadashami?",
    textTa: "ஒன்பதாம் நாள் சித்திதாத்ரி மற்றும் விஜயதசமி சிறப்பு என்ன?",
  },
  {
    category: "sundarakanda",
    icon: "🌊",
    textEn: "Tell me about Hanuman's leap across the ocean",
    textTa: "சுந்தரகாண்டத்தில் அனுமனின் சமுத்திர தாண்டவம் பற்றி கூறுங்கள்",
  },
  {
    category: "sundarakanda",
    icon: "🌸",
    textEn: "Where did Hanuman find Mother Sita in Lanka?",
    textTa: "இலங்கையில் அன்னை சீதையை அனுமன் எங்கு கண்டார்?",
  },
  {
    category: "sundarakanda",
    icon: "🔥",
    textEn: "Tell me about the burning of Lanka (Lanka Dahanam)",
    textTa: "அனுமன் இலங்கையை எரித்த நிகழ்வு (லங்கா தகனம்) பற்றி கூறுங்கள்",
  },
  {
    category: "sundarakanda",
    icon: "💎",
    textEn: "What was the significance of the Chudamani?",
    textTa: "சீதை அனுமனிடம் கொடுத்த சூடாமணியின் அடையாளம் என்ன?",
  },
  {
    category: "sundarakanda",
    icon: "🙏",
    textEn: "Why is chanting Sundarakanda auspicious?",
    textTa: "சுந்தரகாண்டம் பாராயணம் செய்வதன் நன்மைகள் என்ன?",
  },
  {
    category: "ramayana",
    icon: "🏹",
    textEn: "What is the central message of Ramayana?",
    textTa: "ஸ்ரீ ராமாயணத்தின் மையக்கதை மற்றும் தர்ம நெறி என்ன?",
  },
  {
    category: "ramayana",
    icon: "👑",
    textEn: "Tell me about Rama's unwavering devotion to Dharma",
    textTa: "ஸ்ரீ ராமரின் தர்ம நெறி மற்றும் சத்தியம் பற்றி கூறுங்கள்",
  },
  {
    category: "ramayana",
    icon: "🕊️",
    textEn: "Who was Jatayu and what was his supreme sacrifice?",
    textTa: "ஜடாயுவின் வீரமும் தியாகமும் பற்றி விவரிக்கவும்",
  },
  {
    category: "mahabharata",
    icon: "⚔️",
    textEn: "Tell me about the Kurukshetra War and Mahabharata",
    textTa: "மகாபாரதம் மற்றும் குருக்ஷேத்திர போரின் பின்னணி என்ன?",
  },
  {
    category: "mahabharata",
    icon: "🪷",
    textEn: "What is the core teaching of Bhagavad Gita?",
    textTa: "ஸ்ரீமத் பகவத் கீதையின் சாராம்ச உபதேசம் என்ன?",
  },
  {
    category: "mahabharata",
    icon: "🏹",
    textEn: "Who were the Pandavas and what were their virtues?",
    textTa: "பஞ்ச பாண்டவர்கள் யார் மற்றும் அவர்களின் நற்குணங்கள் என்ன?",
  },
  {
    category: "mahabharata",
    icon: "📖",
    textEn: "What is Karma Yoga taught by Lord Krishna?",
    textTa: "கர்ம யோகம் குறித்து பகவான் கிருஷ்ணர் போதித்தது என்ன?",
  },
];

/* =========================================================
   VISUAL DETECTOR
========================================================= */

const detectVisual = (question) => {
  const q = String(question || "").toLowerCase();

  /* Navarathiri day match */
  const dayMatch = q.match(/(?:day|நாள்)\s*(\d)/);
  if (dayMatch) {
    const day = parseInt(dayMatch[1], 10);
    if (day >= 1 && day <= 9) {
      return {
        type: "navarathiri-day",
        day,
        ...NAVARATHIRI_DAYS[day],
      };
    }
  }

  /* Tamil day words */
  const tamilDayWords = {
    முதல்: 1, முதலா: 1, ஒன்றா: 1,
    இரண்டா: 2, இரண்டா: 2,
    மூன்றா: 3, மூன்றா: 3,
    நான்கா: 4, நாலா: 4,
    ஐந்தா: 5, அஞ்சா: 5,
    ஆறா: 6,
    ஏழா: 7,
    எட்டா: 8,
    ஒன்பதா: 9,
  };

  for (const [word, day] of Object.entries(tamilDayWords)) {
    if (q.includes(word) && (q.includes("நாள்") || q.includes("நவராத்திரி") || q.includes("அம்மன்"))) {
      return {
        type: "navarathiri-day",
        day,
        ...NAVARATHIRI_DAYS[day],
      };
    }
  }

  /* Specific Goddess Names */
  for (const [dayNum, info] of Object.entries(NAVARATHIRI_DAYS)) {
    if (
      q.includes(info.goddess.toLowerCase()) ||
      q.includes(info.goddessTamil.toLowerCase())
    ) {
      return {
        type: "navarathiri-day",
        day: parseInt(dayNum, 10),
        ...info,
      };
    }
  }

  /* Sundarakanda */
  if (
    q.includes("sundarakanda") ||
    q.includes("sundara kanda") ||
    q.includes("சுந்தரகாண்டம்") ||
    q.includes("சுந்தர காண்டம்")
  ) {
    return { type: "sundarakanda" };
  }

  /* Ramayana */
  if (
    q.includes("ramayana") ||
    q.includes("ராமாயணம்") ||
    q.includes("ராமன்") ||
    q.includes("சீதை") ||
    q.includes("லட்சுமணன்")
  ) {
    return { type: "ramayana" };
  }

  /* Mahabharata */
  if (
    q.includes("mahabharata") ||
    q.includes("மகாபாரதம்") ||
    q.includes("kurukshetra") ||
    q.includes("குருக்ஷேத்திரம்") ||
    q.includes("பாண்டவர்")
  ) {
    return { type: "mahabharata" };
  }

  /* Bhagavad Gita */
  if (
    q.includes("gita") ||
    q.includes("கீதை") ||
    q.includes("கிருஷ்ணர்") ||
    q.includes("அர்ஜுனன்")
  ) {
    return { type: "gita" };
  }

  /* Navarathiri general */
  if (
    q.includes("navarathiri") ||
    q.includes("navaratri") ||
    q.includes("navratri") ||
    q.includes("நவராத்திரி") ||
    q.includes("golu") ||
    q.includes("kolu") ||
    q.includes("கொலு")
  ) {
    return { type: "navarathiri" };
  }

  /* Creator / Developer */
  if (
    q.includes("create") ||
    q.includes("creator") ||
    q.includes("who made you") ||
    q.includes("developed") ||
    q.includes("muthukrishnan") ||
    q.includes("உருவாக்கிய") ||
    q.includes("யார் செய்த")
  ) {
    return { type: "creator" };
  }

  return null;
};

/* =========================================================
   APP COMPONENT
========================================================= */

function App() {
  const [language, setLanguage] = useState("tamil");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [conversation, setConversation] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [speakingConversationId, setSpeakingConversationId] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const conversationEndRef = useRef(null);
  const activeAudioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const activeSourceRef = useRef(null);

  /* Devotional Voice Persona Acoustic Profiles */
  const VOICE_PROFILES = {
    pallavi: {
      id: "pallavi",
      displayName: "பல்லவி (Pallavi)",
      gender: "female",
      lang: "tamil",
      speechPitch: 1.15,
      speechRate: 0.98,
      matchTerms: ["pallavi", "tamil", "ta-in", "ta", "india", "female"],
      detune: 160,
      eq: { low: 0, high: 3 },
    },
    valluvar: {
      id: "valluvar",
      displayName: "வள்ளுவர் (Valluvar)",
      gender: "male",
      lang: "tamil",
      speechPitch: 0.76,
      speechRate: 0.90,
      matchTerms: ["valluvar", "male", "tamil", "ta-in", "ta"],
      detune: -280,
      eq: { low: 6, high: -3 },
    },
    saranya: {
      id: "saranya",
      displayName: "சரண்யா (Saranya)",
      gender: "female",
      lang: "tamil",
      speechPitch: 0.96,
      speechRate: 0.85,
      matchTerms: ["saranya", "tamil", "ta-lk", "ta-in", "ta", "female"],
      detune: -40,
      eq: { low: 2, high: -1 },
    },
    neerja: {
      id: "neerja",
      displayName: "Neerja",
      gender: "female",
      lang: "english",
      speechPitch: 1.12,
      speechRate: 0.98,
      matchTerms: ["neerja", "en-in", "india", "female"],
      detune: 140,
      eq: { low: 0, high: 2 },
    },
    prabhat: {
      id: "prabhat",
      displayName: "Prabhat",
      gender: "male",
      lang: "english",
      speechPitch: 0.82,
      speechRate: 0.94,
      matchTerms: ["prabhat", "en-in", "india", "male"],
      detune: -240,
      eq: { low: 5, high: -2 },
    },
    ava: {
      id: "ava",
      displayName: "Ava",
      gender: "female",
      lang: "english",
      speechPitch: 1.05,
      speechRate: 1.00,
      matchTerms: ["ava", "en-us", "natural", "female"],
      detune: 60,
      eq: { low: 0, high: 1 },
    },
  };

  /* Pre-cache browser voices */
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const load = () => {
        try {
          window.speechSynthesis.getVoices();
        } catch (e) {}
      };
      load();
      if (typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
        window.speechSynthesis.onvoiceschanged = load;
      }
    }
  }, []);

  /* Prime / Unlock browser audio on user gesture */
  const unlockAudio = () => {
    try {
      if (!window.__audioUnlocked) {
        const silentAudio = new Audio(
          "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
        );
        silentAudio.play().then(() => {
          silentAudio.pause();
          window.__audioUnlocked = true;
        }).catch(() => {});
      }
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
    } catch (e) {}
  };

  /* Stop Speaking */
  const stopSpeaking = () => {
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
        activeSourceRef.current.disconnect();
      } catch (e) {}
      activeSourceRef.current = null;
    }
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch (e) {}
      activeAudioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setIsSpeaking(false);
    setSpeakingConversationId(null);
  };

  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem("navarathiri_voice") || "pallavi";
  });

  /* Play Audio via Server with Web Audio Acoustic Persona Processing */
  const speakViaServerAudio = async (cleanText, profile, conversationId) => {
    try {
      const langParam = language === "tamil" ? "ta" : "en";
      const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=${langParam}&voice=${encodeURIComponent(profile.id)}&t=${Date.now()}`;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") {
          await ctx.resume();
        }

        const resp = await fetch(audioUrl);
        if (!resp.ok) throw new Error("Server TTS status: " + resp.status);
        const arrayBuf = await resp.arrayBuffer();
        const audioBuf = await ctx.decodeAudioData(arrayBuf);

        const sourceNode = ctx.createBufferSource();
        sourceNode.buffer = audioBuf;

        // Apply pitch detuning
        if (sourceNode.detune && typeof profile.detune === "number") {
          sourceNode.detune.value = profile.detune;
        }

        // Apply acoustic persona equalizer
        const bassNode = ctx.createBiquadFilter();
        bassNode.type = "lowshelf";
        bassNode.frequency.value = 320;
        bassNode.gain.value = profile.eq.low;

        const trebleNode = ctx.createBiquadFilter();
        trebleNode.type = "highshelf";
        trebleNode.frequency.value = 3000;
        trebleNode.gain.value = profile.eq.high;

        sourceNode.connect(bassNode);
        bassNode.connect(trebleNode);
        trebleNode.connect(ctx.destination);

        activeSourceRef.current = sourceNode;

        sourceNode.onended = () => {
          setIsSpeaking(false);
          setSpeakingConversationId(null);
          activeSourceRef.current = null;
        };

        setIsSpeaking(true);
        setSpeakingConversationId(conversationId);
        sourceNode.start(0);
        return;
      }

      // Fallback HTML5 Audio element
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;
      audio.onplay = () => {
        setIsSpeaking(true);
        setSpeakingConversationId(conversationId);
      };
      audio.onended = () => {
        setIsSpeaking(false);
        setSpeakingConversationId(null);
        activeAudioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setSpeakingConversationId(null);
        activeAudioRef.current = null;
      };
      await audio.play();
    } catch (err) {
      console.warn("Server audio playback failed:", err);
      setIsSpeaking(false);
      setSpeakingConversationId(null);
    }
  };

  /* Primary High-Fidelity Speak */
  const speakAnswer = async (text, conversationId = null) => {
    if (!text) return;

    stopSpeaking();
    setIsSpeaking(true);
    setSpeakingConversationId(conversationId);

    const cleanText = String(text).replace(/[*#_`~>]/g, "").trim();
    const profile = VOICE_PROFILES[selectedVoice] || VOICE_PROFILES.pallavi;
    const isTamil = language === "tamil";

    // 1. Try Browser SpeechSynthesis first (direct on client, zero 403 blocks)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        const voices = window.speechSynthesis.getVoices();
        const langVoices = voices.filter((v) => {
          const vl = (v.lang || "").toLowerCase();
          return isTamil ? vl.startsWith("ta") : vl.startsWith("en");
        });

        if (langVoices.length > 0) {
          let matchedVoice = null;
          for (const term of profile.matchTerms) {
            matchedVoice = langVoices.find((v) =>
              (v.name || "").toLowerCase().includes(term)
            );
            if (matchedVoice) break;
          }
          if (!matchedVoice) {
            if (profile.gender === "male") {
              matchedVoice =
                langVoices.find((v) =>
                  (v.name || "").toLowerCase().includes("male")
                ) || langVoices[0];
            } else {
              matchedVoice =
                langVoices.find((v) =>
                  (v.name || "").toLowerCase().includes("female")
                ) || langVoices[0];
            }
          }

          window.speechSynthesis.cancel();
          window.speechSynthesis.resume();

          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.voice = matchedVoice;
          utterance.lang = matchedVoice.lang || (isTamil ? "ta-IN" : "en-IN");
          utterance.pitch = profile.speechPitch;
          utterance.rate = profile.speechRate;

          utterance.onstart = () => {
            setIsSpeaking(true);
            setSpeakingConversationId(conversationId);
          };
          utterance.onend = () => {
            setIsSpeaking(false);
            setSpeakingConversationId(null);
          };
          utterance.onerror = (e) => {
            console.warn("SpeechSynthesis error, falling back to server audio:", e);
            speakViaServerAudio(cleanText, profile, conversationId);
          };

          window.speechSynthesis.speak(utterance);
          return;
        }
      } catch (synthErr) {
        console.warn("SpeechSynthesis error:", synthErr);
      }
    }

    // 2. Secondary: Server Audio with Web Audio Acoustic Persona Engine
    speakViaServerAudio(cleanText, profile, conversationId);
  };

  /* Voice Preview */
  const previewVoice = (voiceKey) => {
    unlockAudio();
    stopSpeaking();
    setSelectedVoice(voiceKey);
    localStorage.setItem("navarathiri_voice", voiceKey);

    const sample =
      voiceKey === "valluvar"
        ? "வணக்கம்! நான் வள்ளுவர், நவசக்தி மற்றும் இதிகாச ஞானத்தை பேசுகிறேன்."
        : voiceKey === "saranya"
        ? "வணக்கம்! நான் சரண்யா, அம்பிகையின் நவசக்தி அருள் பற்றி பேசுகிறேன்."
        : voiceKey === "neerja"
        ? "Greetings! I am Neerja, your spiritual knowledge assistant."
        : voiceKey === "prabhat"
        ? "Greetings! I am Prabhat, ready to share epic wisdom."
        : voiceKey === "ava"
        ? "Hello! I am Ava, your divine voice assistant."
        : "வணக்கம்! நான் பல்லவி, உங்கள் அன்பான நவசக்தி உதவியாளர்.";

    speakAnswer(sample);
  };

  /* Ask Question */
  const findAnswer = async (userQuestion) => {
    const text = String(userQuestion || "").trim();
    if (!text || isLoading) return;

    unlockAudio();
    stopSpeaking();

    const id = `${Date.now()}-${Math.random()}`;
    setQuestion(text);
    setAnswer("");
    setChartData(null);
    setIsLoading(true);

    setConversation((prev) => [
      ...prev,
      {
        id,
        question: text,
        answer: null,
        chart: null,
        language,
        isLoading: true,
      },
    ]);

    setSelectedConversationId(id);

    try {
      const history = conversation
        .filter((c) => c.answer && !c.isLoading)
        .slice(-5)
        .map((c) => ({
          question: c.question,
          answer: c.answer,
        }));

      const aiAnswer = await askGemini(text, language, history);
      const visual = detectVisual(text);

      setConversation((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                answer: aiAnswer,
                chart: visual,
                isLoading: false,
              }
            : c
        )
      );

      setAnswer(aiAnswer);
      setChartData(visual);
      setIsLoading(false);

      speakAnswer(aiAnswer, id);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg =
        language === "tamil"
          ? "மன்னிக்கவும், தெய்வீக AI பதில் பெற இயலவில்லை. இணைய இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்."
          : "Sorry, I couldn't reach the divine AI wisdom. Please verify your connection and try again.";

      setConversation((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                answer: errorMsg,
                isLoading: false,
                isError: true,
              }
            : c
        )
      );

      setAnswer(errorMsg);
      setIsLoading(false);
    }
  };

  /* Text Submit */
  const handleTextSubmit = (e) => {
    e.preventDefault();
    unlockAudio();
    const text = textInput.trim();
    if (!text || isLoading) return;
    setTextInput("");
    findAnswer(text);
  };

  /* Speech Recognition */
  const startListening = () => {
    unlockAudio();
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const message =
        language === "tamil"
          ? "இந்த உலாவியில் (browser) குரல் வழி அறிதல் வசதி இல்லை."
          : "Voice recognition is not supported in this browser.";
      setAnswer(message);
      return;
    }

    if (isLoading) return;

    stopSpeaking();

    const recognition = new SpeechRecognition();
    recognition.lang = language === "tamil" ? "ta-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setIsListening(false);
      findAnswer(spokenText);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setAnswer(
        language === "tamil"
          ? "குரலைக் கேட்பதில் சிறு தடங்கல் ஏற்பட்டது. மீண்டும் ஒருமுறை பேசவும்."
          : "There was a momentary hiccup with voice listening. Please try again."
      );
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  /* Clear History */
  const clearHistory = () => {
    stopSpeaking();
    setConversation([]);
    setSelectedConversationId(null);
    setQuestion("");
    setAnswer("");
    setChartData(null);
  };

  /* Start New Inquiry */
  const startNewInquiry = () => {
    stopSpeaking();
    setSelectedConversationId(null);
    setQuestion("");
    setAnswer("");
    setChartData(null);
  };

  /* Language Switcher */
  const changeLanguage = (newLanguage) => {
    stopSpeaking();
    setLanguage(newLanguage);
    if (newLanguage === "tamil" && !["pallavi", "valluvar", "saranya"].includes(selectedVoice)) {
      setSelectedVoice("pallavi");
      localStorage.setItem("navarathiri_voice", "pallavi");
    } else if (newLanguage === "english" && !["neerja", "prabhat", "ava"].includes(selectedVoice)) {
      setSelectedVoice("neerja");
      localStorage.setItem("navarathiri_voice", "neerja");
    }
  };

  /* Current Active Conversation Item */
  const selectedConversation = conversation.find(
    (item) => item.id === selectedConversationId
  );

  /* History Icon */
  const getHistoryIcon = (item) => {
    const text = (item.question || "").toLowerCase();
    if (text.includes("sundarakanda") || text.includes("சுந்தரகாண்டம்")) return "🙏";
    if (text.includes("ramayana") || text.includes("ராமாயணம்")) return "🏹";
    if (text.includes("mahabharata") || text.includes("மகாபாரதம்")) return "⚔️";
    if (text.includes("gita") || text.includes("கீதை")) return "📖";
    if (text.includes("navarathiri") || text.includes("நவராத்திரி")) return "🪔";
    return "✦";
  };

  /* Filtered Prompts */
  const visiblePrompts =
    activeCategory === "all"
      ? DEVOTIONAL_PROMPTS
      : DEVOTIONAL_PROMPTS.filter((p) => p.category === activeCategory);

  /* Render Visual Card */
  const renderVisual = (visual) => {
    if (!visual) return null;

    /* 1. NAVARATHIRI DAY */
    if (visual.type === "navarathiri-day") {
      const info = NAVARATHIRI_DAYS[visual.day] || visual;
      return (
        <div className="visual-card devotional-sanctum-card">
          <div className="visual-header">
            <span className="visual-header-badge">
              🌸 {language === "tamil" ? `நவராத்திரி நாள் ${visual.day}` : `Navarathiri Day ${visual.day}`}
            </span>
            <span className="devotional-mantra-pill">{info.mantra}</span>
          </div>

          <div className="single-day-visual">
            <div
              className="single-day-number"
              style={{
                boxShadow: `0 0 24px ${info.colorCode}55`,
                border: `2px solid ${info.colorCode}`,
              }}
            >
              <span>{visual.day}</span>
              <small>{language === "tamil" ? "நாள்" : "DAY"}</small>
            </div>

            <div className="single-day-content">
              <div className="day-meta-tags">
                <span className="meta-tag color-tag" style={{ borderColor: info.colorCode }}>
                  🎨 {language === "tamil" ? `வர்ணம்: ${info.colorTamil}` : `Color: ${info.color}`}
                </span>
                <span className="meta-tag vahana-tag">
                  🦁 {language === "tamil" ? `வாகனம்: ${info.vahanaTamil}` : `Vahana: ${info.vahana}`}
                </span>
              </div>

              <h3>
                {language === "tamil" ? info.goddessTamil : info.goddess}
                <span className="divine-epithet">
                  {language === "tamil" ? " • ஸ்ரீ நவதுர்க்கை" : " • Sri Navadurga"}
                </span>
              </h3>

              <p className="day-significance-text">
                {language === "tamil" ? info.significanceTa : info.significanceEn}
              </p>
            </div>
          </div>
        </div>
      );
    }

    /* 2. SUNDARAKANDA */
    if (visual.type === "sundarakanda") {
      return (
        <div className="visual-card devotional-sanctum-card">
          <div className="visual-header">
            <span className="visual-header-badge">🙏 {language === "tamil" ? "சுந்தரகாண்ட யாத்திரை" : "Sundarakanda Journey"}</span>
            <span className="devotional-mantra-pill">|| ஜெய ஸ்ரீ ராம் • ஸ்ரீ ராமதூத போற்றி ||</span>
          </div>

          <div className="epic-visual">
            <div className="epic-icon">🙏</div>
            <div className="epic-content">
              <h3>{language === "tamil" ? "சுந்தரகாண்டம் — அனுமனின் தர்ம தூது" : "Sundarakanda — The Heroic Mission of Hanuman"}</h3>

              <div className="epic-flow">
                <span className="flow-step">🌊 {language === "tamil" ? "சமுத்திர தாண்டவம்" : "Ocean Leap"}</span>
                <b>→</b>
                <span className="flow-step">🏰 {language === "tamil" ? "அசோக வனம்" : "Ashoka Vatika"}</span>
                <b>→</b>
                <span className="flow-step">🌸 {language === "tamil" ? "சீதாதேவி தரிசனம்" : "Meeting Sita"}</span>
                <b>→</b>
                <span className="flow-step">🔥 {language === "tamil" ? "லங்கா தகனம்" : "Burning Lanka"}</span>
                <b>→</b>
                <span className="flow-step">💎 {language === "tamil" ? "சூடாமணி ஒப்படைப்பு" : "Chudamani to Rama"}</span>
              </div>

              <p>
                {language === "tamil"
                  ? "வாழ்க்கையில் தன்னம்பிக்கை, விசுவாசம், மற்றும் தடைகளை வெல்லும் மனவலிமையை தரும் ஸ்ரீ அனுமனின் திவ்விய காண்டம்."
                  : "A sublime chronicle of boundless devotion, humility, courage, and ultimate triumph over impossible odds."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    /* 3. RAMAYANA */
    if (visual.type === "ramayana") {
      return (
        <div className="visual-card devotional-sanctum-card">
          <div className="visual-header">
            <span className="visual-header-badge">🏹 {language === "tamil" ? "ஸ்ரீ ராமாயண இதிகாசம்" : "Sri Ramayana Epic"}</span>
            <span className="devotional-mantra-pill">|| மர்யாதா புருஷோத்தமன் ||</span>
          </div>

          <div className="epic-visual">
            <div className="epic-icon">🏹</div>
            <div className="epic-content">
              <h3>{language === "tamil" ? "ஸ்ரீ ராமாயணம் — தர்மத்தின் வாழ்வு" : "Sri Ramayana — Path of Eternal Dharma"}</h3>

              <div className="epic-flow">
                <span className="flow-step">👑 {language === "tamil" ? "அயோத்தி" : "Ayodhya"}</span>
                <b>→</b>
                <span className="flow-step">🌳 {language === "tamil" ? "வனவாசம்" : "Forest Exile"}</span>
                <b>→</b>
                <span className="flow-step">🙏 {language === "tamil" ? "அனுமன் நட்பு" : "Hanuman Alliance"}</span>
                <b>→</b>
                <span className="flow-step">🌉 {language === "tamil" ? "ராமர் சேது" : "Ram Setu Bridge"}</span>
                <b>→</b>
                <span className="flow-step">🪔 {language === "tamil" ? "ராம ராஜ்யம்" : "Rama Rajya"}</span>
              </div>

              <p>
                {language === "tamil"
                  ? "தந்தை சொல் காத்தல், சகோதர பாசம், தர்மத்தின் வெற்றி மற்றும் சத்தியத்தின் பெருமையை எடுத்துரைக்கும் இதிகாச காவியம்."
                  : "The timeless epic depicting honor, truth, selflessness, righteousness, and the supreme victory of light over dark."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    /* 4. MAHABHARATA */
    if (visual.type === "mahabharata") {
      return (
        <div className="visual-card devotional-sanctum-card">
          <div className="visual-header">
            <span className="visual-header-badge">⚔️ {language === "tamil" ? "மகாபாரதம் & குருக்ஷேத்திரம்" : "Mahabharata & Kurukshetra"}</span>
            <span className="devotional-mantra-pill">|| யதோ தர்மஸ்ததோ ஜெயஃ ||</span>
          </div>

          <div className="epic-visual">
            <div className="epic-icon">⚔️</div>
            <div className="epic-content">
              <h3>{language === "tamil" ? "மகாபாரதம் — தர்ம யுத்தம்" : "Mahabharata — The Cosmic Battle for Dharma"}</h3>

              <div className="epic-flow">
                <span className="flow-step">👑 {language === "tamil" ? "பாண்டவர்கள்" : "Pandavas"}</span>
                <b>VS</b>
                <span className="flow-step">👑 {language === "tamil" ? "கௌரவர்கள்" : "Kauravas"}</span>
                <b>→</b>
                <span className="flow-step">⚔️ {language === "tamil" ? "குருக்ஷேத்திரம்" : "Kurukshetra"}</span>
                <b>→</b>
                <span className="flow-step">🪷 {language === "tamil" ? "கிருஷ்ண உபதேசம்" : "Krishna's Guidance"}</span>
                <b>→</b>
                <span className="flow-step">📖 {language === "tamil" ? "பகவத் கீதை" : "Bhagavad Gita"}</span>
              </div>

              <p>
                {language === "tamil"
                  ? "எங்கே தர்மம் உள்ளதோ அங்கே வெற்றி உண்டு என்ற நித்திய உண்மையை மனிதகுலத்திற்கு உணர்த்தும் உன்னத இதிகாசம்."
                  : "Where there is Dharma, there is victory. A grand exploration of human duty, destiny, justice, and divine intervention."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    /* 5. BHAGAVAD GITA */
    if (visual.type === "gita") {
      return (
        <div className="visual-card devotional-sanctum-card">
          <div className="visual-header">
            <span className="visual-header-badge">📖 {language === "tamil" ? "ஸ்ரீமத் பகவத் கீதை" : "Srimad Bhagavad Gita"}</span>
            <span className="devotional-mantra-pill">|| கர்மண்யேவாதிகாரஸ்தே மா பலேஷு கதாசன ||</span>
          </div>

          <div className="epic-visual">
            <div className="epic-icon">🪷</div>
            <div className="epic-content">
              <h3>{language === "tamil" ? "கீதோபதேசம் — பகவானின் வாக்கு" : "Gitopadesha — Divine Song of the Lord"}</h3>

              <div className="epic-flow">
                <span className="flow-step">🏹 {language === "tamil" ? "அர்ஜுன விஷாதம்" : "Arjuna's Dilemma"}</span>
                <b>↔</b>
                <span className="flow-step">🪷 {language === "tamil" ? "ஸ்ரீ கிருஷ்ணர்" : "Lord Krishna"}</span>
                <b>→</b>
                <span className="flow-step">⚖️ {language === "tamil" ? "கர்ம யோகம்" : "Karma Yoga"}</span>
                <b>→</b>
                <span className="flow-step">🧘 {language === "tamil" ? "பக்தி & ஞான யோகம்" : "Bhakti & Jnana"}</span>
                <b>→</b>
                <span className="flow-step">✨ {language === "tamil" ? "மோட்சம்" : "Moksha"}</span>
              </div>

              <p>
                {language === "tamil"
                  ? "கடமையை செய், பலனில் பற்று கொள்ளாதே — மன அமைதிக்கும் ஆத்ம ஞானத்திற்குமான நித்திய வழிகாட்டி."
                  : "Perform your duty with devotion and detachment. The ultimate spiritual masterclass for living a balanced, fearless life."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    /* 6. NAVARATHIRI GENERAL */
    if (visual.type === "navarathiri") {
      return (
        <div className="visual-card devotional-sanctum-card">
          <div className="visual-header">
            <span className="visual-header-badge">🪔 {language === "tamil" ? "ஸ்ரீ நவசக்தி வழிபாடு" : "Tri-Devi Shakti Worship"}</span>
            <span className="devotional-mantra-pill">|| துர்கா • லட்சுமி • சரஸ்வதி ||</span>
          </div>

          <div className="epic-visual">
            <div className="epic-icon">🪔</div>
            <div className="epic-content">
              <h3>{language === "tamil" ? "நவராத்திரி — முப்பெரும் தேவிகளின் அருள்" : "Navarathiri — Celebration of Supreme Shakti"}</h3>

              <div className="epic-flow">
                <span className="flow-step flow-durga">🌺 {language === "tamil" ? "நாட்கள் 1-3: வீர துர்கை" : "Days 1-3: Durga (Strength)"}</span>
                <b>→</b>
                <span className="flow-step flow-lakshmi">🪙 {language === "tamil" ? "நாட்கள் 4-6: ஐஸ்வர்ய லட்சுமி" : "Days 4-6: Lakshmi (Prosperity)"}</span>
                <b>→</b>
                <span className="flow-step flow-saraswati">📚 {language === "tamil" ? "நாட்கள் 7-9: ஞான சரஸ்வதி" : "Days 7-9: Saraswati (Wisdom)"}</span>
                <b>→</b>
                <span className="flow-step flow-vijaya">🚩 {language === "tamil" ? "நாள் 10: விஜயதசமி" : "Day 10: Vijayadashami"}</span>
              </div>

              <p>
                {language === "tamil"
                  ? "வீரம், செல்வம், கல்வி ஆகிய முப்பெரும் பேறுகளையும் பெற்று வெற்றியடைய வழிவகுக்கும் புனித விழா."
                  : "Nine glorious nights honoring Courage (Durga), Prosperity (Lakshmi), and Sacred Wisdom (Saraswati)."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    /* 7. CREATOR & DEVELOPER */
    if (visual.type === "creator") {
      return (
        <div className="visual-card devotional-sanctum-card">
          <div className="visual-header">
            <span className="visual-header-badge">
              👨‍💻 {language === "tamil" ? "உருவாக்கியவர் தகவல்" : "Creator & Developer Info"}
            </span>
            <span className="devotional-mantra-pill">BCA 3rd Year • AI & Heritage Project</span>
          </div>

          <div className="epic-visual">
            <div className="epic-icon">👨‍💻</div>
            <div className="epic-content">
              <h3>
                {language === "tamil" ? "முத்துகிருஷ்ணன் (Muthukrishnan)" : "Muthukrishnan"}
                <span className="divine-epithet">
                  {language === "tamil" ? " • BCA 3-ஆம் ஆண்டு மாணவர்" : " • 3rd Year BCA Student"}
                </span>
              </h3>

              <div className="epic-flow">
                <span className="flow-step">🎓 BCA 3rd Year</span>
                <span className="flow-step">🪔 Navarathiri Heritage</span>
                <span className="flow-step">⚡ Gemini Generative AI</span>
                <span className="flow-step">🎙️ Neural Voice Tech</span>
              </div>

              <p>
                {language === "tamil"
                  ? "ஆன்மீகப் பண்பாட்டையும் அதிநவீன செயற்கை நுண்ணறிவு குரல் தொழில்நுட்பத்தையும் இணைக்கும் உன்னத நோக்கத்துடன் இச்செயலி முத்துகிருஷ்ணனால் அர்ப்பணிப்புடன் உருவாக்கப்பட்டது."
                  : "Navarathiri Voice AI was passionately developed by Muthukrishnan to seamlessly blend timeless Indian spiritual wisdom with cutting-edge conversational AI."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="app devotional-theme">
      {/* Background Sacred Ambience */}
      <div className="sanctum-aura-layer" aria-hidden="true" />
      <div className="ambient-diya-glow-left" aria-hidden="true" />
      <div className="ambient-diya-glow-right" aria-hidden="true" />
      <div className="temple-kolam-watermark" aria-hidden="true" />

      {/* Floating Sacred Golden Particles */}
      <div className="sacred-particles" aria-hidden="true">
        <span className="p-ember p1" />
        <span className="p-ember p2" />
        <span className="p-ember p3" />
        <span className="p-ember p4" />
        <span className="p-ember p5" />
        <span className="p-ember p6" />
        <span className="p-ember p7" />
        <span className="p-ember p8" />
      </div>

      <div className="app-layout">
        {/* =================================================
            SIDEBAR (DEVOTIONAL SANCTUM ARCHIVES)
        ================================================= */}
        <aside className="history-sidebar">
          {/* Brand Header */}
          <div className="sidebar-brand">
            <div className="sidebar-logo-diya" title="ஸ்ரீ தீப மங்களம்">
              <span className="diya-flame-core">🪔</span>
            </div>
            <div className="sidebar-brand-text">
              <h2>Navarathiri AI</h2>
              <span>{language === "tamil" ? "தெய்வீக குரல் களஞ்சியம்" : "Sacred Voice Assistant"}</span>
            </div>
          </div>

          {/* New Conversation Button */}
          <button
            className="new-chat-btn"
            onClick={startNewInquiry}
            title={language === "tamil" ? "புதிய கேள்வி தொடங்க" : "Start New Divine Inquiry"}
          >
            <span className="new-chat-icon">✦</span>
            <span>{language === "tamil" ? "புதிய உரையாடல்" : "New Divine Inquiry"}</span>
          </button>

          {/* History Header */}
          <div className="history-heading">
            <div className="history-title-group">
              <span className="history-sacred-icon">📜</span>
              <span>{language === "tamil" ? "உரையாடல் வரலாறு" : "SACRED ARCHIVE"}</span>
            </div>
            <span className="history-count">{conversation.length}</span>
          </div>

          {/* History List */}
          <div className="history-list">
            {conversation.length === 0 ? (
              <div className="empty-history">
                <div className="empty-history-diya">🪔</div>
                <p>
                  {language === "tamil"
                    ? "உங்கள் ஆன்மீகக் கேள்விகள் இங்கே பொறிக்கப்படும்."
                    : "Your devotional inquiries will be preserved here."}
                </p>
                <small className="empty-hint">
                  {language === "tamil" ? "தீபத்தை தொட்டு பேசவும்" : "Tap the Diya to begin"}
                </small>
              </div>
            ) : (
              conversation.map((item) => (
                <button
                  key={item.id}
                  className={`history-item ${
                    selectedConversationId === item.id ? "history-active" : ""
                  }`}
                  onClick={() => {
                    stopSpeaking();
                    setSelectedConversationId(item.id);
                    setQuestion(item.question);
                    setAnswer(item.answer || "");
                    setChartData(item.chart);
                  }}
                >
                  <span className="history-item-icon">{getHistoryIcon(item)}</span>
                  <span className="history-item-text">{item.question}</span>
                </button>
              ))
            )}
          </div>

          {/* Sidebar Bottom */}
          <div className="sidebar-bottom">
            <button
              className="clear-history"
              onClick={clearHistory}
              disabled={conversation.length === 0}
            >
              <span>🗑</span>
              <span>{language === "tamil" ? "வரலாற்றை நீக்கு" : "Clear History"}</span>
            </button>

            <div className="sidebar-language-control">
              <span className="lang-icon">🌐</span>
              <button
                className={language === "tamil" ? "sidebar-lang-active" : ""}
                onClick={() => changeLanguage("tamil")}
              >
                தமிழ்
              </button>
              <span className="lang-divider">|</span>
              <button
                className={language === "english" ? "sidebar-lang-active" : ""}
                onClick={() => changeLanguage("english")}
              >
                English
              </button>
            </div>
          </div>
        </aside>

        {/* =================================================
            MAIN SANCTUM AREA
        ================================================= */}
        <div className="main-area">
          {/* Sacred Invocation Top Bar */}
          <div className="top-invocation-ribbon">
            <span className="invocation-text">
              {language === "tamil"
                ? "|| ॐ ஸ்ரீ லலிதா மகா திரிபுரசுந்தரி போற்றி • நவசக்தி அருள் நிறைந்தது ||"
                : "|| ॐ Sri Lalitha Maha Tripurasundari Devyai Namah • Epics & Sacred Wisdom ||"}
            </span>
          </div>

          {/* Header */}
          <header className="main-header">
            <div className="main-header-left">
              <span className="main-header-label">
                <span className="diya-bullet">🪔</span>
                {language === "tamil" ? "நவராத்திரி வாய்ஸ் ஏஐ" : "VEDIC VOICE ASSISTANT"}
              </span>
              <h1>
                Navarathiri AI <span className="header-tamil-sub">நவராத்திரி AI</span>
              </h1>
            </div>

            <div className="main-header-right">
              {/* Language Switcher in Header */}
              <div className="header-lang-switch">
                <button
                  className={`lang-pill ${language === "tamil" ? "active" : ""}`}
                  onClick={() => changeLanguage("tamil")}
                >
                  தமிழ்
                </button>
                <button
                  className={`lang-pill ${language === "english" ? "active" : ""}`}
                  onClick={() => changeLanguage("english")}
                >
                  English
                </button>
              </div>

              {/* Devotional Voice Selector */}
              <div className="header-voice-select-wrapper">
                <span className="voice-select-label" title={language === "tamil" ? "குரல் தேர்வு" : "Voice Selection"}>
                  🎙️ {language === "tamil" ? "குரல்:" : "Voice:"}
                </span>
                <select
                  className="header-voice-select"
                  value={selectedVoice}
                  onChange={(e) => previewVoice(e.target.value)}
                  title={language === "tamil" ? "குரலை மாற்ற கிளிக் செய்க (மாற்றியதும் மாதிரி ஒலிக்கும்)" : "Select speaking voice (plays sample on change)"}
                >
                  {language === "tamil" ? (
                    <>
                      <option value="pallavi">🌸 பல்லவி (Pallavi - பெண் / Warm)</option>
                      <option value="valluvar">🔱 வள்ளுவர் (Valluvar - ஆண் / Scholar)</option>
                      <option value="saranya">🌺 சரண்யா (Saranya - பெண் / Soft)</option>
                    </>
                  ) : (
                    <>
                      <option value="neerja">🪷 Neerja (Indian Female)</option>
                      <option value="prabhat">🎙️ Prabhat (Indian Male)</option>
                      <option value="ava">✨ Ava (US Female)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Status Indicator */}
              <div className={`header-status ${isLoading ? "thinking" : isSpeaking ? "speaking" : "ready"}`}>
                <span className="sacred-status-flame" />
                <span>
                  {isLoading
                    ? language === "tamil" ? "சிந்திக்கிறது..." : "Divine AI Reflecting..."
                    : isSpeaking
                    ? language === "tamil" ? "அருளுரை..." : "Speaking Wisdom..."
                    : language === "tamil" ? "அருள் தயார்" : "Sanctum Connected"}
                </span>
              </div>
            </div>
          </header>

          {/* Main Content Scroll Area */}
          <main className="main">
            <div className="hero">
              {/* Sacred Badge */}
              <div className="devotional-badge">
                <span className="badge-sparkle">✦</span>
                <span className="badge-text">
                  {language === "tamil"
                    ? "ஸ்ரீ நவசக்தி • சுந்தரகாண்டம் • இதிகாச ஞானம்"
                    : "SACRED NAVARATHIRI • EPICS & VEDIC LORE"}
                </span>
                <span className="badge-sparkle">✦</span>
              </div>

              {/* Hero Title */}
              <h2 className="sanctum-title">
                {selectedConversation ? (
                  language === "tamil" ? "உங்கள் ஆன்மீக உரையாடல்" : "Your Sacred Inquiry"
                ) : language === "tamil" ? (
                  <>
                    தெய்வீக <span>நவராத்திரி</span> & இதிகாச ஞானம்
                  </>
                ) : (
                  <>
                    Divine <span>Navarathiri</span> & Sacred Epics
                  </>
                )}
              </h2>

              <p className="sanctum-description">
                {language === "tamil"
                  ? "நவராத்திரி ஒன்பது நாட்கள், சுந்தரகாண்டம், ராமாயணம், மகாபாரதம் மற்றும் பகவத் கீதை பற்றிய உங்கள் சந்தேகங்களுக்கு அன்பான தெய்வீக வழிகாட்டல்."
                  : "Seek wisdom on the Nine Divine Nights of Navadurga, Sundarakanda, Ramayana, Mahabharata, and the Bhagavad Gita spoken with grace."}
              </p>

              {/* =================================================
                  ACTIVE CONVERSATION DISPLAY
              ================================================= */}
              {selectedConversation && (
                <div className="conversation">
                  <div className="conversation-turn">
                    {/* User Question */}
                    <div className="question-box">
                      <div className="question-avatar">🙏</div>
                      <div className="question-body">
                        <span className="question-sender">
                          {language === "tamil" ? "உங்கள் வினா:" : "Your Inquiry:"}
                        </span>
                        <p>{selectedConversation.question}</p>
                      </div>
                    </div>

                    {/* AI Answer Altar Box */}
                    <div className="answer-box">
                      <div className="answer-top-row">
                        <div className="answer-title-group">
                          <span className="answer-diya-icon">🪔</span>
                          <span className="answer-title">
                            Navarathiri AI{" "}
                            <small>
                              {language === "tamil" ? "• தெய்வீக பதில்" : "• Divine Guidance"}
                            </small>
                          </span>
                        </div>

                        {selectedConversation.answer && !selectedConversation.isLoading && (
                          <button
                            className={`answer-voice-button ${
                              isSpeaking && speakingConversationId === selectedConversation.id
                                ? "voice-playing"
                                : ""
                            }`}
                            onClick={() => {
                              unlockAudio();
                              if (isSpeaking && speakingConversationId === selectedConversation.id) {
                                stopSpeaking();
                              } else {
                                speakAnswer(selectedConversation.answer, selectedConversation.id);
                              }
                            }}
                          >
                            <span className="voice-btn-icon">
                              {isSpeaking && speakingConversationId === selectedConversation.id
                                ? "🔇"
                                : "🔊"}
                            </span>
                            <span>
                              {isSpeaking && speakingConversationId === selectedConversation.id
                                ? language === "tamil" ? "நிறுத்து" : "Stop"
                                : language === "tamil" ? "கேட்கவும்" : "Listen"}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Loading State */}
                      {selectedConversation.isLoading ? (
                        <div className="ai-loading">
                          <div className="loading-flames">
                            <span className="f-dot f1" />
                            <span className="f-dot f2" />
                            <span className="f-dot f3" />
                          </div>
                          <p className="loading-text">
                            {language === "tamil"
                              ? "ஞானக் களஞ்சியத்திலிருந்து சிந்திக்கிறது..."
                              : "Seeking wisdom from the sacred knowledge..."}
                          </p>
                        </div>
                      ) : (
                        <div className="answer-body-prose">
                          <p>{selectedConversation.answer}</p>
                        </div>
                      )}

                      {/* Speaking Status Banner */}
                      {isSpeaking &&
                        speakingConversationId === selectedConversation.id &&
                        !selectedConversation.isLoading && (
                          <div className="speaking-status">
                            <span className="speaking-wave-bars">
                              <span />
                              <span />
                              <span />
                              <span />
                            </span>
                            <span>
                              {language === "tamil"
                                ? "அருளுரை ஒலிக்கிறது... கவனமாகக் கேளுங்கள்"
                                : "Speaking divine response aloud..."}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Visual Card if applicable */}
                    {!selectedConversation.isLoading &&
                      selectedConversation.chart &&
                      renderVisual(selectedConversation.chart)}
                  </div>

                  <div ref={conversationEndRef} />
                </div>
              )}

              {/* =================================================
                  SACRED DIYA MICROPHONE BUTTON
              ================================================= */}
              <div className="mic-centerpiece-container">
                <div className={`diya-aura-ring ring-1 ${isListening ? "active" : ""}`} />
                <div className={`diya-aura-ring ring-2 ${isListening ? "active" : ""}`} />

                <button
                  className={`mic-button ${isListening ? "listening" : ""} ${
                    isLoading ? "mic-disabled" : ""
                  } ${isSpeaking ? "speaking-mic" : ""}`}
                  onClick={startListening}
                  disabled={isLoading}
                  title={
                    isListening
                      ? "Listening..."
                      : language === "tamil"
                      ? "குரல் வழி கேட்க அழுத்தவும்"
                      : "Tap to ask by voice"
                  }
                >
                  <div className="diya-flame-wrapper">
                    <span className="sacred-diya-svg-icon">🪔</span>
                    {isListening && <span className="mic-recording-pulse" />}
                  </div>
                </button>
              </div>

              {/* Devotional Status Caption */}
              <div className="mic-text">
                <span className="mic-status-icon">
                  {isListening ? "🎙️" : isLoading ? "⏳" : isSpeaking ? "🔊" : "✨"}
                </span>
                <span>
                  {isListening
                    ? language === "tamil"
                      ? "பக்தியோடு கேட்கிறேன்... பேசுங்கள்..."
                      : "Listening with reverence... please speak..."
                    : isLoading
                    ? language === "tamil"
                      ? "ஞானக் களஞ்சியத்திலிருந்து பதில் பெறப்படுகிறது..."
                      : "Consulting divine knowledge..."
                    : isSpeaking
                    ? language === "tamil"
                      ? "அருளுரை ஒலிக்கிறது..."
                      : "Speaking answer aloud..."
                    : language === "tamil"
                    ? "தீபத்தை தொட்டு பேசவும் அல்லது கீழே தட்டச்சு செய்யவும்"
                    : "Tap the Sacred Diya to speak or type below"}
                </span>
              </div>

              {/* =================================================
                  TEXT INPUT FORM
              ================================================= */}
              <form className="text-input-area" onSubmit={handleTextSubmit}>
                <div className="input-glow-wrapper">
                  <span className="input-prefix-icon">🪷</span>
                  <input
                    type="text"
                    id="question-input"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={
                      language === "tamil"
                        ? "நவராத்திரி, ராமாயணம், மகாபாரதம் பற்றி கேட்கவும்..."
                        : "Ask about Navarathiri, Sundarakanda, Epics & Gita..."
                    }
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="submit-send-btn"
                    disabled={isLoading || !textInput.trim()}
                    title={language === "tamil" ? "வினாவை அனுப்ப" : "Submit Question"}
                  >
                    {isLoading ? "⏳" : "➤"}
                  </button>
                </div>
              </form>

              {/* =================================================
                  DEVOTIONAL TOPIC FILTER PILLS & PROMPTS
              ================================================= */}
              <div className="devotional-prompts-section">
                {/* Category Selector Tabs */}
                <div className="category-tabs">
                  {DEVOTIONAL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      className={`cat-tab-btn ${activeCategory === cat.id ? "active" : ""}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      <span>{cat.icon}</span>
                      <span>{language === "tamil" ? cat.labelTa : cat.labelEn}</span>
                    </button>
                  ))}
                </div>

                {/* Suggestions Grid */}
                <div className="suggestions">
                  {visiblePrompts.map((item, idx) => {
                    const label = language === "tamil" ? item.textTa : item.textEn;
                    return (
                      <button
                        key={idx}
                        className="suggestion-chip"
                        onClick={() => findAnswer(label)}
                        disabled={isLoading}
                      >
                        <span className="chip-icon">{item.icon}</span>
                        <span className="chip-text">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </main>

          {/* Devotional Footer */}
          <footer>
            <div className="footer-content">
              <span>🪔 ஸ்ரீ நவராத்திரி வாய்ஸ் ஏஐ</span>
              <span className="footer-dot">•</span>
              <span>Navarathiri AI Assistant</span>
              <span className="footer-dot">•</span>
              <span>Gemini Divine Intelligence</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;