"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile, getUserWorkouts, getUserMeals, testFirestorePermissions } from "@/lib/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, AlertCircle, BarChart2, Dumbbell, Flame, RefreshCcw, Utensils, Calendar, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { mockWorkouts, mockMeals, mockProfile } from "@/lib/mock-data"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15 
    }
  }
};

export default function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [workouts, setWorkouts] = useState<any[]>([])
  const [meals, setMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [permissionStatus, setPermissionStatus] = useState<any>(null)
  const [testingPermissions, setTestingPermissions] = useState(false)

  const fetchData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      console.log("Fetching dashboard data for user:", user.uid)
      setLoading(true)
      setError("")

      let firestoreError = false

      // Fetch user profile
      try {
        const profileData = await getUserProfile(user.uid)
        setProfile(profileData)
        console.log("Profile data fetched:", profileData)
      } catch (profileError: any) {
        console.error("Error fetching profile:", profileError)
        firestoreError = true
        // Fall back to mock data
        setProfile(mockProfile)
      }

      // Fetch recent workouts
      try {
        const workoutsData = await getUserWorkouts(user.uid, 5)
        setWorkouts(workoutsData || [])
        console.log(`Fetched ${workoutsData?.length || 0} workouts`)
      } catch (workoutsError: any) {
        console.error("Error fetching workouts:", workoutsError)
        firestoreError = true
        // Fall back to mock data
        setWorkouts(mockWorkouts)
      }

      // Fetch recent meals
      try {
        const mealsData = await getUserMeals(user.uid, 5)
        setMeals(mealsData || [])
        console.log(`Fetched ${mealsData?.length || 0} meals`)
      } catch (mealsError: any) {
        console.error("Error fetching meals:", mealsError)
        firestoreError = true
        // Fall back to mock data
        setMeals(mockMeals)
      }

      if (firestoreError) {
        setError("Failed to load data from Firestore. Using mock data for development.")
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err)
      setError(`Failed to load dashboard data: ${err.message}`)

      // Fall back to mock data
      setProfile(mockProfile)
      setWorkouts(mockWorkouts)
      setMeals(mockMeals)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const testPermissions = async () => {
    if (!user) return

    setTestingPermissions(true)
    try {
      const result = await testFirestorePermissions(user.uid)
      setPermissionStatus(result)

      if (result.success) {
        // If permissions test passes, try fetching data again
        await fetchData()
      }
    } catch (error: any) {
      setPermissionStatus({
        success: false,
        message: `Error testing permissions: ${error.message}`,
      })
    } finally {
      setTestingPermissions(false)
    }
  }

  // Calculate today's stats
  const today = new Date().toISOString().split("T")[0]

  const todaysWorkouts = workouts.filter((workout) => {
    if (!workout?.createdAt) return false
    // Handle both Firestore timestamp and regular Date objects
    const workoutDate = workout.createdAt.seconds
      ? new Date(workout.createdAt.seconds * 1000).toISOString().split("T")[0]
      : new Date(workout.createdAt).toISOString().split("T")[0]
    return workoutDate === today
  })

  const todaysMeals = meals.filter((meal) => {
    if (!meal?.createdAt) return false
    // Handle both Firestore timestamp and regular Date objects
    const mealDate = meal.createdAt.seconds
      ? new Date(meal.createdAt.seconds * 1000).toISOString().split("T")[0]
      : new Date(meal.createdAt).toISOString().split("T")[0]
    return mealDate === today
  })

  const caloriesBurned = todaysWorkouts.reduce((total, workout) => total + (workout?.caloriesBurned || 0), 0)
  const caloriesConsumed = todaysMeals.reduce((total, meal) => total + (meal?.calories || 0), 0)
  const workoutMinutes = todaysWorkouts.reduce((total, workout) => total + (workout?.duration || 0), 0)
  
  // Calculate net calories
  const netCalories = caloriesConsumed - caloriesBurned
  const isCalorieDeficit = netCalories < 0

  // Format date for display
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date"

    // Handle Firestore timestamp
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString()
    }

    // Handle string or Date object
    return new Date(timestamp).toLocaleDateString()
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-6">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        <Skeleton className="h-[200px] w-full rounded-xl" />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[120px] rounded-lg" />
          ))}
        </div>

        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8 px-4 py-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Greeting Header with Gradient */}
      <motion.div variants={fadeIn} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-purple-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{getGreeting()}{profile?.name ? `, ${profile.name}` : ""}!</h1>
          <p className="text-primary-foreground/80 max-w-xl">
            Track your fitness journey and stay on top of your health goals. Here's your daily summary.
          </p>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </Badge>
            
            {profile?.fitnessGoal && (
              <Badge className="bg-purple-500/30 hover:bg-purple-500/40 text-white border-none">
                Goal: {profile.fitnessGoal.replace(/-/g, " ")}
              </Badge>
            )}
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20">
          <BarChart2 className="h-32 w-32 text-white" />
        </div>
      </motion.div>

      {error && (
        <motion.div variants={fadeIn}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Stats Overview Cards */}
      <motion.div 
        variants={fadeIn} 
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={cardVariant}>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
            <div className="h-1 bg-blue-500 w-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workout Time</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Dumbbell className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workoutMinutes} min</div>
              <p className="text-xs text-muted-foreground">Today's workout duration</p>
              <Progress 
                className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 [&>div]:bg-blue-500" 
                value={Math.min(workoutMinutes / 60, 100)} 
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariant}>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
            <div className="h-1 bg-orange-500 w-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
              <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{caloriesBurned}</div>
              <p className="text-xs text-muted-foreground">Through today's workouts</p>
              <Progress 
                className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 [&>div]:bg-orange-500" 
                value={Math.min(caloriesBurned / 500, 100)} 
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariant}>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
            <div className="h-1 bg-green-500 w-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calories Consumed</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Utensils className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{caloriesConsumed}</div>
              <p className="text-xs text-muted-foreground">Through today's meals</p>
              <Progress 
                className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 [&>div]:bg-green-500" 
                value={Math.min(caloriesConsumed / 2000, 100)} 
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariant}>
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
            <div className="h-1 bg-purple-500 w-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calorie Balance</CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className={`h-4 w-4 ${isCalorieDeficit ? "text-green-500" : "text-orange-500"}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isCalorieDeficit ? "text-green-500" : "text-orange-500"}`}>
                {isCalorieDeficit ? `-${Math.abs(netCalories)}` : `+${netCalories}`}
              </div>
              <p className="text-xs text-muted-foreground">
                {isCalorieDeficit ? "Calorie deficit" : "Calorie surplus"}
              </p>
              <Progress 
                className={`mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 ${isCalorieDeficit ? "[&>div]:bg-green-500" : "[&>div]:bg-orange-500"}`}
                value={50} 
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Refresh Button */}
      <motion.div variants={fadeIn} className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
          onClick={fetchData} 
          disabled={loading}
        >
          <span>Refresh Data</span>
          {loading ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
        </Button>
      </motion.div>

      {/* Recent Activity Tabs */}
      <motion.div variants={fadeIn}>
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 pb-0">
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <Tabs defaultValue="workouts" className="w-full">
              <TabsList className="w-full bg-transparent justify-start h-12 px-0 mt-4">
                <TabsTrigger 
                  value="workouts" 
                  className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-t-lg rounded-b-none border-b-2 data-[state=active]:border-primary h-full"
                >
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4" />
                    <span>Workouts</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="meals" 
                  className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-t-lg rounded-b-none border-b-2 data-[state=active]:border-primary h-full"
                >
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    <span>Meals</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <CardContent className="p-0">
                <div className="bg-white dark:bg-gray-800 p-6">
                  <TabsContent value="workouts" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    {workouts.length > 0 ? (
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        {workouts.map((workout, index) => (
                          <Card key={index} className="border-none shadow-sm hover:shadow transition-shadow bg-gray-50 dark:bg-gray-900">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg capitalize flex items-center gap-2">
                                    <span>{workout.type}</span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        workout.intensity === 'high' 
                                          ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' 
                                          : workout.intensity === 'medium'
                                            ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
                                            : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                                      }`}
                                    >
                                      {workout.intensity}
                                    </Badge>
                                  </CardTitle>
                                  <CardDescription className="mt-1">
                                    {workout.createdAt ? formatDate(workout.createdAt) : "Unknown date"}
                                  </CardDescription>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                  <Dumbbell className="h-5 w-5 text-blue-500" />
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-gray-800 p-2 rounded-md text-center">
                                  <p className="text-xs text-muted-foreground">Duration</p>
                                  <p className="font-medium">{workout.duration} min</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-2 rounded-md text-center">
                                  <p className="text-xs text-muted-foreground">Calories</p>
                                  <p className="font-medium">{workout.caloriesBurned || "N/A"}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-2 rounded-md text-center">
                                  <p className="text-xs text-muted-foreground">Intensity</p>
                                  <p className="font-medium capitalize">{workout.intensity}</p>
                                </div>
                              </div>
                              
                              {workout.notes && (
                                <div className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-md">
                                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                  <p className="text-sm">{workout.notes}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="inline-flex items-center justify-center h-12 w-12 bg-blue-100 dark:bg-blue-900/30 mb-4 rounded-full">
                          <Dumbbell className="h-6 w-6 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No Recent Workouts</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          Start logging your fitness activities to track your progress and reach your goals.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="meals" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    {meals.length > 0 ? (
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        {meals.map((meal, index) => (
                          <Card key={index} className="border-none shadow-sm hover:shadow transition-shadow bg-gray-50 dark:bg-gray-900">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    {meal.name}
                                    {meal.type && (
                                      <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 text-xs capitalize">
                                        {meal.type}
                                      </Badge>
                                    )}
                                  </CardTitle>
                                  <CardDescription className="mt-1">
                                    {meal.createdAt ? formatDate(meal.createdAt) : "Unknown date"}
                                  </CardDescription>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                  <Utensils className="h-5 w-5 text-green-500" />
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-4 gap-2">
                                <div className="bg-white dark:bg-gray-800 p-2 rounded-md text-center">
                                  <p className="text-xs text-muted-foreground">Calories</p>
                                  <p className="font-medium">{meal.calories}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-2 rounded-md text-center">
                                  <p className="text-xs text-muted-foreground">Protein</p>
                                  <p className="font-medium">{meal.protein}g</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-2 rounded-md text-center">
                                  <p className="text-xs text-muted-foreground">Carbs</p>
                                  <p className="font-medium">{meal.carbs}g</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-2 rounded-md text-center">
                                  <p className="text-xs text-muted-foreground">Fat</p>
                                  <p className="font-medium">{meal.fat}g</p>
                                </div>
                              </div>
                              
                              {meal.notes && (
                                <div className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-md">
                                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                  <p className="text-sm">{meal.notes}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="inline-flex items-center justify-center h-12 w-12 bg-green-100 dark:bg-green-900/30 mb-4 rounded-full">
                          <Utensils className="h-6 w-6 text-green-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No Recent Meals</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          Track your nutrition intake to maintain balanced meals and reach your health goals.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </CardContent>
            </Tabs>
          </CardHeader>
        </Card>
      </motion.div>
    </motion.div>
  )
}
