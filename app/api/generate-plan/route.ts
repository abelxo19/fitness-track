import { GoogleAuth } from 'google-auth-library';
import { NextResponse } from 'next/server';

const VERTEX_API_URL = "https://us-central1-aiplatform.googleapis.com/v1/projects/fitness-tracker-458718/locations/us-central1/publishers/google/models/gemini-pro:generateContent"

export async function POST(request: Request) {
  try {
    const userProfile = await request.json();
    console.log("Received user profile:", userProfile);

    const prompt = `
      Create a personalized fitness and nutrition plan for a ${userProfile.age} year old ${userProfile.gender}.
      Weight: ${userProfile.weight} kg
      Height: ${userProfile.height} cm
      Activity Level: ${userProfile.activityLevel}
      Fitness Goal: ${userProfile.fitnessGoal}
      Dietary Restrictions: ${userProfile.dietaryRestrictions?.join(", ") || "None"}
      
      Please provide a comprehensive plan that includes:

      1. Weekly Workout Schedule:
      - Include both home-based and gym exercises
      - Keep exercises beginner to intermediate level
      - Focus on exercises that can be done with minimal equipment
      - Include cardio, strength training, and flexibility exercises
      - Specify sets, reps, and rest periods
      - Include progression recommendations

      2. Daily Meal Plan:
      - Calculate and provide daily calorie target based on:
        * Basal Metabolic Rate (BMR)
        * Activity level
        * Fitness goal (weight loss, muscle gain, or maintenance)
      - Provide macronutrient breakdown (protein, carbs, fat)
      - Include 4-5 meals per day (breakfast, lunch, dinner, and snacks)
      - Focus on nutrient-dense, whole foods
      - Include portion sizes and meal timing
      - Consider dietary restrictions and preferences

      3. Nutrition Guidelines:
      - Daily calorie target
      - Macronutrient ratios
      - Hydration recommendations
      - Pre and post-workout nutrition
      - Supplement recommendations (if applicable)
      - Meal timing and frequency

      4. Progress Tracking:
      - Weekly measurements to track
      - Performance metrics to monitor
      - How to adjust the plan based on progress
      - When to increase intensity or volume

      5. Tips for Success:
      - Recovery strategies
      - Sleep recommendations
      - Stress management
      - Consistency tips
      - Common pitfalls to avoid

      Format the plan in a clear, structured way with specific, actionable items.
      Make sure all suggestions are realistic, achievable, and aligned with the user's fitness goals.
      Include specific numbers for calories, macros, sets, reps, and rest periods.
    `;

    console.log("Initializing Google Auth...");
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      projectId: 'fitness-tracker-458718'
    });

    console.log("Getting auth client...");
    const client = await auth.getClient();
    
    console.log("Getting access token...");
    const token = await client.getAccessToken();
    console.log("Got access token");

    console.log("Sending request to Vertex AI...");
    const response = await fetch(VERTEX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token.token}`,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Vertex AI error response:", errorText);
      throw new Error(`Vertex AI request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Received response from Vertex AI");

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid response format:", data);
      throw new Error("Invalid Vertex AI response format");
    }

    return NextResponse.json({ plan: data.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error("Error in generate-plan API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate fitness plan. Please try again." },
      { status: 500 }
    );
  }
} 