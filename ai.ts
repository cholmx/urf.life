
import { GoogleGenAI, Type } from "@google/genai";

export interface AiSermonInsights {
    summary: string;
    discussionQuestions: string[];
    themes: string[];
    scriptures: string[];
}

export async function generateSermonInsights(transcript: string): Promise<AiSermonInsights> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `Analyze the following sermon transcript and generate a JSON object with the following structure:
    - summary: A concise, one-paragraph summary of the sermon's main point and key takeaways.
    - discussionQuestions: An array of 4 thought-provoking questions for a small group or personal reflection, based on the sermon's content.
    - themes: An array of 5-7 key themes or topics covered in the sermon (e.g., "Grace", "Trusting God", "Spiritual Warfare").
    - scriptures: An array of all the Bible scripture references mentioned in the transcript (e.g., "Psalm 23:1-4", "John 3:16").
    
    Transcript:
    ---
    ${transcript}
    ---`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    discussionQuestions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    themes: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    scriptures: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            }
        }
    });
    
    return JSON.parse(response.text);
}
