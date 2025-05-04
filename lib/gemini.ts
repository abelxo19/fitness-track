// lib/gemini.ts
import { GoogleGenAI } from "@google/genai";

export interface UserProfile {
  age: number;
  gender: string;
  height: number;
  weight: number;
  activityLevel: string;
  fitnessGoal: string;
  dietaryRestrictions?: string[];
  medicalConditions?: string;
  availableEquipment?: string;
  timeCommitment?: string;
}

export type DailyMealPlan = {
  day: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks?: string[];
};

export type WorkoutDay = {
  day: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    notes?: string;
  }>;
};

export interface FitnessPlan {
  initialAssessment: string;
  nutritionPlan: {
    overview: string;
    dailyCalories: string;
    macros: {
      protein: string;
      carbs: string;
      fats: string;
    };
    mealPlans: Array<{
      day: string;
      meals: Array<{
        name: string;
        description: string;
        calories: string;
        macros: string;
      }>;
    }>;
  };
  workoutPlan: {
    overview: string;
    weeklySplit: Array<{
      day: string;
      focus: string;
      exercises: Array<{
        name: string;
        sets: string;
        reps: string;
        notes: string;
      }>;
    }>;
  };
  dietaryTips: string[];
}

const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export async function generateFitnessPlan(profile: UserProfile): Promise<FitnessPlan> {
  try {
    const prompt = `Generate a comprehensive fitness and nutrition plan for a user with the following profile:
    Age: ${profile.age}
    Gender: ${profile.gender}
    Height: ${profile.height} cm
    Weight: ${profile.weight} kg
    Activity Level: ${profile.activityLevel}
    Fitness Goals: ${profile.fitnessGoal || "General fitness"}
    Dietary Restrictions: ${profile.dietaryRestrictions?.join(", ") || "None"}
    Medical Conditions: ${profile.medicalConditions || 'None'}
    Available Equipment: ${profile.availableEquipment || 'Basic home equipment'}
    Time Commitment: ${profile.timeCommitment || '30-60 minutes per day'}

    IMPORTANT: You must return a valid JSON object with the following structure. Do not include any markdown, text, or explanations outside the JSON:
    {
      "initialAssessment": "A brief 2-3 sentence assessment of the user's current state and goals",
      "nutritionPlan": {
        "overview": "A brief overview of the nutrition strategy",
        "dailyCalories": "Recommended daily calorie intake (e.g., '2000-2200 calories')",
        "macros": {
          "protein": "Protein target in grams (e.g., '120-150g')",
          "carbs": "Carb target in grams (e.g., '200-250g')",
          "fats": "Fat target in grams (e.g., '60-70g')"
        },
        "mealPlans": [
          {
            "day": "Day 1",
            "meals": [
              {
                "name": "Breakfast",
                "description": "Detailed meal description with portions",
                "calories": "Calorie count (e.g., '450 calories')",
                "macros": "Macro breakdown (e.g., '30g protein, 45g carbs, 15g fat')"
              }
            ]
          }
        ]
      },
      "workoutPlan": {
        "overview": "A brief overview of the workout strategy",
        "weeklySplit": [
          {
            "day": "Monday",
            "focus": "Muscle group or type of training",
            "exercises": [
              {
                "name": "Exercise name",
                "sets": "Number of sets (e.g., '3-4 sets')",
                "reps": "Rep range (e.g., '8-12 reps')",
                "notes": "Additional instructions or modifications"
              }
            ]
          }
        ]
      },
      "dietaryTips": [
        "Tip 1: Keep hydrated throughout the day",
        "Tip 2: Eat protein-rich foods within 30 minutes after workouts",
        "Tip 3: Include healthy fats in your diet"
      ]
    }

    Remember:
    1. Return ONLY the JSON object
    2. No markdown formatting
    3. No explanations outside the JSON
    4. All text values should be strings
    5. Include at least 3 workout days and 2 meal plans
    6. Make tips specific and actionable`

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    })
    
    if (!response.text) {
      throw new Error("No response received from Gemini")
    }

    // Remove any markdown formatting and extract just the JSON
    const jsonMatch = response.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini")
    }

    const jsonStr = jsonMatch[0]
    const plan = JSON.parse(jsonStr) as FitnessPlan

    // Validate the plan structure
    if (!plan.initialAssessment || !plan.nutritionPlan || !plan.workoutPlan || !plan.dietaryTips) {
      throw new Error("Generated plan is missing required fields")
    }

    return plan
  } catch (error) {
    console.error("Gemini generation error:", error)
    throw error
  }
}
