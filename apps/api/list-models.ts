import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing in .env file");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // const modelList = await genAI.listModels(); // This method might not exist in older SDK versions? checking docs
        // Actually, listModels is available on the GoogleGenerativeAI instance in recent versions.
        // However, the docs say it's on the client. Let's try. 
        // Wait, the SDK creates a client. The `listModels` might be on a different manager.
        // Let's use the fetch approach if SDK method is tricky or just try the SDK method first as per user suggestion.
        // The user suggested `genAI.listModels()` but in the node SDK it might be different.
        // Checking @google/generative-ai documentation... usually it's `genAI.getGenerativeModel` directly.
        // There isn't a direct listModels on the main class in some versions.
        // Let's try a direct fetch to the API endpoint which is more reliable for listing.

        // Using fetch for certainty
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json() as any;

        console.log("--- Available Gemini Models ---");
        if (data.models) {
            data.models.forEach((m: any) => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`Model: ${m.name.replace('models/', '')}`);
                    console.log(`   - Version: ${m.version}`);
                    console.log(`   - Display Name: ${m.displayName}`);
                }
            });
        } else {
            console.error("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
