



import { GoogleGenAI, Type } from "@google/genai";

// Assume process.env.API_KEY is configured in the environment
const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const systemInstruction = "You are a helpful assistant for a printing company's salesperson. You provide expert advice on printing materials, processes, and products. Keep your answers concise, professional, and in Vietnamese.";

export const getGeminiSuggestion = async (prompt: string): Promise<string> => {
    if (!apiKey) {
        return "Tính năng AI chưa được kích hoạt. Vui lòng cấu hình API Key.";
    }
    try {
        const response = await ai.models.generateContent({
            // FIX: Updated model name to 'gemini-3-flash-preview' as per guidelines for basic text tasks.
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.5,
            }
        });
        // FIX: response.text can be undefined. Return empty string if so.
        return response.text ?? '';
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.";
    }
};

const parseInstruction = `You are an expert assistant for a Vietnamese printing company. Your task is to extract key printing specifications from a user's note and return them as a structured JSON object. The note is in Vietnamese.
The specifications to extract are:
- size (kích thước, KT): The dimensions of the product, like "A4", "21x29.7cm".
- material (chất liệu): The paper type and weight, like "C150", "Couche 300gsm", "B300".
- printColor (màu in): Color information, like "in 2 mặt", "4/4 màu", "in 1 màu đen".
- finishing (gia công): Any post-print processes, like "cán màng mờ", "bế demi", "cấn".
- pages (số trang/mặt): The number of pages or printed sides.

Analyze the user's note and extract these values. If a value for size, material, finishing or pages is not present, omit its key from the JSON object.

**Specific rules:**
1.  **Print Color Default**: The 'printColor' property is mandatory. If the user's note does not specify a print color (e.g., "in 1 màu đen", "in 2 màu"), you MUST set the 'printColor' property to "4 màu". If the note says "in 2 mặt", this can be the value for 'printColor'.
2.  **Pages from Sides**: If the note contains "in 2 mặt" (2-sided printing), you MUST set the 'pages' property to 2. If it contains "in 1 mặt" (1-sided printing), you MUST set the 'pages' property to 1.
3.  **Abbreviation**: Recognize the abbreviation "ctp" and interpret it as "cắt thành phẩm" (cut to finished product). Include this full term in the 'finishing' property. For example, if the note says "cán màng, ctp", the 'finishing' value should be "cán màng, cắt thành phẩm".`;

export const parseNoteWithGemini = async (note: string): Promise<any> => {
    if (!apiKey) {
        throw new Error("Tính năng AI chưa được kích hoạt. Vui lòng cấu hình API Key.");
    }
    try {
        const response = await ai.models.generateContent({
            // FIX: Updated model name to 'gemini-3-flash-preview' as per guidelines for basic text tasks.
            model: 'gemini-3-flash-preview',
            contents: `User note: "${note}"`,
            config: {
                systemInstruction: parseInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        size: { type: Type.STRING, description: "Kích thước sản phẩm" },
                        material: { type: Type.STRING, description: "Chất liệu và định lượng giấy" },
                        printColor: { type: Type.STRING, description: "Thông tin màu in. Mặc định là '4 màu' nếu không được chỉ định." },
                        finishing: { type: Type.STRING, description: "Các loại gia công sau in" },
                        pages: { type: Type.NUMBER, description: "Số trang hoặc số mặt in của sản phẩm" }
                    },
                    required: ["printColor"]
                }
            }
        });
        
        // FIX: response.text can be undefined, use optional chaining.
        const jsonText = response.text?.trim();
        if (jsonText) {
            return JSON.parse(jsonText);
        }
        return {};

    } catch (error) {
        console.error("Error calling Gemini for parsing:", error);
        throw new Error("Lỗi phân tích ghi chú bằng AI. Vui lòng thử lại.");
    }
};
