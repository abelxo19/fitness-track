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
  intensity?: string
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
  name?: string
}

// Helper function to group data by month
const groupByMonth = (items: any[], getDate: (item: any) => Date, getValue: (item: any) => any) => {
  const months: Record<string, any> = {};
  
  items.forEach(item => {
    const date = getDate(item);
    if (!date) return;
    
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const value = getValue(item);
    
    if (!months[monthKey]) {
      months[monthKey] = {
        count: 0,
        total: 0,
      };
    }
    
    months[monthKey].count += 1;
    months[monthKey].total += value || 0;
  });
  
  return months;
};

// Helper to calculate trends (percentage change between latest periods)
const calculateTrend = (currentValue: number, previousValue: number): number => {
  if (previousValue === 0) return currentValue > 0 ? 100 : 0;
  return ((currentValue - previousValue) / previousValue) * 100;
};

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
    const workouts = await getUserWorkouts(userId, 200) as Workout[] // Get last 200 workouts
    const meals = await getUserMeals(userId, 200) as Meal[] // Get last 200 meals

    // Process workouts to get timestamps
    const processedWorkouts = workouts.map(w => ({
      ...w,
      timestamp: w.createdAt?.seconds 
        ? new Date(w.createdAt.seconds * 1000) 
        : new Date(w.createdAt)
    }));
    
    // Process meals to get timestamps
    const processedMeals = meals.map(m => ({
      ...m,
      timestamp: m.createdAt?.seconds 
        ? new Date(m.createdAt.seconds * 1000) 
        : new Date(m.createdAt)
    }));
    
    // Sort by date (newest first)
    processedWorkouts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    processedMeals.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Group workouts by month
    const workoutsByMonth = groupByMonth(
      processedWorkouts,
      w => w.timestamp,
      w => 1
    );
    
    const caloriesByMonth = groupByMonth(
      processedWorkouts,
      w => w.timestamp,
      w => w.caloriesBurned
    );
    
    const durationByMonth = groupByMonth(
      processedWorkouts,
      w => w.timestamp,
      w => w.duration
    );
    
    // Group meals by month
    const mealsByMonth = groupByMonth(
      processedMeals,
      m => m.timestamp,
      m => 1
    );
    
    const caloriesConsumedByMonth = groupByMonth(
      processedMeals,
      m => m.timestamp,
      m => m.calories
    );
    
    const proteinByMonth = groupByMonth(
      processedMeals,
      m => m.timestamp,
      m => m.protein
    );
    
    const carbsByMonth = groupByMonth(
      processedMeals,
      m => m.timestamp,
      m => m.carbs
    );
    
    const fatByMonth = groupByMonth(
      processedMeals,
      m => m.timestamp,
      m => m.fat
    );
    
    // Format monthly data for charts
    const monthlyStats = Object.keys(workoutsByMonth)
      .sort() // Sort by date
      .reduce((acc, month) => {
        acc[month] = {
          workouts: workoutsByMonth[month]?.count || 0,
          duration: durationByMonth[month]?.total || 0,
          caloriesBurned: caloriesByMonth[month]?.total || 0,
          meals: mealsByMonth[month]?.count || 0,
          calories: caloriesConsumedByMonth[month]?.total || 0,
          protein: proteinByMonth[month]?.total || 0,
          carbs: carbsByMonth[month]?.total || 0,
          fat: fatByMonth[month]?.total || 0,
        };
        return acc;
      }, {} as Record<string, any>);
    
    // Calculate workout statistics
    const workoutStats = {
      totalWorkouts: workouts.length,
      totalCaloriesBurned: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      totalDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      workoutTypes: workouts.reduce((types: Record<string, number>, w) => {
        const type = w.type || 'unknown';
        types[type] = (types[type] || 0) + 1;
        return types;
      }, {}),
      averageCaloriesPerWorkout: workouts.length ? 
        workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0) / workouts.length : 0,
      averageDuration: workouts.length ?
        workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / workouts.length : 0,
      // Add intensity distribution
      intensityDistribution: workouts.reduce((dist: Record<string, number>, w) => {
        const intensity = w.intensity || 'medium';
        dist[intensity] = (dist[intensity] || 0) + 1;
        return dist;
      }, {}),
      // Recent trends
      recentTrends: {
        lastMonthWorkouts: 0,
        workoutsTrend: 0,
        caloriesBurnedTrend: 0,
      },
      monthlyStats: monthlyStats,
    };
    
    // Calculate meal statistics
    const nutritionStats = {
      totalMeals: meals.length,
      totalCalories: meals.reduce((sum, m) => sum + (m.calories || 0), 0),
      totalProtein: meals.reduce((sum, m) => sum + (m.protein || 0), 0),
      totalCarbs: meals.reduce((sum, m) => sum + (m.carbs || 0), 0),
      totalFat: meals.reduce((sum, m) => sum + (m.fat || 0), 0),
      mealTypes: meals.reduce((types: Record<string, number>, m) => {
        const type = m.type || 'unknown';
        types[type] = (types[type] || 0) + 1;
        return types;
      }, {}),
      averageCaloriesPerMeal: meals.length ?
        meals.reduce((sum, m) => sum + (m.calories || 0), 0) / meals.length : 0,
      // Add macros percentage
      macrosPercentage: {
        protein: 0,
        carbs: 0,
        fat: 0,
      },
      // Recent trends
      recentTrends: {
        lastMonthMeals: 0,
        caloriesTrend: 0,
        proteinTrend: 0,
      },
      monthlyStats: monthlyStats,
    };
    
    // Calculate macros percentages
    const totalMacros = nutritionStats.totalProtein + nutritionStats.totalCarbs + nutritionStats.totalFat;
    if (totalMacros > 0) {
      nutritionStats.macrosPercentage = {
        protein: Math.round((nutritionStats.totalProtein / totalMacros) * 100),
        carbs: Math.round((nutritionStats.totalCarbs / totalMacros) * 100),
        fat: Math.round((nutritionStats.totalFat / totalMacros) * 100),
      };
    }
    
    // Calculate recent trends (compare current month with previous month)
    const months = Object.keys(monthlyStats).sort();
    if (months.length >= 2) {
      const currentMonth = months[months.length - 1];
      const previousMonth = months[months.length - 2];
      
      workoutStats.recentTrends = {
        lastMonthWorkouts: monthlyStats[currentMonth].workouts,
        workoutsTrend: calculateTrend(
          monthlyStats[currentMonth].workouts,
          monthlyStats[previousMonth].workouts
        ),
        caloriesBurnedTrend: calculateTrend(
          monthlyStats[currentMonth].caloriesBurned,
          monthlyStats[previousMonth].caloriesBurned
        ),
      };
      
      nutritionStats.recentTrends = {
        lastMonthMeals: monthlyStats[currentMonth].meals,
        caloriesTrend: calculateTrend(
          monthlyStats[currentMonth].calories,
          monthlyStats[previousMonth].calories
        ),
        proteinTrend: calculateTrend(
          monthlyStats[currentMonth].protein,
          monthlyStats[previousMonth].protein
        ),
      };
    }

    // Calculate overall statistics
    const overallStats = {
      netCalories: nutritionStats.totalCalories - workoutStats.totalCaloriesBurned,
      averageDailyCalories: meals.length ? nutritionStats.totalCalories / (meals.length / 3) : 0, // Assuming 3 meals per day
      averageDailyCaloriesBurned: workouts.length ? workoutStats.totalCaloriesBurned / (workouts.length / 3) : 0, // Assuming 3 workouts per week
      calorieBalance: {
        deficit: nutritionStats.totalCalories < workoutStats.totalCaloriesBurned,
        amount: Math.abs(nutritionStats.totalCalories - workoutStats.totalCaloriesBurned),
      },
      mostFrequentWorkout: Object.entries(workoutStats.workoutTypes)
        .sort((a, b) => b[1] - a[1])
        .map(([type]) => type)[0] || 'None',
      mostFrequentMeal: Object.entries(nutritionStats.mealTypes)
        .sort((a, b) => b[1] - a[1])
        .map(([type]) => type)[0] || 'None',
    };

    // Combine all statistics
    const analytics = {
      userId,
      lastUpdated: new Date(),
      workoutStats,
      nutritionStats,
      overallStats,
    };

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
