const GEMINI_API_KEY = "AIzaSyBXJUcg6Fz182Z2xHDEJ2B_f5wcvqVUJRo"
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent"

export interface UserProfile {
  age: number
  gender: string
  weight: number
  height: number
  activityLevel: string
  fitnessGoal: string
  dietaryRestrictions?: string[]
}

// Fallback plan generator when API fails
const generateFallbackPlan = (userProfile: UserProfile): string => {
  const { age, gender, weight, height, activityLevel, fitnessGoal, dietaryRestrictions = [] } = userProfile

  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  let bmr = 0
  if (gender.toLowerCase() === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161
  }

  // Adjust for activity level
  let tdee = bmr // Total Daily Energy Expenditure
  switch (activityLevel.toLowerCase()) {
    case "sedentary":
      tdee *= 1.2
      break
    case "light":
      tdee *= 1.375
      break
    case "moderate":
      tdee *= 1.55
      break
    case "active":
      tdee *= 1.725
      break
    case "very-active":
      tdee *= 1.9
      break
    default:
      tdee *= 1.5 // Default to moderate
  }

  // Adjust calories based on fitness goal
  let calorieTarget = tdee
  let proteinGrams = 0
  let carbGrams = 0
  let fatGrams = 0

  switch (fitnessGoal.toLowerCase()) {
    case "weight-loss":
      calorieTarget = tdee - 500 // 500 calorie deficit
      proteinGrams = weight * 2.2 // Higher protein for weight loss
      carbGrams = (calorieTarget * 0.4) / 4 // 40% carbs
      fatGrams = (calorieTarget * 0.3) / 9 // 30% fat
      break
    case "muscle-gain":
      calorieTarget = tdee + 300 // 300 calorie surplus
      proteinGrams = weight * 2 // High protein for muscle gain
      carbGrams = (calorieTarget * 0.5) / 4 // 50% carbs
      fatGrams = (calorieTarget * 0.25) / 9 // 25% fat
      break
    default:
      // Maintenance or general fitness
      calorieTarget = tdee
      proteinGrams = weight * 1.6 // Moderate protein
      carbGrams = (calorieTarget * 0.45) / 4 // 45% carbs
      fatGrams = (calorieTarget * 0.3) / 9 // 30% fat
  }

  // Round to nearest whole numbers
  calorieTarget = Math.round(calorieTarget)
  proteinGrams = Math.round(proteinGrams)
  carbGrams = Math.round(carbGrams)
  fatGrams = Math.round(fatGrams)

  // Generate workout plan based on fitness goal
  let workoutPlan = ""

  if (fitnessGoal.toLowerCase().includes("weight-loss")) {
    workoutPlan = `
WEEKLY WORKOUT SCHEDULE:

Monday: Cardio
- 30 minutes of moderate-intensity cardio (jogging, cycling, or elliptical)
- 15 minutes of HIIT (30 seconds high intensity, 30 seconds rest)
- Core workout: 3 sets of 15 reps for planks, crunches, and leg raises

Tuesday: Upper Body
- Push-ups: 3 sets of 10-15 reps
- Dumbbell rows: 3 sets of 12 reps per arm
- Shoulder press: 3 sets of 12 reps
- Tricep dips: 3 sets of 12 reps
- Bicep curls: 3 sets of 12 reps

Wednesday: Active Recovery
- 45 minutes of walking
- Light stretching routine

Thursday: Lower Body
- Bodyweight squats: 3 sets of 15 reps
- Lunges: 3 sets of 12 reps per leg
- Glute bridges: 3 sets of 15 reps
- Calf raises: 3 sets of 20 reps
- Wall sit: 3 sets of 30 seconds

Friday: Cardio and Core
- 30 minutes of moderate-intensity cardio
- Core circuit: 3 rounds of planks, Russian twists, and mountain climbers

Saturday: Full Body
- Circuit training: 3 rounds of squats, push-ups, rows, and jumping jacks
- 20 minutes of moderate-intensity cardio

Sunday: Rest
- Light stretching or yoga if desired
`
  } else if (fitnessGoal.toLowerCase().includes("muscle-gain")) {
    workoutPlan = `
WEEKLY WORKOUT SCHEDULE:

Monday: Chest and Triceps
- Bench press or push-ups: 4 sets of 8-10 reps
- Incline dumbbell press: 3 sets of 10 reps
- Chest flyes: 3 sets of 12 reps
- Tricep pushdowns: 3 sets of 12 reps
- Overhead tricep extension: 3 sets of 10 reps

Tuesday: Back and Biceps
- Pull-ups or lat pulldowns: 4 sets of 8-10 reps
- Bent-over rows: 3 sets of 10 reps
- One-arm dumbbell rows: 3 sets of 10 reps per arm
- Bicep curls: 3 sets of 12 reps
- Hammer curls: 3 sets of 12 reps

Wednesday: Rest or Light Cardio
- 20-30 minutes of walking or light cycling
- Stretching routine

Thursday: Legs
- Squats: 4 sets of 8-10 reps
- Deadlifts: 3 sets of 8 reps
- Lunges: 3 sets of 10 reps per leg
- Leg press: 3 sets of 12 reps
- Calf raises: 4 sets of 15 reps

Friday: Shoulders and Core
- Overhead press: 4 sets of 8-10 reps
- Lateral raises: 3 sets of 12 reps
- Front raises: 3 sets of 12 reps
- Planks: 3 sets of 45 seconds
- Russian twists: 3 sets of 15 reps per side

Saturday: Full Body or Lagging Muscle Groups
- Choose 5-6 compound exercises
- 3 sets of 8-12 reps for each exercise

Sunday: Rest
- Complete rest day to allow for recovery
`
  } else {
    workoutPlan = `
WEEKLY WORKOUT SCHEDULE:

Monday: Full Body
- Squats: 3 sets of 12 reps
- Push-ups: 3 sets of 10-15 reps
- Rows: 3 sets of 12 reps
- Overhead press: 3 sets of 12 reps
- Planks: 3 sets of 30 seconds

Tuesday: Cardio
- 30-45 minutes of moderate-intensity cardio
- Options: jogging, cycling, swimming, or elliptical

Wednesday: Upper Body
- Chest press: 3 sets of 12 reps
- Rows: 3 sets of 12 reps
- Shoulder press: 3 sets of 12 reps
- Tricep dips: 3 sets of 12 reps
- Bicep curls: 3 sets of 12 reps

Thursday: Active Recovery
- 30 minutes of walking
- Yoga or stretching routine

Friday: Lower Body
- Squats: 3 sets of 12 reps
- Lunges: 3 sets of 10 reps per leg
- Glute bridges: 3 sets of 15 reps
- Calf raises: 3 sets of 15 reps
- Core exercises: 3 sets of 30 seconds each

Saturday: Cardio and Core
- 20 minutes of interval training
- Core circuit: 3 rounds of various exercises

Sunday: Rest
- Light activity if desired, such as walking or stretching
`
  }

  // Generate meal plan considering dietary restrictions
  let mealPlan = `
DAILY MEAL PLAN:

Calorie Target: ${calorieTarget} calories per day
Protein: ${proteinGrams}g (${Math.round(((proteinGrams * 4) / calorieTarget) * 100)}% of calories)
Carbs: ${carbGrams}g (${Math.round(((carbGrams * 4) / calorieTarget) * 100)}% of calories)
Fat: ${fatGrams}g (${Math.round(((fatGrams * 9) / calorieTarget) * 100)}% of calories)

Breakfast Options:
`

  // Adjust meal suggestions based on dietary restrictions
  if (dietaryRestrictions.includes("vegan")) {
    mealPlan += `- Oatmeal with plant-based protein powder, berries, and nuts
- Tofu scramble with vegetables and whole grain toast
- Smoothie with plant-based protein, spinach, banana, and almond butter

Lunch Options:
- Quinoa bowl with roasted vegetables, chickpeas, and tahini dressing
- Lentil soup with whole grain bread
- Buddha bowl with brown rice, edamame, avocado, and vegetables

Dinner Options:
- Stir-fried tofu with vegetables and brown rice
- Bean and vegetable chili with quinoa
- Chickpea pasta with tomato sauce and nutritional yeast

Snack Options:
- Apple with almond butter
- Hummus with vegetable sticks
- Trail mix with nuts and dried fruit
- Protein smoothie with plant-based protein`
  } else if (dietaryRestrictions.includes("vegetarian")) {
    mealPlan += `- Greek yogurt with berries and granola
- Vegetable omelet with whole grain toast
- Smoothie with whey protein, spinach, banana, and nut butter

Lunch Options:
- Quinoa salad with feta, vegetables, and chickpeas
- Lentil soup with whole grain bread
- Cottage cheese with fruit and nuts

Dinner Options:
- Stir-fried tofu with vegetables and brown rice
- Bean and vegetable chili with quinoa
- Vegetable curry with brown rice

Snack Options:
- Greek yogurt with honey
- Hummus with vegetable sticks
- Cottage cheese with fruit
- Protein smoothie`
  } else if (dietaryRestrictions.includes("gluten-free")) {
    mealPlan += `- Greek yogurt with berries and gluten-free granola
- Eggs with vegetables and gluten-free toast
- Smoothie with protein powder, spinach, banana, and nut butter

Lunch Options:
- Quinoa bowl with grilled chicken and vegetables
- Lentil soup (check for gluten-free broth)
- Salad with grilled protein, avocado, and gluten-free dressing

Dinner Options:
- Grilled protein (fish, chicken, or tofu) with roasted vegetables and quinoa
- Stir-fry with rice noodles
- Stuffed bell peppers with ground turkey and rice

Snack Options:
- Rice cakes with nut butter
- Gluten-free protein bar
- Greek yogurt with fruit
- Hard-boiled eggs`
  } else {
    mealPlan += `- Greek yogurt with berries and granola
- Eggs with whole grain toast and avocado
- Protein smoothie with banana, spinach, and nut butter

Lunch Options:
- Grilled chicken salad with mixed vegetables
- Turkey and avocado wrap with side salad
- Tuna salad sandwich on whole grain bread

Dinner Options:
- Grilled salmon with roasted vegetables and quinoa
- Lean beef stir-fry with brown rice
- Chicken breast with sweet potato and steamed broccoli

Snack Options:
- Greek yogurt with honey
- Apple with nut butter
- Protein bar
- Handful of nuts and dried fruit`
  }

  // Combine everything into a complete plan
  return `
PERSONALIZED FITNESS AND NUTRITION PLAN
=======================================

PERSONAL STATS:
- Age: ${age}
- Gender: ${gender}
- Weight: ${weight} kg
- Height: ${height} cm
- Activity Level: ${activityLevel}
- Fitness Goal: ${fitnessGoal}
- Dietary Restrictions: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(", ") : "None"}

CALORIE AND MACRONUTRIENT TARGETS:
- Daily Calorie Target: ${calorieTarget} calories
- Protein: ${proteinGrams}g per day
- Carbohydrates: ${carbGrams}g per day
- Fat: ${fatGrams}g per day

${workoutPlan}

${mealPlan}

TIPS FOR SUCCESS:
1. Stay consistent with your workout routine
2. Drink at least 2-3 liters of water daily
3. Aim for 7-8 hours of quality sleep each night
4. Track your progress weekly (measurements, weight, or photos)
5. Adjust your plan as needed based on your progress
6. Remember that consistency is more important than perfection

Note: This is a fallback plan generated when the AI service was unavailable. For a more personalized plan, please try again later.
`
}

export async function generateFitnessPlan(userProfile: UserProfile) {
  try {
    console.log("Generating fitness plan for user profile:", userProfile)

    // Try the API first, even with default key
    const prompt = `
      Create a personalized fitness and nutrition plan for a ${userProfile.age} year old ${userProfile.gender} in Ethiopia.
      Weight: ${userProfile.weight} kg
      Height: ${userProfile.height} cm
      Activity Level: ${userProfile.activityLevel}
      Fitness Goal: ${userProfile.fitnessGoal}
      Dietary Restrictions: ${userProfile.dietaryRestrictions?.join(", ") || "None"}
      
      Please provide a culturally appropriate plan that includes:

      1. Weekly Workout Schedule:
      - Include both home-based and gym exercises
      - Keep exercises beginner to intermediate level
      - Focus on exercises that can be done with minimal equipment
      - Include traditional Ethiopian activities like running or walking

      2. Daily Meal Plan:
      - Include 1-2 traditional Ethiopian dishes per day (e.g., injera, shiro, kitfo, doro wat, tibs, genfo)
      - Mix with globally recognized healthy meals
      - Consider local availability of ingredients
      - Include approximate nutrition info (calories, protein, carbs, fat) for each meal
      - Breakfast, lunch, dinner, and snacks
      - Consider Ethiopian dietary preferences and common ingredients

      3. Nutrition Guidelines:
      - Estimated daily calorie target
      - Macronutrient breakdown (protein, carbs, fat)
      - Portion sizes using local measurements
      - Tips for healthy Ethiopian cooking methods

      4. Tips for Success:
      - Include culturally relevant advice
      - Consider local lifestyle and daily routines
      - Address common challenges in the Ethiopian context
      - Include traditional wisdom about health and fitness

      Format the plan in a clear, structured way with sections for each day.
      Make sure all suggestions are realistic and achievable in an Ethiopian context.
    `

    console.log("Sending request to Gemini API...")

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      console.log("API request failed, using fallback plan")
      return generateFallbackPlan(userProfile)
    }

    const data = await response.json()
    console.log("Received response from Gemini API")

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text
    } else {
      console.log("Invalid API response format, using fallback plan")
      return generateFallbackPlan(userProfile)
    }
  } catch (error) {
    console.log("Error in plan generation, using fallback plan")
    return generateFallbackPlan(userProfile)
  }
}
