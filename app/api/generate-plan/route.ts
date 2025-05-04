// app/api/generate-plan/route.ts

import { GoogleAuth } from 'google-auth-library';
import { NextResponse } from 'next/server';

// --- CHANGE THIS LINE ---
// OLD: const VERTEX_API_URL = "https://us-central1-aiplatform.googleapis.com/v1/projects/fitness-tracker-458718/locations/us-central1/publishers/google/models/gemini-1.0-pro:generateContent"
// NEW: Use the specific version from the documentation
const VERTEX_API_URL = "https://us-central1-aiplatform.googleapis.com/v1/projects/fitness-tracker-458718/locations/us-central1/publishers/google/models/gemini-1.0-pro-002:generateContent"
// --- END CHANGE ---
// Note: We are still using :generateContent, which is fine for non-streaming requests.
// The docs showed :streamGenerateContent in the curl example, but generateContent is also valid.

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
      ... [rest of your detailed prompt] ...

      Format the plan in a clear, structured way with specific, actionable items.
      Make sure all suggestions are realistic, achievable, and aligned with the user's fitness goals.
      Include specific numbers for calories, macros, sets, reps, and rest periods.
    `;

    console.log("Initializing Google Auth for Vertex AI...");
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      projectId: 'fitness-tracker-458718'
    });

    console.log("Getting auth client...");
    const client = await auth.getClient();

    console.log("Getting access token...");
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse?.token; // Added optional chaining for safety

    if (!accessToken) {
        throw new Error("Failed to retrieve access token.");
    }
    console.log("Got access token.");

    console.log(`Sending request to Vertex AI URL: ${VERTEX_API_URL}`);
    const response = await fetch(VERTEX_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        contents: [ // Using array format, which is correct for generateContent
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
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Vertex AI error response status: ${response.status}`);
      console.error(`Vertex AI error response body: ${errorText}`);
      let detailedError = `Vertex AI request failed with status ${response.status}`;
      try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.message) {
              detailedError += `: ${errorJson.error.message}`;
          } else {
              detailedError += `: ${errorText}`;
          }
      } catch(e) {
          detailedError += `: ${errorText}`;
      }
       throw new Error(detailedError);
    }

    const data = await response.json();
    console.log("Received response from Vertex AI");

    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      console.error("Invalid response format from Vertex AI:", JSON.stringify(data, null, 2));
      throw new Error("Invalid or empty response format received from Vertex AI.");
    }

    return NextResponse.json({ plan: generatedText });

  } catch (error) {
    console.error("Error in /api/generate-plan route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during plan generation.";
    return NextResponse.json(
      { error: `Failed to generate fitness plan: ${errorMessage}` },
      { status: 500 }
    );
  }
}