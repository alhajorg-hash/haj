import { GoogleGenAI, Type } from "@google/genai";
import { Product, Transaction } from "../types";

/**
 * Standard client factory for Gemini API
 * Ensures the API key is retrieved fresh for every call.
 */
const getAIClient = () => {
  if (!navigator.onLine) {
    const error = new Error("Offline: Neural connection required.");
    error.name = "OfflineError";
    throw error;
  }
  const apiKey = String(process.env.API_KEY || '');
  return new GoogleGenAI({ apiKey });
};

export const getStoreInsights = async (products: Product[], transactions: Transaction[], query: string) => {
  try {
    const ai = getAIClient();
    const context = `
      System: GeminiPOS Pro Strategic Consultant.
      Context: Ghanaian retail market (GHS).
      Inventory: ${JSON.stringify(products.map(p => ({ name: p.name, stock: p.stock, price: p.price, category: p.category })))}
      History: ${transactions.length} recent orders.
      User Query: ${query}
      
      Instruction: Provide concise, tactical business advice. If asked for restocks, specify quantities. Focus on GHS currency.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: context }] }],
      config: { 
        temperature: 0.7,
        topP: 0.95
      }
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini Insights Error:", error);
    if (error.name === "OfflineError") return "OFFLINE_MODE: Intelligence engine disconnected.";
    return "The strategic engine is currently recalibrating. Please try again in a moment.";
  }
};

export const getProfitAnalysis = async (revenue: number, expenses: number, purchases: number, categories: any[]) => {
  try {
    const ai = getAIClient();
    const prompt = `
      Role: Financial Analyst for Ghana SME.
      Data: 
      - Sales: GH₵${revenue}
      - Ops Expenses: GH₵${expenses}
      - Inventory COGS: GH₵${purchases}
      - Best Categories: ${JSON.stringify(categories)}
      
      Objective: Provide a 3-point briefing to maximize net margin.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: { temperature: 0.4 }
    });
    return response.text;
  } catch (error: any) {
    return "Profit analysis briefing failed due to a network or processing error.";
  }
};

export const generateInventoryReport = async (products: Product[]) => {
  try {
    const ai = getAIClient();
    const prompt = `Perform a smart inventory audit. Inventory: ${JSON.stringify(products.map(p => ({ name: p.name, stock: p.stock, price: p.price })))}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            restockAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
            marketingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ["restockAlerts", "marketingTips", "summary"]
        }
      }
    });
    return JSON.parse(response.text?.trim() || "{}");
  } catch (error) {
    console.error("JSON Generation Error:", error);
    return null;
  }
};

export const suggestDailyTasks = async (products: Product[], transactions: Transaction[]) => {
  try {
    const ai = getAIClient();
    const prompt = `Generate 3 operational tasks for a shop manager based on this metadata. Sales Today: ${transactions.length}. Items: ${products.length}.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING }
            },
            required: ["title", "description", "priority"]
          }
        }
      }
    });
    return JSON.parse(response.text?.trim() || "[]");
  } catch (error) {
    return [];
  }
};

export const generateProductImage = async (prompt: string, aspectRatio: "1:1" | "4:3" | "16:9" = "1:1") => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { 
        imageConfig: { aspectRatio } 
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Synth Error:", error);
    throw error;
  }
};