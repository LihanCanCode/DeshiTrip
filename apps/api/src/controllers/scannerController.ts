import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy initialization helper for Gemini AI
let genAIInstance: GoogleGenerativeAI | null = null;
const getGenAI = () => {
    if (!genAIInstance) {
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
            console.error('❌ [AI] GEMINI_API_KEY is missing from environment');
            throw new Error('AI configuration missing');
        }
        genAIInstance = new GoogleGenerativeAI(key);
    }
    return genAIInstance;
};

/**
 * AI Scanner Controller
 * Specialized in extracting essential expense data from receipts and memos.
 */

// Helper function to try vision scanning with multiple models
const generateVisionWithFallback = async (content: any[], models: string[]) => {
    let lastError;

    for (const modelName of models) {
        try {
            console.log(`[AI SCAN] Attempting with model: ${modelName}`);
            const genAI = getGenAI();
            const model = genAI.getGenerativeModel({
                model: modelName
            });

            const result = await model.generateContent(content);
            const responseText = result.response.text();

            if (responseText) {
                console.log(`✅ [AI SCAN] Success with model: ${modelName}`);
                return responseText;
            }
        } catch (error: any) {
            console.warn(`❌ [AI SCAN] Failed with model ${modelName}:`, error.message);
            lastError = error;
            // Short wait before retry to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    throw lastError || new Error('All scanning models failed');
};

export const scanReceipt = async (req: Request, res: Response) => {
    try {
        const { image } = req.body; // Expecting base64 data
        if (!image) {
            return res.status(400).json({ message: 'No image data provided' });
        }

        // Convert base64 string if it contains prefix
        const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;

        // Determine mimeType (default to jpeg if not detectable)
        let mimeType = "image/jpeg";
        const match = image.match(/^data:([^;]+);base64,/);
        if (match) {
            mimeType = match[1];
        }

        const prompt = `
Analyze this receipt/memo image and extract exactly three fields.

Return ONLY a valid JSON object (no markdown, no explanation) with these exact fields:
- description: (string) A concise, readable description of the expense (e.g., "Dinner at Street Side", "Bus ticket to Sylhet").
- amount: (number) The total numerical value in BDT. Extract only the number, no currency symbols. 
- category: (string) Choose exactly one from: "Food", "Transport", "Accommodation", "Sightseeing".

Guidelines:
1. If the amount is in Bengali numerals (১,২,৩...), convert them to English numbers (1,2,3...).
2. For Category: 
   - Use "Food" for restaurants, snacks, or groceries.
   - Use "Transport" for bus, train, rickshaw, or fuel.
   - Use "Accommodation" for hotels or resorts.
   - Use "Sightseeing" for entry fees or tour guides.
3. If the image is unclear, provide your best guess for description and amount, and default category to "Food".

Return ONLY valid JSON.
        `;

        const content = [
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            }
        ];

        // Models to try - matching the hierarchy from AI Planner
        const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'];

        const responseText = await generateVisionWithFallback(content, models);

        // Clean up response - remove markdown code blocks if present
        let jsonText = responseText.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        // Parse the JSON response
        const parsedData = JSON.parse(jsonText.trim());

        // Standardize response for frontend
        const result = {
            description: parsedData.description || "Receipt Scanned",
            amount: parsedData.amount || 0,
            category: parsedData.category || "Food"
        };

        res.json(result);
    } catch (error: any) {
        console.error("Gemini Scan Error:", error);
        res.status(500).json({ message: "AI Scan failed: " + error.message });
    }
};
