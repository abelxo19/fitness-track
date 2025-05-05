"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile, getUserWorkouts, getUserMeals, testFirestorePermissions } from "@/lib/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, AlertCircle, Dumbbell, Flame, RefreshCcw, Utensils } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { mockWorkouts, mockMeals, mockProfile } from "@/lib/mock-data"

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Skeleton className="h-10 w-64 mb-4" />

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col space-y-2 w-full">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{profile?.name ? `, ${profile.name}` : ""}! Here's your fitness summary.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
            <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="w-full">
            <div className="text-2xl font-bold">{caloriesBurned}</div>
            <p className="text-xs text-muted-foreground">Today's workout calories</p>
            <Progress className="mt-2 w-full" value={Math.min(caloriesBurned / 5, 100)} />
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
            <CardTitle className="text-sm font-medium">Calories Consumed</CardTitle>
            <Utensils className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="w-full">
            <div className="text-2xl font-bold">{caloriesConsumed}</div>
            <p className="text-xs text-muted-foreground">Today's meal calories</p>
            <Progress className="mt-2 w-full" value={Math.min(caloriesConsumed / 20, 100)} />
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
            <CardTitle className="text-sm font-medium">Workout Time</CardTitle>
            <Dumbbell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="w-full">
            <div className="text-2xl font-bold">{workoutMinutes} min</div>
            <p className="text-xs text-muted-foreground">Today's workout duration</p>
            <Progress className="mt-2 w-full" value={Math.min(workoutMinutes / 60, 100)} />
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
            <CardTitle className="text-sm font-medium">Activity Level</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="w-full">
            <div className="text-2xl font-bold">{todaysWorkouts.length > 0 ? "Active" : "Rest Day"}</div>
            <p className="text-xs text-muted-foreground">Based on today's activities</p>
            <Progress className="mt-2 w-full" value={todaysWorkouts.length > 0 ? 75 : 25} />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end w-full">
        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={fetchData} disabled={loading}>
          Refresh Data
          {loading ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
        </Button>
      </div>

      <Tabs defaultValue="workouts" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="workouts" className="flex-1">Recent Workouts</TabsTrigger>
          <TabsTrigger value="meals" className="flex-1">Recent Meals</TabsTrigger>
        </TabsList>
        <TabsContent value="workouts" className="space-y-4 w-full">
          {workouts.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full">
              {workouts.map((workout, index) => (
                <Card key={index} className="w-full">
                  <CardHeader className="w-full">
                    <CardTitle className="capitalize">{workout.type}</CardTitle>
                    <CardDescription>
                      {workout.createdAt ? formatDate(workout.createdAt) : "Unknown date"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="w-full">
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p>{workout.duration} minutes</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Intensity</p>
                        <p className="capitalize">{workout.intensity}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Calories</p>
                        <p>{workout.caloriesBurned || "N/A"}</p>
                      </div>
                      {workout.notes && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium">Notes</p>
                          <p className="text-sm text-muted-foreground">{workout.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p>No recent workouts. Start logging your fitness activities!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="meals" className="space-y-4">
          {meals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {meals.map((meal, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{meal.name}</CardTitle>
                    <CardDescription>
                      {meal.type && <span className="capitalize">{meal.type}</span>} •{" "}
                      {meal.createdAt ? formatDate(meal.createdAt) : "Unknown date"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Calories</p>
                        <p>{meal.calories}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Protein</p>
                        <p>{meal.protein}g</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Carbs</p>
                        <p>{meal.carbs}g</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Fat</p>
                        <p>{meal.fat}g</p>
                      </div>
                      {meal.notes && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium">Notes</p>
                          <p className="text-sm text-muted-foreground">{meal.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p>No recent meals. Start tracking your nutrition!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
