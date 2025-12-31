
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Initialize the GoogleGenAI client strictly using the environment variable
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

/**
 * Improved Wiki Scholar search function.
 * Returns structured heritage data with bilingual descriptions.
 */
export const searchTaiHeritage = async (query: string) => {
  if (!process.env.API_KEY || !query) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a scholarly expert on the Tai Khamyang (Shyam) community of Northeast India.
      Research the following query: "${query}".
      Provide a detailed response in JSON format including:
      1. A scholarly title.
      2. A detailed English explanation.
      3. A detailed Assamese explanation (using correct Unicode script).
      4. A "culturalSignificance" summary.
      5. Three "relatedTopics" for further exploration.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            englishContent: { type: Type.STRING },
            assameseContent: { type: Type.STRING },
            culturalSignificance: { type: Type.STRING },
            relatedTopics: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "englishContent", "assameseContent", "culturalSignificance", "relatedTopics"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Wiki Scholar AI Error:", error);
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
            prebuiltVoiceConfig: { voiceName: 'Kore' },
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

export const generateWordImage = async (word: string, isPro: boolean = false): Promise<string | null> => {
  if (!process.env.API_KEY || !word) return null;

  try {
    // For Pro model, the rules require a fresh instance to catch the latest API key
    const currentAi = isPro ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : ai;
    const modelName = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

    const response = await currentAi.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            text: `Create a cinematic, professional-quality photograph representing the concept of "${word}". 
            Context: The visual MUST strictly relate to the Tai Khamyang (Shyam) community culture of Northeast India.
            Visual details to include:
            - Traditional 'Chang-ghar' architecture (houses on stilts made of bamboo and wood).
            - Authentic Tai hand-woven textiles featuring complex geometric patterns (Phan-ek, Phan-chet).
            - Lush tropical landscapes of the Brahmaputra Valley (tea gardens, bamboo groves, rivers).
            - Elements of Theravada Buddhism (golden pagodas, monks in saffron robes, prayer flags).
            - Style: High-end National Geographic documentary style, sharp focus, vibrant natural colors, warm golden-hour lighting. 
            - Requirements: No text, no watermarks, ultra-realistic textures.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          ...(isPro ? { imageSize: "1K" } : {})
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
    if (error instanceof Error && error.message.includes("Requested entity was not found")) {
      throw new Error("APIKEY_MISSING");
    }
    return null;
  }
};
