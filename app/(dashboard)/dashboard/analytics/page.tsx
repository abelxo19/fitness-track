// TODO: Add analytics page
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getUserAnalytics, getUserWeeklyReports, recalculateAnalytics } from "@/lib/analytics"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Activity,
  AlertCircle,
  BarChart,
  Calendar,
  Dumbbell,
  Flame,
  LineChart,
  PieChart,
  RefreshCcw,
  Utensils,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart as RechartsLineChart,
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  Tooltip,
} from "recharts"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          setLoading(true)
          setError("")

          // Fetch analytics data
          const analyticsData = await getUserAnalytics(user.uid)
          setAnalytics(analyticsData)

          // Fetch weekly reports
          const reportsData = await getUserWeeklyReports(user.uid)
          setReports(reportsData)
        } catch (err: any) {
          console.error("Error fetching analytics data:", err)
          setError(`Failed to load analytics data: ${err.message}`)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleRecalculate = async () => {
    if (!user) return

    setRecalculating(true)
    try {
      await recalculateAnalytics(user.uid)

      // Refetch analytics after recalculation
      const analyticsData = await getUserAnalytics(user.uid)
      setAnalytics(analyticsData)

      // Refetch reports
      const reportsData = await getUserWeeklyReports(user.uid)
      setReports(reportsData)
    } catch (err: any) {
      console.error("Error recalculating analytics:", err)
      setError(`Failed to recalculate analytics: ${err.message}`)
    } finally {
      setRecalculating(false)
    }
  }

  // Prepare data for charts
  const prepareWorkoutTypeData = () => {
    if (!analytics?.workoutStats?.workoutTypes) return []

    return Object.entries(analytics.workoutStats.workoutTypes).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    }))
  }

  const prepareMealTypeData = () => {
    if (!analytics?.nutritionStats?.mealTypes) return []

    return Object.entries(analytics.nutritionStats.mealTypes).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
    }))
  }

  const prepareMonthlyWorkoutData = () => {
    if (!analytics?.workoutStats?.monthlyStats) return []

    return Object.entries(analytics.workoutStats.monthlyStats)
      .map(([month, stats]: [string, any]) => ({
        month,
        workouts: stats.workouts,
        duration: stats.duration,
        caloriesBurned: stats.caloriesBurned,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  const prepareMonthlyNutritionData = () => {
    if (!analytics?.nutritionStats?.monthlyStats) return []

    return Object.entries(analytics.nutritionStats.monthlyStats)
      .map(([month, stats]: [string, any]) => ({
        month,
        meals: stats.meals,
        calories: stats.calories,
        protein: stats.protein,
        carbs: stats.carbs,
        fat: stats.fat,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

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
          {[1, 2].map((i) => (
            <Card key={i} className="h-80">
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-60 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track your fitness and nutrition progress over time.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!analytics ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              No Analytics Data
            </CardTitle>
            <CardDescription>Start logging workouts and meals to see your analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Once you've logged some activities, we'll analyze your data and provide insights on your progress.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRecalculate} disabled={recalculating} className="flex items-center gap-2">
              {recalculating ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Calculate Analytics
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
                <Dumbbell className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.workoutStats?.totalWorkouts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.workoutStats?.totalDuration || 0} minutes total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
                <Utensils className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.nutritionStats?.totalMeals || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.nutritionStats?.totalCalories || 0} calories total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.workoutStats?.totalCaloriesBurned || 0}</div>
                <p className="text-xs text-muted-foreground">All time total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nutrition Balance</CardTitle>
                <Activity className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.nutritionStats?.totalProtein
                    ? `${Math.round(analytics.nutritionStats.totalProtein)}g`
                    : "0g"}
                </div>
                <p className="text-xs text-muted-foreground">Total protein consumed</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleRecalculate}
              disabled={recalculating}
            >
              {recalculating ? (
                <>
                  <RefreshCcw className="h-3 w-3 animate-spin" />
                  Recalculating...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-3 w-3" />
                  Recalculate Analytics
                </>
              )}
            </Button>
          </div>

          <Tabs defaultValue="workouts">
            <TabsList>
              <TabsTrigger value="workouts">Workout Analytics</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition Analytics</TabsTrigger>
              <TabsTrigger value="reports">Weekly Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="workouts" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Workout Types
                    </CardTitle>
                    <CardDescription>Distribution of your workout activities</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ChartContainer
                      config={{
                        workout: {
                          label: "Workout Types",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={prepareWorkoutTypeData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {prepareWorkoutTypeData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={ChartTooltipContent} />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Monthly Progress
                    </CardTitle>
                    <CardDescription>Your workout activity over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ChartContainer
                      config={{
                        workouts: {
                          label: "Workouts",
                          color: "hsl(var(--chart-1))",
                        },
                        duration: {
                          label: "Duration (min)",
                          color: "hsl(var(--chart-2))",
                        },
                        caloriesBurned: {
                          label: "Calories Burned",
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={prepareMonthlyWorkoutData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip content={ChartTooltipContent} />
                          <Legend />
                          <Line type="monotone" dataKey="workouts" stroke="var(--color-workouts)" />
                          <Line type="monotone" dataKey="duration" stroke="var(--color-duration)" />
                          <Line type="monotone" dataKey="caloriesBurned" stroke="var(--color-caloriesBurned)" />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Meal Types
                    </CardTitle>
                    <CardDescription>Distribution of your meal types</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ChartContainer
                      config={{
                        meal: {
                          label: "Meal Types",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={prepareMealTypeData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {prepareMealTypeData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={ChartTooltipContent} />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5" />
                      Macronutrient Distribution
                    </CardTitle>
                    <CardDescription>Monthly protein, carbs, and fat intake</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ChartContainer
                      config={{
                        protein: {
                          label: "Protein (g)",
                          color: "hsl(var(--chart-1))",
                        },
                        carbs: {
                          label: "Carbs (g)",
                          color: "hsl(var(--chart-2))",
                        },
                        fat: {
                          label: "Fat (g)",
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={prepareMonthlyNutritionData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip content={ChartTooltipContent} />
                          <Legend />
                          <Bar dataKey="protein" fill="var(--color-protein)" />
                          <Bar dataKey="carbs" fill="var(--color-carbs)" />
                          <Bar dataKey="fat" fill="var(--color-fat)" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              {reports.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {reports.map((report, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Weekly Report
                        </CardTitle>
                        <CardDescription>
                          {new Date(report.stats.startDate.seconds * 1000).toLocaleDateString()} to{" "}
                          {new Date(report.stats.endDate.seconds * 1000).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Workout Summary</h4>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <p className="text-sm text-muted-foreground">Workouts</p>
                                <p className="text-lg font-medium">{report.stats.workouts}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="text-lg font-medium">{report.stats.duration} min</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No weekly reports available yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
