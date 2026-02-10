import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface TripRequest {
    from: string;
    to: string;
    days: number;
    people: number;
}

// Helper function to try generating content with multiple models
const generateWithFallback = async (prompt: string, models: string[]) => {
    let lastError;

    for (const modelName of models) {
        try {
            console.log(`Attempting to generate with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            if (text) {
                console.log(`✅ Success with model: ${modelName}`);
                return text;
            }
        } catch (error: any) {
            console.warn(`❌ Failed with model ${modelName}:`, error.message);
            lastError = error;
            // Wait 1 second before trying next model to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    throw lastError || new Error('All models failed to generate content');
};

export const generateTripPlan = async (req: Request, res: Response) => {
    try {
        const { from, to, days, people, locale }: TripRequest & { locale?: string } = req.body;

        console.log('=== AI PLANNER REQUEST ===');
        console.log('Request Body:', { from, to, days, people });

        // Validate input
        if (!from || !to || !days || !people) {
            return res.status(400).json({
                success: false,
                message: 'All fields (from, to, days, people) are required',
            });
        }

        if (days < 1 || days > 30) {
            return res.status(400).json({
                success: false,
                message: 'Trip duration must be between 1 and 30 days',
            });
        }

        if (people < 1 || people > 20) {
            return res.status(400).json({
                success: false,
                message: 'Number of people must be between 1 and 20',
            });
        }

        // Create detailed prompt for Gemini
        const nights = days > 1 ? days - 1 : 0;
        const durationText = `${days} Days, ${nights} Nights`;

        const prompt = `You are an expert Bangladesh tourism planner specializing in **budget-friendly travel**. Create a detailed, **cost-effective** ${days}-day trip plan for ${people} ${people === 1 ? 'person' : 'people'} traveling from ${from} to ${to}.

Provide a comprehensive tour plan in the following JSON format (respond with ONLY valid JSON, no markdown or extra text):

{
  "tripOverview": {
    "title": "Trip title",
    "destination": "${to}",
    "duration": "${days} Days, ${nights} Nights",
    "travelers": ${people},
    "bestTimeToVisit": "Brief description"
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "Morning/Afternoon/Evening",
          "activity": "Activity description",
          "location": "Location name",
          "duration": "Duration",
          "cost": "Estimated cost in BDT per person",
          "tips": "Travel tips"
        }
      ],
      "meals": {
        "breakfast": "Best local food item (Price Range: Low to Luxury)",
        "lunch": "Best local food item (Price Range: Low to Luxury)",
        "dinner": "Best local food item (Price Range: Low to Luxury)"
      },
      "accommodation": {
        "type": "Hotel/Resort category",
        "suggestion": "Name and brief description (Budget: ...)"
      }
    }
  ],
  "budget": {
    "accommodation": {
      "perNight": 2000,
      "total": 6000,
      "description": "Budget hotels"
    },
    "food": {
      "perDay": 800,
      "total": 2400,
      "description": "Local restaurants (Low to Mid-range)"
    },
    "transportation": {
      "travelCost": 1500,
      "localTransport": 1000,
      "total": 2500,
      "description": "Bus/Train + rickshaw/CNG"
    },
    "activities": {
      "total": 2000,
      "description": "Entry fees, boat rides, etc."
    },
    "miscellaneous": {
      "total": 1000,
      "description": "Shopping, emergencies"
    },
    "grandTotal": 13900,
    "perPerson": 3475,
    "currency": "BDT"
  },
  "mustTryFood": [
    {
      "item": "Name of food",
      "description": "Why it's famous",
      "cost": "Price range (e.g., 100-300 BDT)"
    }
  ],
  "essentialTips": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ],
  "packingList": [
    "Item 1",
    "Item 2"
  ],
  "localContacts": {
    "emergencyNumbers": ["999 - Emergency", "333 - Fire Service"],
    "touristPolice": "Number if applicable"
  }
}

IMPORTANT REQUIREMENTS:
1. Focus on **cheapest and budget-friendly** options within Bangladesh
2. All costs must be in BDT (Bangladeshi Taka)
3. Budget should scale with the number of people (${people} travelers)
4. Include popular spots but focus on **low-cost** local cuisine and experiences
5. Be specific with location names, timings, and practical advice
6. Consider travel time between locations
7. **Prioritize public transport (Bus/Train) over private cars to save money**
8. Provide budget breakdown for ${people} ${people === 1 ? 'person' : 'people'}
9. Include transportation from ${from} to ${to}
10. Return ONLY valid JSON, no markdown code blocks or extra text
12. **For food, recommend the BEST and MOST AUTHENTIC local dishes to try**.
13. **Do NOT suggest generic food (like standard Biryani or Chinese) unless the city is famous for it.**
14. **Research specific regional delicacies** using this priority list:
    - **Old Dhaka**: Kacchi Biryani, Bakarkhani, Borhani
    - **Chattogram**: Kala Bhuna (Beef), Mezbani Beef, Akhni
    - **Sylhet**: Shatkora Beef, Seven Layer Tea (Srimangal), Chunga Pitha, Akhni Biryani, Panshi Vorta Platters
    - **Sajek Valley**: Bamboo Chicken, Pahari Murgi (Hill Chicken), Bamboo Tea, Pahari Kola (Banana)
    - **Cox's Bazar / St. Martin**: Loitta Fry (Bombay Duck), Rupchanda BBQ, Red Snapper/Coral Fish, Coconut Water (St. Martin)
    - **Kuakata**: Crab Masala, Shutki Bhuna (Dried Fish), Rakhine Fish Curry, Seaweed Snacks
    - **Sundarban**: Wild Honey, Chingri Malai Curry (Prawns), Bhetki Paturi, Mud Crab Curry
    - **Khulna**: Chui Jhal (Beef/Mutton), Golda Chingri
    - **Bogra**: Mishti Doi
    - **Comilla**: Rasmalai
    - **Natore**: Kacha Golla
    - **Rajshahi**: Kalai Ruti with Hasher Mangsho, Mango
    - **Barisal**: Hilsa Fish (Ilish), Pitha
15. **For food prices, give a RANGE (e.g., 150 - 500 BDT).**
16. **Duration format MUST be exactly '${days} Days, ${nights} Nights'**
17. **Include a distinct list of 'Must Try Food' items with costs.**
18. **LANGUAGE REQUIREMENT**: ${locale === 'bn' ? 'Provide all titles, descriptions, food names, and tips in **Bengali**, but keep the JSON keys (keys only!) exactly as defined above in English.' : 'Provide everything in English.'}

Create a memorable and **wallet-friendly** trip plan!`;

        // Available models ordered by preference - User selected models
        const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro'];

        const text = await generateWithFallback(prompt, models);

        // Clean the response - remove markdown code blocks if present
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        // Parse and return the trip plan
        const parsedPlan = JSON.parse(cleanedText);

        return res.status(200).json({
            success: true,
            data: parsedPlan,
            message: 'Trip plan generated successfully',
        });
    } catch (error: any) {
        console.error('AI Planner Error:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            type: error.type,
        });
        return res.status(500).json({
            success: false,
            message: 'Failed to generate trip plan',
            error: error.message || 'Internal server error',
        });
    }
};
