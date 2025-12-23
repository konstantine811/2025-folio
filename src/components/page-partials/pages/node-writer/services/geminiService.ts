import { GoogleGenAI, Type } from "@google/genai";

const getAI = () =>
  new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const generateTeachingContent = async (
  topic: string,
  format: string
) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a comprehensive teaching plan for: ${topic}. Format: ${format}. Use markdown. Include theoretical blocks, practical exercises and resources.`,
  });
  return response.text || "";
};

export const generateMindMap = async (content: string) => {
  if (!content) return { nodes: [], links: [] };
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract the main concepts and their relationships from this teaching material into a JSON format of nodes and links. For each node, provide a 'label' (short title) and a 'description' (1-2 sentences explaining the concept). Use these types: 'concept', 'resource', 'activity'. Content: ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING },
                },
                required: ["id", "label", "description", "type"],
              },
            },
            links: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                },
                required: ["source", "target"],
              },
            },
          },
          required: ["nodes", "links"],
        },
      },
    });
    return JSON.parse(response.text || '{"nodes":[], "links":[]}');
  } catch (e) {
    console.error("MindMap generation failed", e);
    return { nodes: [], links: [] };
  }
};

export const generateSlides = async (content: string) => {
  if (!content) return [];
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a professional presentation structure (5-8 slides) based on this content. Include titles and key bullet points for each slide. Content: ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              visualType: { type: Type.STRING },
            },
            required: ["id", "title", "content", "visualType"],
          },
        },
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Slides generation failed", e);
    return [];
  }
};

export const generateAIImage = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          text: `A high quality educational illustration for: ${prompt}. Professional, clean style.`,
        },
      ],
    },
    config: {
      imageConfig: { aspectRatio: "16:9" },
    },
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};
