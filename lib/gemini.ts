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

// Ethiopian food recipes with nutritional information for fitness
const ethiopianFoods = [
  {
    name: "Azifa (Ethiopian Lentil Salad)",
    description: "A protein-rich cold lentil dish with jalapeño, onions, lime juice, and spices. High in protein and fiber, making it perfect for post-workout recovery.",
    recipe: "1 cup green lentils, 1 jalapeño pepper (seeded and finely chopped), 1/4 cup finely chopped onions, 1 tsp ginger powder, 1/4 tsp turmeric, 3 tbsp lime juice, 2 tbsp olive oil. Boil lentils until soft, drain and cool. Mix with remaining ingredients.",
    fitnessValue: "High in plant protein (18g per serving), fiber, and complex carbohydrates. Contains anti-inflammatory turmeric and ginger.",
    calories: "Around 250-300 calories per serving",
    macros: "18g protein, 35g carbs, 8g fat"
  },
  {
    name: "Gomen (Ethiopian Collard Greens)",
    description: "A nutrient-dense dish of collard greens or kale with garlic, ginger and olive oil. Excellent source of vitamins, minerals and antioxidants.",
    recipe: "1 pound collard greens or kale, 1/2 cup chopped onions, 2 tbsp olive oil, 1/2 tsp chopped garlic, 1/2 tsp ginger powder. Remove stems from greens, boil until tender. Sauté onions and garlic in oil, add ginger and cooked greens.",
    fitnessValue: "Rich in vitamins A, C, K, calcium, iron and folate. Supports recovery and reduces inflammation.",
    calories: "Around 120-150 calories per serving",
    macros: "4g protein, 10g carbs, 8g fat"
  },
  {
    name: "Misir Wot (Spiced Red Lentils)",
    description: "A hearty, protein-packed red lentil stew with berbere spice. Great for muscle recovery and sustained energy.",
    recipe: "1 cup red lentils, 1/2 cup chopped onions, 2 tbsp olive oil, 1-2 tbsp berbere spice blend, 1 tsp minced garlic, 1/2 tsp ginger. Sauté onions in oil, add berbere, garlic and ginger. Add lentils and water, simmer until cooked.",
    fitnessValue: "Excellent vegan protein source. Berbere contains capsaicin which may boost metabolism.",
    calories: "Around 250-300 calories per serving",
    macros: "15g protein, 40g carbs, 7g fat"
  },
  {
    name: "Kochkocha (Ethiopian Salsa)",
    description: "A fresh, low-calorie condiment made with jalapeños, onions, and spices. Great for adding flavor without excess calories.",
    recipe: "8 jalapeño peppers, 2 tbsp chopped onions, 1/2 tsp ginger, 1/2 tsp cardamom, 1/2 tsp coriander, 1/4 tsp cumin, 1/2 tsp basil, olive oil. Cook peppers and onions in oil, blend with spices until smooth.",
    fitnessValue: "Low calorie, capsaicin in jalapeños may boost metabolism and reduce appetite.",
    calories: "Around 30-40 calories per serving",
    macros: "1g protein, 3g carbs, 2g fat"
  },
  {
    name: "Ethiopian Cole Slaw",
    description: "A refreshing cabbage and carrot slaw with jalapeños, olive oil, and lemon juice. Good source of vitamins and fiber.",
    recipe: "3 large carrots, 4 jalapeño peppers, 1 pound cabbage, 3 tbsp olive oil, 1 tsp balsamic vinegar, 2 tbsp lemon juice. Cut veggies into small pieces, toss with oil, vinegar and lemon juice.",
    fitnessValue: "Rich in fiber, vitamins A and C. Low calorie and aids digestion.",
    calories: "Around 100-120 calories per serving",
    macros: "2g protein, 15g carbs, 5g fat"
  }
];

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
    
    // Randomly select 2 Ethiopian dishes to incorporate, ensuring they match dietary restrictions
    let selectedEthiopianFoods = [...ethiopianFoods];
    
    // Filter out dishes that conflict with dietary restrictions
    if (profile.dietaryRestrictions?.length) {
      if (profile.dietaryRestrictions.includes("vegetarian") || profile.dietaryRestrictions.includes("vegan")) {
        // All the Ethiopian dishes above are already plant-based, but this is where we'd filter if needed
      }
    }
    
    // Shuffle and take the first 2
    selectedEthiopianFoods = selectedEthiopianFoods
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    
    // Create Ethiopian food suggestions for the prompt
    const ethiopianFoodSuggestions = selectedEthiopianFoods.map(food => 
      `${food.name}: ${food.description} - ${food.fitnessValue} - Recipe: ${food.recipe} - Nutrition: ${food.calories}, ${food.macros}`
    ).join("\n\n");
    
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

    VERY IMPORTANT - ETHIOPIAN FOOD INTEGRATION:
    Include the following Ethiopian dishes in your meal plans (incorporate 1-2 of these across the week, not all at once):
    
    ${ethiopianFoodSuggestions}
    
    These Ethiopian dishes should replace 1-2 regular meals in the weekly plan. They should be integrated naturally within the meal plan and matched to appropriate times of day based on their nutritional profile and the user's goals.

    IMPORTANT: You must return a valid JSON object with the following structure. Do not include any markdown, text, or explanations outside the JSON:
    {
      "initialAssessment": "A brief 2-3 sentence assessment of the user's current state and goals",
      "nutritionPlan": {
        "overview": "A brief overview of the nutrition strategy that mentions incorporating Ethiopian dishes for nutritional variety",
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
    6. Make tips specific and actionable
    7. Be sure to include 1-2 of the Ethiopian dishes in the meal plans`

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
