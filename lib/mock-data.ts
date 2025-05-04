// Mock data for development when Firestore is not available
export const mockWorkouts = [
  {
    id: "workout1",
    type: "running",
    duration: 30,
    intensity: "medium",
    caloriesBurned: 300,
    notes: "Morning run in the park",
    createdAt: new Date(),
  },
  {
    id: "workout2",
    type: "weight training",
    duration: 45,
    intensity: "high",
    caloriesBurned: 400,
    notes: "Upper body day",
    createdAt: new Date(Date.now() - 86400000), // Yesterday
  },
  {
    id: "workout3",
    type: "yoga",
    duration: 60,
    intensity: "low",
    caloriesBurned: 200,
    notes: "Evening yoga session",
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
  },
]

export const mockMeals = [
  {
    id: "meal1",
    name: "Grilled Chicken Salad",
    type: "lunch",
    calories: 450,
    protein: 35,
    carbs: 20,
    fat: 15,
    notes: "Added extra avocado",
    createdAt: new Date(),
  },
  {
    id: "meal2",
    name: "Protein Smoothie",
    type: "breakfast",
    calories: 300,
    protein: 25,
    carbs: 30,
    fat: 5,
    notes: "Used almond milk",
    createdAt: new Date(Date.now() - 86400000), // Yesterday
  },
  {
    id: "meal3",
    name: "Salmon with Vegetables",
    type: "dinner",
    calories: 550,
    protein: 40,
    carbs: 25,
    fat: 20,
    notes: "Steamed broccoli and carrots",
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
  },
]

export const mockProfile = {
  id: "profile1",
  name: "John Doe",
  age: 30,
  gender: "male",
  weight: 75,
  height: 180,
  activityLevel: "moderate",
  fitnessGoal: "muscle-gain",
}
