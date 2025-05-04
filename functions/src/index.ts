import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

// Initialize Firebase Admin
admin.initializeApp()
const db = admin.firestore()

/**
 * Cloud Function that triggers when a new workout is added
 * It updates analytics data for the user
 */
export const processWorkoutAnalytics = functions.firestore
  .document("workouts/{workoutId}")
  .onCreate(async (snapshot, context) => {
    const workoutData = snapshot.data()
    const userId = workoutData.userId

    console.log(`Processing workout analytics for user ${userId}`)

    try {
      // Get the current date in YYYY-MM format for monthly analytics
      const workoutDate =
        workoutData.createdAt instanceof admin.firestore.Timestamp
          ? workoutData.createdAt.toDate()
          : new Date(workoutData.createdAt)

      const year = workoutDate.getFullYear()
      const month = String(workoutDate.getMonth() + 1).padStart(2, "0")
      const yearMonth = `${year}-${month}`

      // Reference to the user's analytics document
      const analyticsRef = db.collection("analytics").doc(userId)

      // Get or create analytics document
      const analyticsDoc = await analyticsRef.get()

      if (!analyticsDoc.exists) {
        // Create a new analytics document if it doesn't exist
        await analyticsRef.set({
          userId,
          workoutStats: {
            totalWorkouts: 1,
            totalDuration: workoutData.duration || 0,
            totalCaloriesBurned: workoutData.caloriesBurned || 0,
            workoutTypes: {
              [workoutData.type]: 1,
            },
            monthlyStats: {
              [yearMonth]: {
                workouts: 1,
                duration: workoutData.duration || 0,
                caloriesBurned: workoutData.caloriesBurned || 0,
              },
            },
          },
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        })
      } else {
        // Update existing analytics document
        const analyticsData = analyticsDoc.data()
        const workoutStats = analyticsData?.workoutStats || {}
        const workoutTypes = workoutStats.workoutTypes || {}
        const monthlyStats = workoutStats.monthlyStats || {}

        // Update workout type count
        workoutTypes[workoutData.type] = (workoutTypes[workoutData.type] || 0) + 1

        // Update or create monthly stats
        const monthData = monthlyStats[yearMonth] || { workouts: 0, duration: 0, caloriesBurned: 0 }
        monthData.workouts += 1
        monthData.duration += workoutData.duration || 0
        monthData.caloriesBurned += workoutData.caloriesBurned || 0
        monthlyStats[yearMonth] = monthData

        // Update analytics document
        await analyticsRef.update({
          "workoutStats.totalWorkouts": admin.firestore.FieldValue.increment(1),
          "workoutStats.totalDuration": admin.firestore.FieldValue.increment(workoutData.duration || 0),
          "workoutStats.totalCaloriesBurned": admin.firestore.FieldValue.increment(workoutData.caloriesBurned || 0),
          "workoutStats.workoutTypes": workoutTypes,
          "workoutStats.monthlyStats": monthlyStats,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        })
      }

      console.log(`Successfully processed workout analytics for user ${userId}`)
      return null
    } catch (error) {
      console.error(`Error processing workout analytics: ${error}`)
      return null
    }
  })

/**
 * Cloud Function that triggers when a new meal is added
 * It updates nutrition analytics data for the user
 */
export const processMealAnalytics = functions.firestore
  .document("meals/{mealId}")
  .onCreate(async (snapshot, context) => {
    const mealData = snapshot.data()
    const userId = mealData.userId

    console.log(`Processing meal analytics for user ${userId}`)

    try {
      // Get the current date in YYYY-MM format for monthly analytics
      const mealDate =
        mealData.createdAt instanceof admin.firestore.Timestamp
          ? mealData.createdAt.toDate()
          : new Date(mealData.createdAt)

      const year = mealDate.getFullYear()
      const month = String(mealDate.getMonth() + 1).padStart(2, "0")
      const yearMonth = `${year}-${month}`

      // Reference to the user's analytics document
      const analyticsRef = db.collection("analytics").doc(userId)

      // Get or create analytics document
      const analyticsDoc = await analyticsRef.get()

      if (!analyticsDoc.exists) {
        // Create a new analytics document if it doesn't exist
        await analyticsRef.set({
          userId,
          nutritionStats: {
            totalMeals: 1,
            totalCalories: mealData.calories || 0,
            totalProtein: mealData.protein || 0,
            totalCarbs: mealData.carbs || 0,
            totalFat: mealData.fat || 0,
            mealTypes: {
              [mealData.type]: 1,
            },
            monthlyStats: {
              [yearMonth]: {
                meals: 1,
                calories: mealData.calories || 0,
                protein: mealData.protein || 0,
                carbs: mealData.carbs || 0,
                fat: mealData.fat || 0,
              },
            },
          },
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        })
      } else {
        // Update existing analytics document
        const analyticsData = analyticsDoc.data()
        const nutritionStats = analyticsData?.nutritionStats || {}
        const mealTypes = nutritionStats.mealTypes || {}
        const monthlyStats = nutritionStats.monthlyStats || {}

        // Update meal type count
        mealTypes[mealData.type] = (mealTypes[mealData.type] || 0) + 1

        // Update or create monthly stats
        const monthData = monthlyStats[yearMonth] || {
          meals: 0,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        }
        monthData.meals += 1
        monthData.calories += mealData.calories || 0
        monthData.protein += mealData.protein || 0
        monthData.carbs += mealData.carbs || 0
        monthData.fat += mealData.fat || 0
        monthlyStats[yearMonth] = monthData

        // Update analytics document
        await analyticsRef.update({
          "nutritionStats.totalMeals": admin.firestore.FieldValue.increment(1),
          "nutritionStats.totalCalories": admin.firestore.FieldValue.increment(mealData.calories || 0),
          "nutritionStats.totalProtein": admin.firestore.FieldValue.increment(mealData.protein || 0),
          "nutritionStats.totalCarbs": admin.firestore.FieldValue.increment(mealData.carbs || 0),
          "nutritionStats.totalFat": admin.firestore.FieldValue.increment(mealData.fat || 0),
          "nutritionStats.mealTypes": mealTypes,
          "nutritionStats.monthlyStats": monthlyStats,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        })
      }

      console.log(`Successfully processed meal analytics for user ${userId}`)
      return null
    } catch (error) {
      console.error(`Error processing meal analytics: ${error}`)
      return null
    }
  })

/**
 * Cloud Function that generates weekly reports for users
 * Runs once a week (can be scheduled with Cloud Scheduler)
 */
export const generateWeeklyReports = functions.pubsub
  .schedule("every monday 00:00")
  .timeZone("America/New_York")
  .onRun(async (context) => {
    try {
      console.log("Starting weekly report generation")

      // Get all users
      const usersSnapshot = await db.collection("users").get()

      // Get the date range for the previous week
      const today = new Date()
      const lastWeekStart = new Date(today)
      lastWeekStart.setDate(today.getDate() - 7)

      // Process each user
      const promises = usersSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.data().userId

        try {
          // Get workouts from the last week
          const workoutsQuery = db
            .collection("workouts")
            .where("userId", "==", userId)
            .where("createdAt", ">=", lastWeekStart)
            .where("createdAt", "<=", today)

          const workoutsSnapshot = await workoutsQuery.get()

          // Get meals from the last week
          const mealsQuery = db
            .collection("meals")
            .where("userId", "==", userId)
            .where("createdAt", ">=", lastWeekStart)
            .where("createdAt", "<=", today)

          const mealsSnapshot = await mealsQuery.get()

          // Calculate weekly stats
          const weeklyStats = {
            workouts: workoutsSnapshot.size,
            totalWorkoutDuration: 0,
            totalCaloriesBurned: 0,
            meals: mealsSnapshot.size,
            totalCaloriesConsumed: 0,
            averageProtein: 0,
            averageCarbs: 0,
            averageFat: 0,
            startDate: lastWeekStart,
            endDate: today,
          }

          // Process workouts
          workoutsSnapshot.forEach((doc) => {
            const workout = doc.data()
            weeklyStats.totalWorkoutDuration += workout.duration || 0
            weeklyStats.totalCaloriesBurned += workout.caloriesBurned || 0
          })

          // Process meals
          let totalProtein = 0
          let totalCarbs = 0
          let totalFat = 0

          mealsSnapshot.forEach((doc) => {
            const meal = doc.data()
            weeklyStats.totalCaloriesConsumed += meal.calories || 0
            totalProtein += meal.protein || 0
            totalCarbs += meal.carbs || 0
            totalFat += meal.fat || 0
          })

          // Calculate averages if there are meals
          if (mealsSnapshot.size > 0) {
            weeklyStats.averageProtein = totalProtein / mealsSnapshot.size
            weeklyStats.averageCarbs = totalCarbs / mealsSnapshot.size
            weeklyStats.averageFat = totalFat / mealsSnapshot.size
          }

          // Save the weekly report
          await db.collection("reports").add({
            userId,
            type: "weekly",
            stats: weeklyStats,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          })

          console.log(`Generated weekly report for user ${userId}`)
        } catch (error) {
          console.error(`Error generating weekly report for user ${userId}: ${error}`)
        }
      })

      await Promise.all(promises)
      console.log("Weekly report generation completed")
      return null
    } catch (error) {
      console.error(`Error in weekly report generation: ${error}`)
      return null
    }
  })

/**
 * Cloud Function to recalculate all analytics for a user
 * Can be triggered manually or via HTTP request
 */
export const recalculateUserAnalytics = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.")
  }

  const userId = data.userId || context.auth.uid

  // Check if the caller is requesting their own analytics or is an admin
  if (userId !== context.auth.uid && context.auth.token.admin !== true) {
    throw new functions.https.HttpsError("permission-denied", "You can only recalculate your own analytics.")
  }

  console.log(`Recalculating analytics for user ${userId}`)

  try {
    // Get all workouts for the user
    const workoutsSnapshot = await db.collection("workouts").where("userId", "==", userId).get()

    // Get all meals for the user
    const mealsSnapshot = await db.collection("meals").where("userId", "==", userId).get()

    // Initialize analytics object
    const analytics = {
      userId,
      workoutStats: {
        totalWorkouts: workoutsSnapshot.size,
        totalDuration: 0,
        totalCaloriesBurned: 0,
        workoutTypes: {},
        monthlyStats: {},
      },
      nutritionStats: {
        totalMeals: mealsSnapshot.size,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        mealTypes: {},
        monthlyStats: {},
      },
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }

    // Process workouts
    workoutsSnapshot.forEach((doc) => {
      const workout = doc.data()
      const workoutDate =
        workout.createdAt instanceof admin.firestore.Timestamp
          ? workout.createdAt.toDate()
          : new Date(workout.createdAt)

      const year = workoutDate.getFullYear()
      const month = String(workoutDate.getMonth() + 1).padStart(2, "0")
      const yearMonth = `${year}-${month}`

      // Update total stats
      analytics.workoutStats.totalDuration += workout.duration || 0
      analytics.workoutStats.totalCaloriesBurned += workout.caloriesBurned || 0

      // Update workout types
      const workoutType = workout.type || "unknown"
      analytics.workoutStats.workoutTypes[workoutType] = (analytics.workoutStats.workoutTypes[workoutType] || 0) + 1

      // Update monthly stats
      if (!analytics.workoutStats.monthlyStats[yearMonth]) {
        analytics.workoutStats.monthlyStats[yearMonth] = {
          workouts: 0,
          duration: 0,
          caloriesBurned: 0,
        }
      }

      analytics.workoutStats.monthlyStats[yearMonth].workouts += 1
      analytics.workoutStats.monthlyStats[yearMonth].duration += workout.duration || 0
      analytics.workoutStats.monthlyStats[yearMonth].caloriesBurned += workout.caloriesBurned || 0
    })

    // Process meals
    mealsSnapshot.forEach((doc) => {
      const meal = doc.data()
      const mealDate =
        meal.createdAt instanceof admin.firestore.Timestamp ? meal.createdAt.toDate() : new Date(meal.createdAt)

      const year = mealDate.getFullYear()
      const month = String(mealDate.getMonth() + 1).padStart(2, "0")
      const yearMonth = `${year}-${month}`

      // Update total stats
      analytics.nutritionStats.totalCalories += meal.calories || 0
      analytics.nutritionStats.totalProtein += meal.protein || 0
      analytics.nutritionStats.totalCarbs += meal.carbs || 0
      analytics.nutritionStats.totalFat += meal.fat || 0

      // Update meal types
      const mealType = meal.type || "unknown"
      analytics.nutritionStats.mealTypes[mealType] = (analytics.nutritionStats.mealTypes[mealType] || 0) + 1

      // Update monthly stats
      if (!analytics.nutritionStats.monthlyStats[yearMonth]) {
        analytics.nutritionStats.monthlyStats[yearMonth] = {
          meals: 0,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        }
      }

      analytics.nutritionStats.monthlyStats[yearMonth].meals += 1
      analytics.nutritionStats.monthlyStats[yearMonth].calories += meal.calories || 0
      analytics.nutritionStats.monthlyStats[yearMonth].protein += meal.protein || 0
      analytics.nutritionStats.monthlyStats[yearMonth].carbs += meal.carbs || 0
      analytics.nutritionStats.monthlyStats[yearMonth].fat += meal.fat || 0
    })

    // Save the analytics
    await db.collection("analytics").doc(userId).set(analytics)

    console.log(`Successfully recalculated analytics for user ${userId}`)
    return { success: true, message: "Analytics recalculated successfully" }
  } catch (error) {
    console.error(`Error recalculating analytics: ${error}`)
    throw new functions.https.HttpsError("internal", "Error recalculating analytics")
  }
})
