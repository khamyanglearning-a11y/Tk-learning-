
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Initialize the GoogleGenAI client strictly using the environment variable as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIWordSuggestions = async (word: string, sourceLang: string) => {
  if (!process.env.API_KEY) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide translations for the word "${word}" in 4 languages: English, Assamese, Tai Khamyang, and one other relevant regional language (like Hindi or Bengali). 
      Format the response as JSON.
      Target languages: English, Assamese, Tai Khamyang, and "additionalLang" (the 4th language). 
      Also provide a pronunciation guide, a short example sentence in the primary language, and the "sentenceMeaning" (translation/meaning of that sentence in English/Assamese).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            english: { type: Type.STRING },
            assamese: { type: Type.STRING },
            taiKhamyang: { type: Type.STRING },
            additionalLang: { type: Type.STRING, description: "A fourth regional language translation" },
            pronunciation: { type: Type.STRING },
            exampleSentence: { type: Type.STRING },
            sentenceMeaning: { type: Type.STRING, description: "The translation or explanation of the example sentence" }
          },
          required: ["english", "assamese", "taiKhamyang", "additionalLang", "exampleSentence", "sentenceMeaning"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const getAIPronunciation = async (word: string) => {
  if (!process.env.API_KEY || !word) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide only a short phonetic text-based pronunciation guide for the English word "${word}". 
      Keep it simple for non-native speakers. Example: for "Knowledge" return "No-ledge".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pronunciation: { type: Type.STRING }
          },
          required: ["pronunciation"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data.pronunciation;
  } catch (error) {
    console.error("Pronunciation API Error:", error);
    return null;
  }
};

/**
 * AI-powered Tai heritage search with Google Search Grounding.
 * Only answers queries related to Tai history, villages, and language.
 */
export const searchTaiAbout = async (query: string): Promise<{ text: string, sources: { title: string, uri: string }[] } | null> => {
  if (!process.env.API_KEY || !query) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User Query: "${query}"`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are a Tai Heritage Scholar specializing in the Tai groups of Northeast India (Tai Khamyang, Tai Khamti, Tai Phake, Tai Turung, Tai Aiton). 
        - Use Google Search to find accurate, real-time information about Tai history, culture, specific villages, and linguistic features.
        - If the user asks about a specific Tai group (e.g., Tai Khamyang, Tai Khamti), provide a detailed breakdown including history and a 'Village by Village' list of major settlements.
        - Strictly answer ONLY queries related to Tai people and their heritage. If the query is off-topic, politely state your focus.
        - Format the response with Markdown: use headings, bold text, and lists for readability.`
      }
    });

    const text = response.text || "No information found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || "Reference",
        uri: chunk.web?.uri || "#"
      }))
      .filter((source: any) => source.uri !== "#") || [];

    return { text, sources };
  } catch (error) {
    console.error("Tai Search Error:", error);
    return { text: "Error retrieving Tai heritage data. Please try again.", sources: [] };
  }
};

/**
 * Generates AI Voice audio for a word using Gemini TTS.
 * Returns the raw base64 PCM data.
 */
export const generateAIVoice = async (text: string): Promise<string | null> => {
  if (!process.env.API_KEY || !text) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say cheerfully: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Clear, professional voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS API Error:", error);
    return null;
  }
};

export const generateSmsMessage = async (otp: string): Promise<string> => {
  if (!process.env.API_KEY) return `Your TaiHub verification code is ${otp}. Please do not share this with anyone.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a realistic, professional SMS message for a login OTP. The code is ${otp}. 
      The app name is "TaiHub Dictionary". Keep it under 100 characters. 
      Format: "Your [App] code is [Code]. [Security Warning]."`,
    });
    return response.text.trim();
  } catch (error) {
    return `Your TaiHub verification code is ${otp}. Do not share this code.`;
  }
};

/**
 * Generates a realistic photo visual of a word using Gemini 2.5 Flash Image.
 * Enhanced with cultural context for Tai Khamyang heritage.
 */
export const generateWordImage = async (word: string): Promise<string | null> => {
  if (!process.env.API_KEY || !word) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Create a masterpiece-quality, realistic photograph of "${word}". 
            Context: Interpret this word through the specific cultural lens of the Tai Khamyang (Shyam) people of Northeast India. 
            Setting: If applicable, place the subject within a traditional Tai village in Assam, featuring 'Chang-ghar' (stilt houses), lush bamboo groves, or serene Theravada Buddhist monastery (Vihar) surroundings. 
            Details: Incorporate authentic elements such as traditional hand-woven 'Tai' textiles, local flora of the Brahmaputra valley, and the warm, golden light of the Northeast Indian countryside. 
            Style: Professional National Geographic-style documentary photography, 8k resolution, cinematic depth of field, authentic textures, absolutely no text or watermarks.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};
