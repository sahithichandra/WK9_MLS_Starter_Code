import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const createClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({ apiKey });
};

const extractModelText = (response) => {
  const text = response?.text?.trim();
  if (!text) {
    throw new Error("Empty response from Gemini");
  }
  return text;
};

const mapGeminiError = (error, action) => {
  const rawMessage = error?.message || "Unknown Gemini API error";

  if (rawMessage.includes("RESOURCE_EXHAUSTED") || rawMessage.includes("quota")) {
    return new Error("Gemini quota exceeded. Please try again later.");
  }

  if (rawMessage.includes("API key") || rawMessage.includes("API_KEY") || rawMessage.includes("GEMINI_API_KEY")) {
    return new Error("Gemini API key is invalid or missing.");
  }

  if (rawMessage.includes("not found") || rawMessage.includes("model")) {
    return new Error(`Gemini model is unavailable for ${action}.`);
  }

  return new Error(`Gemini failed to ${action}.`);
};

export const rephraseText = async (text) => {
  const ai = createClient();

  const prompt = `Rephrase the following text to be clearer, more engaging, and better written. Preserve the original meaning and tone. Return ONLY the rephrased text with no preamble, explanation, or surrounding quotes.

Text:
${text}`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
    });

    return extractModelText(response);
  } catch (error) {
    throw mapGeminiError(error, "rephrase text");
  }
};

export const summarizeThreadWithGemini = async (thread, comments) => {
  const ai = createClient();

  const commentsText =
    comments.length > 0
      ? comments
          .map(
            (c, i) =>
              `Comment ${i + 1} by ${c.user?.name || "Unknown"}: ${c.content}`
          )
          .join("\n")
      : "No comments yet.";

  const prompt = `Summarize the following Reddit-style thread and its comments in one concise paragraph.

Thread Title: ${thread.title}
Thread Content: ${thread.content}

Comments:
${commentsText}

Provide a single paragraph summary that captures the main topic and key discussion points.`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
    });

    return extractModelText(response);
  } catch (error) {
    throw mapGeminiError(error, "summarize this thread");
  }
};
