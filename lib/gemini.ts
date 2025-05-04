import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!); // Make sure it's set

export async function generateFitnessPlan(profile: {
  age: number;
  gender: string;
  weight: number;
  height: number;
  activityLevel: string;
}) {
  const prompt = `Create a personalized fitness and meal plan for a ${profile.age}-year-old ${profile.gender} who weighs ${profile.weight}kg, is ${profile.height}cm tall, and has a ${profile.activityLevel} activity level. The plan should mix healthy Ethiopian meals (like injera with shiro, teff porridge, etc.) with globally accessible foods. Include a daily workout suggestion with nutrition guidance.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error: any) {
    console.error("Gemini generation error:", error.message || error);
    throw new Error("Failed to generate Gemini fitness plan");
  }
}
