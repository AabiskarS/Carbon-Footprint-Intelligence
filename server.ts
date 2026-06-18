import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (aiClient) return aiClient;
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY is not configured in the environment.");
    return null;
  }
  
  aiClient = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  return aiClient;
}

// 1. Intelligence analysis endpoint - produces bespoke advice & environmental analytics
app.post("/api/analyze", async (req, res) => {
  try {
    const { history = [], profile = {} } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        ok: false,
        error: "GEMINI_API_KEY is missing. Add your API key in Settings > Secrets to unlock personalized AI Climate Strategies.",
        fallback: true
      });
    }

    const historyStr = history.map((item: any) => 
      `- [${item.category}] ${item.title}: ${item.value} ${item.unit} on ${item.date} (Emissions: ${item.emissionsKg.toFixed(1)} kg CO2e)`
    ).join("\n");

    const profileStr = JSON.stringify(profile, null, 2);

    const prompt = `You are a Carbon Footprint Intelligence Engine.
Analyze the user's current carbon emission log and profile to generate a structured sustainable strategy.

USER PROFILE:
${profileStr}

USER ACTIVITY HISTORY:
${history ? historyStr : "No entries logged yet."}

You must return a raw JSON response matching this EXACT schema:
{
  "environmentalScore": number, // an environmental grade from 0 to 100 based on profile & logs (100 is best, i.e., lowest footprint relative to regional benchmark)
  "benchmarkingText": string, // brief statement comparing user to average global emissions per capita (approx 5 tonnes/year)
  "primaryCulprit": string, // e.g., Transport, Food, Energy
  "projections": {
    "annualForecastKg": number, // estimated annual emissions based on current trend
    "targetAnnualForecastKg": number // target emissions if suggestions are applied
  },
  "actionPlan": [
    {
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "category": string,
      "recommendation": string,
      "estimatedSavingKgYr": number,
      "feasibility": "Easy" | "Medium" | "Challenging"
    }
  ],
  "offsetCalendar": [
    {
      "day": string, // e.g., "Day 1-5", "Day 6-12"
      "action": string,
      "impact": string
    }
  ],
  "executiveSummary": string // inspirational environmental brief
}

Ensure the output is 100% valid JSON only, without any Markdown backticks (\`\`\`) in the actual text. Return the JSON object directly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text || "{}";
    res.json({ ok: true, report: JSON.parse(responseText.trim()) });

  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ ok: false, error: error.message || "Failed to process environmental analysis." });
  }
});

// 2. Interactive environmental coaching endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [], history = [], profile = {} } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        ok: false,
        error: "GEMINI_API_KEY is missing. Connect your API key in AI Studio Secrets tab to chat with the Carbon Coach.",
        text: "Hi there! I would love to guide you on your journey to carbon neutrality. To enable my fully intelligent Carbon Coach features, please make sure your `GEMINI_API_KEY` is added in **Settings > Secrets**. In the meantime, feel free to inspect your current carbon dashboard measurements!"
      });
    }

    const historySummary = history.map((item: any) => 
      `${item.date}: ${item.title} (${item.emissionsKg.toFixed(1)} kg CO2e in ${item.category})`
    ).slice(-20).join("\n");

    const systemPrompt = `You are a warm, extremely knowledgeable, and encouraging Climate Action Advisor & Carbon Coach. 
Your goal is to help users understand their carbon emissions, answer questions about sustainability, and recommend highly actionable carbon reduction and offsetting methods.

Context on current user state:
- Profile: ${JSON.stringify(profile)}
- Recent Activity Logs:
${historySummary || "No activities logged yet."}

Support your recommendations with real-world context (e.g. standard carbon intensities of flights, vegan diets, carpools, heat pumps). Keep answers friendly, professional, clear, and well-structured, using Markdown formatting for lists or essential stats. Make sure your tone is positive and non-judgmental.`;

    // Map the incoming thread messages to Gemini's format
    const chatContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    res.json({ ok: true, text: response.text });

  } catch (error: any) {
    console.error("Coaching Chat Error:", error);
    res.status(500).json({ ok: false, error: error.message || "Carbon Coach was unable to generate a response." });
  }
});

// 3. Integration of Vite for static SPA client routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Carbon Intelligence Server successfully running on http://localhost:${PORT}`);
  });
}

startServer();
