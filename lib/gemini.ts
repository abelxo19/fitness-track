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
    sets: string;
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
    // Generate a random training style to introduce variety
    const trainingStyles = [
      "traditional bodybuilding", 
      "functional training", 
      "circuit training", 
      "HIIT", 
      "strength training", 
      "endurance focused", 
      "athletic performance",
      "mobility and flexibility",
      "power and explosive movements",
      "compound exercise focused",
      "mind-muscle connection focused"
    ];
    
    // Generate a random nutrition approach for variety
    const nutritionApproaches = [
      "balanced macronutrient distribution",
      "carb cycling",
      "higher protein focus",
      "whole food based",
      "Mediterranean-inspired",
      "nutrient timing focused",
      "plant-centered",
      "paleo-inspired",
      "intermittent fasting compatible",
      "anti-inflammatory focused"
    ];
    
    // Generate random meal timing approach
    const mealTimings = [
      "3 meals with 2 snacks",
      "5 smaller meals throughout the day",
      "intermittent fasting with 8-hour eating window",
      "3 larger meals with no snacks",
      "pre and post workout nutrition focus"
    ];
    
    // Pick random elements
    const randomStyle = trainingStyles[Math.floor(Math.random() * trainingStyles.length)];
    const randomNutrition = nutritionApproaches[Math.floor(Math.random() * nutritionApproaches.length)];
    const randomMealTiming = mealTimings[Math.floor(Math.random() * mealTimings.length)];
    
    // Create a unique timestamp identifier to ensure variety
    const uniqueId = Date.now().toString().slice(-5);
    
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

    IMPORTANT INSTRUCTIONS FOR VARIETY (Generation ID: ${uniqueId}):
    1. Use a ${randomStyle} approach for the workout design
    2. Create a nutrition plan based on ${randomNutrition} principles
    3. Structure meal timing as ${randomMealTiming}
    4. Be creative and include unique exercises and meal suggestions
    5. DO NOT recycle common templates - make this plan truly personalized
    6. Use very specific exercises rather than generic ones
    7. Include specific food suggestions with quantities

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
      contents: prompt,
      // Remove unsupported parameters for this version of the API
      // temperature: 0.8,
      // topK: 40,
      // topP: 0.95
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
