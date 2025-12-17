import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to remove data URL prefix for Gemini
const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

// Helper to determine mime type
const getMimeType = (base64: string) => {
  const match = base64.match(/^data:(image\/[a-zA-Z]+);base64,/);
  return match ? match[1] : 'image/jpeg';
};

export const extractContactsFromImage = async (base64Image: string): Promise<ExtractedData[]> => {
  try {
    const mimeType = getMimeType(base64Image);
    const cleanData = cleanBase64(base64Image);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanData
            }
          },
          {
            text: `Analyze this image and extract any contact information found. 
            Focus on Names, Phone Numbers, and Company names if available. 
            If there is context (like "plumber", "client", hand-written notes), add it to the notes field.
            Return an empty array if no clear contacts are found.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the person or entity" },
              phone: { type: Type.STRING, description: "Phone number found" },
              company: { type: Type.STRING, description: "Company name if applicable" },
              notes: { type: Type.STRING, description: "Any additional context or notes found near the number" }
            },
            required: ["phone"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as ExtractedData[];
      return data;
    }
    return [];

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to process image. Please try again.");
  }
};