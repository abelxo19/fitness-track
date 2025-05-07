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
  TrendingUp,
  BarChart2,
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

    return Object.entries(analytics.workoutStats.workoutTypes)
      .filter(([_, count]) => (count as number) > 0)
      .map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count as number,
    }))
  }

  const prepareMealTypeData = () => {
    if (!analytics?.nutritionStats?.mealTypes) return []

    return Object.entries(analytics.nutritionStats.mealTypes)
      .filter(([_, count]) => (count as number) > 0)
      .map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count as number,
    }))
  }

  const prepareMonthlyWorkoutData = () => {
    if (!analytics?.workoutStats?.monthlyStats) return []

    return Object.entries(analytics.workoutStats.monthlyStats)
      .map(([month, stats]: [string, any]) => ({
        month: formatMonthLabel(month),
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
        month: formatMonthLabel(month),
        meals: stats.meals,
        calories: stats.calories,
        protein: stats.protein,
        carbs: stats.carbs,
        fat: stats.fat,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  // Format month labels for charts (e.g., "2023-01" to "Jan 2023")
  const formatMonthLabel = (monthKey: string) => {
    try {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    } catch (e) {
      return monthKey;
    }
  }

  // Calculate the percentage change and add + sign for positive values
  const formatTrend = (value: number) => {
    if (!value) return "0%";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-6">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-none shadow-md">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 w-full"></div>
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
            <Card key={i} className="h-80 border-none shadow-md">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500 w-full"></div>
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
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
    <motion.div 
      className="max-w-7xl mx-auto space-y-8 px-4 py-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Header with Gradient */}
      <motion.div variants={fadeIn} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics Dashboard</h1>
          <p className="text-primary-foreground/80 max-w-xl">
            Review your fitness and nutrition statistics to see your progress over time.
          </p>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </Badge>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20">
          <LineChart className="h-32 w-32 text-white" />
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

      {!analytics ? (
        <motion.div variants={cardVariant}>
          <Card className="overflow-hidden border-none shadow-md">
            <div className="h-1 bg-blue-500 w-full"></div>
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart className="h-5 w-5 text-blue-500" />
              No Analytics Data
            </CardTitle>
            <CardDescription>Start logging workouts and meals to see your analytics.</CardDescription>
          </CardHeader>
            <CardContent className="p-6">
            <p>Once you've logged some activities, we'll analyze your data and provide insights on your progress.</p>
          </CardContent>
            <CardFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
              <Button 
                onClick={handleRecalculate} 
                disabled={recalculating} 
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
              >
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
        </motion.div>
      ) : (
        <>
          {/* Stats Overview */}
          <motion.div variants={fadeIn}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Fitness Overview</h2>
              <Button
                onClick={handleRecalculate}
                variant="outline"
                size="sm"
                disabled={recalculating}
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {recalculating ? (
                  <>
                    <RefreshCcw className="h-3 w-3 animate-spin" />
                    <span>Recalculating...</span>
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-3 w-3" />
                    <span>Refresh Data</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            variants={fadeIn} 
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div variants={cardVariant}>
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                <div className="h-1 bg-blue-500 w-full"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Dumbbell className="h-4 w-4 text-blue-500" />
                  </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.workoutStats?.totalWorkouts || 0}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>
                      {formatTrend(analytics.workoutStats?.workoutTrend || 0)}
                    </span>
                    <span> vs last month</span>
                </p>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div variants={cardVariant}>
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                <div className="h-1 bg-orange-500 w-full"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Calories Burned</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Flame className="h-4 w-4 text-orange-500" />
                  </div>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{analytics.workoutStats?.totalCaloriesBurned || 0}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>
                      {formatTrend(analytics.workoutStats?.caloriesTrend || 0)}
                    </span>
                    <span> vs last month</span>
                </p>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div variants={cardVariant}>
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                <div className="h-1 bg-green-500 w-full"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Meals Logged</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Utensils className="h-4 w-4 text-green-500" />
                  </div>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{analytics.nutritionStats?.totalMeals || 0}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>
                      {formatTrend(analytics.nutritionStats?.mealsTrend || 0)}
                    </span>
                    <span> vs last month</span>
                  </p>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div variants={cardVariant}>
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                <div className="h-1 bg-purple-500 w-full"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Workout Duration</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Activity className="h-4 w-4 text-purple-500" />
                  </div>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{analytics.workoutStats?.totalDuration || 0} min</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>
                      {formatTrend(analytics.workoutStats?.durationTrend || 0)}
                    </span>
                    <span> vs last month</span>
                  </p>
              </CardContent>
            </Card>
            </motion.div>
          </motion.div>

          {/* Tabs for different charts */}
          <motion.div variants={fadeIn}>
            <Tabs defaultValue="workouts" className="w-full">
              <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <TabsTrigger value="workouts" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4" />
                    <span>Workouts</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    <span>Nutrition</span>
          </div>
                </TabsTrigger>
                <TabsTrigger value="trends" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md">
                  <div className="flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    <span>Trends</span>
          </div>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="workouts" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                  <motion.div variants={cardVariant}>
                    <Card className="overflow-hidden border-none shadow-md">
                      <div className="h-1 bg-blue-500 w-full"></div>
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <PieChart className="h-5 w-5 text-blue-500" />
                      Workout Types
                    </CardTitle>
                    <CardDescription>Distribution of your workout activities</CardDescription>
                  </CardHeader>
                      <CardContent className="p-6">
                        <div className="h-72">
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
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {prepareWorkoutTypeData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                              <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                        </div>
                  </CardContent>
                </Card>
                  </motion.div>

                  <motion.div variants={cardVariant}>
                    <Card className="overflow-hidden border-none shadow-md">
                      <div className="h-1 bg-orange-500 w-full"></div>
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart className="h-5 w-5 text-orange-500" />
                          Monthly Workout Stats
                    </CardTitle>
                        <CardDescription>Your workout progress over time</CardDescription>
                  </CardHeader>
                      <CardContent className="p-6">
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart
                              data={prepareMonthlyWorkoutData()}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                              <YAxis yAxisId="right" orientation="right" stroke="#FF8042" />
                              <Tooltip />
                          <Legend />
                              <Bar yAxisId="left" dataKey="workouts" name="Workouts" fill="#8884d8" />
                              <Bar yAxisId="right" dataKey="caloriesBurned" name="Calories Burned" fill="#FF8042" />
                            </RechartsBarChart>
                      </ResponsiveContainer>
                        </div>
                  </CardContent>
                </Card>
                  </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                  <motion.div variants={cardVariant}>
                    <Card className="overflow-hidden border-none shadow-md">
                      <div className="h-1 bg-green-500 w-full"></div>
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <PieChart className="h-5 w-5 text-green-500" />
                      Meal Types
                    </CardTitle>
                        <CardDescription>Distribution of your meals by type</CardDescription>
                  </CardHeader>
                      <CardContent className="p-6">
                        <div className="h-72">
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
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {prepareMealTypeData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                              <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                        </div>
                  </CardContent>
                </Card>
                  </motion.div>

                  <motion.div variants={cardVariant}>
                    <Card className="overflow-hidden border-none shadow-md">
                      <div className="h-1 bg-purple-500 w-full"></div>
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart className="h-5 w-5 text-purple-500" />
                          Monthly Nutrition Stats
                    </CardTitle>
                        <CardDescription>Your nutrition tracking over time</CardDescription>
                  </CardHeader>
                      <CardContent className="p-6">
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart
                              data={prepareMonthlyNutritionData()}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                              <Tooltip />
                          <Legend />
                              <Bar dataKey="calories" name="Calories" fill="#8884d8" />
                              <Bar dataKey="protein" name="Protein (g)" fill="#82ca9d" />
                              <Bar dataKey="carbs" name="Carbs (g)" fill="#ffc658" />
                              <Bar dataKey="fat" name="Fat (g)" fill="#ff8042" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                        </div>
                  </CardContent>
                </Card>
                  </motion.div>
              </div>
            </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                <motion.div variants={cardVariant}>
                  <Card className="overflow-hidden border-none shadow-md">
                    <div className="h-1 bg-indigo-500 w-full"></div>
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-indigo-500" />
                        Workout Duration Trends
                      </CardTitle>
                      <CardDescription>Your workout durations over time</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart
                            data={prepareMonthlyWorkoutData()}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="duration"
                              name="Duration (min)"
                              stroke="#8884d8"
                              activeDot={{ r: 8 }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <div className="grid gap-4 md:grid-cols-2">
                  <motion.div variants={cardVariant}>
                    <Card className="overflow-hidden border-none shadow-md">
                      <div className="h-1 bg-blue-500 w-full"></div>
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <LineChart className="h-5 w-5 text-blue-500" />
                          Workout Frequency
                        </CardTitle>
                        <CardDescription>Number of workouts per month</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart
                              data={prepareMonthlyWorkoutData()}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="workouts"
                                name="Workouts"
                                stroke="#0088FE"
                                activeDot={{ r: 8 }}
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                              </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={cardVariant}>
                    <Card className="overflow-hidden border-none shadow-md">
                      <div className="h-1 bg-green-500 w-full"></div>
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <LineChart className="h-5 w-5 text-green-500" />
                          Nutrition Tracking
                        </CardTitle>
                        <CardDescription>Number of meals logged per month</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart
                              data={prepareMonthlyNutritionData()}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="meals"
                                name="Meals"
                                stroke="#00C49F"
                                activeDot={{ r: 8 }}
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
            </TabsContent>
          </Tabs>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
