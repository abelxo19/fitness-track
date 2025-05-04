import { collection, doc, getDoc, query, where, orderBy, getDocs, limit, setDoc } from "firebase/firestore"
import { db } from "./firebase"
import { getUserWorkouts } from "./firestore"
import { getUserMeals } from "./firestore"

interface Workout {
  id: string
  type: string
  duration: number
  caloriesBurned: number
  createdAt: any
  userId: string
}

interface Meal {
  id: string
  type: string
  calories: number
  protein: number
  carbs: number
  fat: number
  createdAt: any
  userId: string
}

// Fetch user analytics
export const getUserAnalytics = async (userId: string) => {
  try {
    console.log("Getting analytics for user:", userId)
    const analyticsRef = doc(db, "analytics", userId)
    const analyticsDoc = await getDoc(analyticsRef)

    if (analyticsDoc.exists()) {
      const data = analyticsDoc.data()
      console.log("Analytics found:", data)
      return data
    }

    // If no analytics exist, calculate them
    await recalculateAnalytics(userId)
    const newAnalyticsDoc = await getDoc(analyticsRef)
    return newAnalyticsDoc.exists() ? newAnalyticsDoc.data() : null
  } catch (error) {
    console.error("Error getting user analytics:", error)
    throw error
  }
}

// Fetch user weekly reports
export const getUserWeeklyReports = async (userId: string, limitCount = 4) => {
  try {
    console.log("Getting weekly reports for user:", userId)
    const q = query(
      collection(db, "reports"),
      where("userId", "==", userId),
      where("type", "==", "weekly"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    )

    const querySnapshot = await getDocs(q)
    const reports = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    console.log(`Found ${reports.length} weekly reports for user ${userId}`)
    return reports
  } catch (error) {
    console.error("Error getting weekly reports:", error)
    return []
  }
}

// Calculate and store user analytics
export const recalculateAnalytics = async (userId: string) => {
  try {
    console.log("Calculating analytics for user:", userId)
    
    // Get user's workouts and meals
    const workouts = await getUserWorkouts(userId, 100) as Workout[] // Get last 100 workouts
    const meals = await getUserMeals(userId, 100) as Meal[] // Get last 100 meals

    // Calculate workout statistics
    const workoutStats = {
      totalWorkouts: workouts.length,
      totalCaloriesBurned: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      totalDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      workoutTypes: workouts.reduce((types: Record<string, number>, w) => {
        types[w.type] = (types[w.type] || 0) + 1
        return types
      }, {}),
      averageCaloriesPerWorkout: workouts.length ? 
        workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0) / workouts.length : 0,
      averageDuration: workouts.length ?
        workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / workouts.length : 0,
    }

    // Calculate meal statistics
    const mealStats = {
      totalMeals: meals.length,
      totalCaloriesConsumed: meals.reduce((sum, m) => sum + (m.calories || 0), 0),
      totalProtein: meals.reduce((sum, m) => sum + (m.protein || 0), 0),
      totalCarbs: meals.reduce((sum, m) => sum + (m.carbs || 0), 0),
      totalFat: meals.reduce((sum, m) => sum + (m.fat || 0), 0),
      mealTypes: meals.reduce((types: Record<string, number>, m) => {
        types[m.type] = (types[m.type] || 0) + 1
        return types
      }, {}),
      averageCaloriesPerMeal: meals.length ?
        meals.reduce((sum, m) => sum + (m.calories || 0), 0) / meals.length : 0,
    }

    // Calculate overall statistics
    const overallStats = {
      netCalories: mealStats.totalCaloriesConsumed - workoutStats.totalCaloriesBurned,
      averageDailyCalories: meals.length ? mealStats.totalCaloriesConsumed / (meals.length / 3) : 0, // Assuming 3 meals per day
      averageDailyCaloriesBurned: workouts.length ? workoutStats.totalCaloriesBurned / (workouts.length / 3) : 0, // Assuming 3 workouts per week
    }

    // Combine all statistics
    const analytics = {
      userId,
      lastUpdated: new Date(),
      workoutStats,
      mealStats,
      overallStats,
    }

    // Save to Firestore
    const analyticsRef = doc(db, "analytics", userId)
    await setDoc(analyticsRef, analytics)

    console.log("Analytics calculated and saved:", analytics)
    return analytics
  } catch (error) {
    console.error("Error calculating analytics:", error)
    throw error
  }
}
