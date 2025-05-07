"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile, getUserPlans, savePlan } from "@/lib/firestore"
import { generateFitnessPlan, type UserProfile, FitnessPlan } from "@/lib/gemini"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Calendar, Dumbbell, RefreshCcw, Utensils, Clock, Flame, ArrowRight, Activity } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"

// Add interfaces for plan content
interface PlanContent {
  content: string
  createdAt: {
    seconds: number
  }
}

// Add animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
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

// Create a separate component for the plan content
function PlanContent({ planData }: { planData: FitnessPlan }) {
  const [selectedDay, setSelectedDay] = useState("1");
  const dayIndex = parseInt(selectedDay) - 1;
  const currentDay = planData.workoutPlan.weeklySplit[dayIndex];
  const dayMeals = planData.nutritionPlan.mealPlans[dayIndex]?.meals || [];

  // For progress indicator in day selector
  const totalDays = planData.workoutPlan.weeklySplit.length;
  const progressPercent = ((dayIndex + 1) / totalDays) * 100;

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Initial Assessment - Simplified with better spacing */}
      <motion.div variants={fadeIn} className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-6">
        <h3 className="mb-3 text-xl font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Your Fitness Assessment
        </h3>
        <p className="text-muted-foreground leading-relaxed">{planData.initialAssessment}</p>
      </motion.div>

      {/* Day Selection - More intuitive and visual */}
      <motion.div variants={fadeIn} className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Daily Schedule</h3>
          <p className="text-sm text-muted-foreground">Day {parseInt(selectedDay)} of {totalDays}</p>
        </div>
        
        {/* Day progress bar */}
        <div className="h-2 w-full bg-muted rounded-full mb-4 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {/* Day selector buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
            {planData.workoutPlan.weeklySplit.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDay(String(index + 1))}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap snap-start flex-shrink-0
                ${selectedDay === String(index + 1)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background border hover:bg-muted transition-colors"
                }`}
            >
                {day.day}
            </button>
            ))}
      </div>
      </motion.div>

      {/* Main Content Area - Clean 2-column layout */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Column */}
        <motion.div variants={cardVariant} className="border-t-4 border-t-blue-500 shadow-sm hover:shadow transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Dumbbell className="h-5 w-5" />
                  Workout Plan
            </CardTitle>
                <CardDescription className="mt-1">{currentDay.focus}</CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200">
                {currentDay.day}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {currentDay.exercises.map((exercise, index) => (
                <div 
                  key={index} 
                  className="relative p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-lg text-blue-900 dark:text-blue-300">{exercise.name}</h4>
                    <div className="flex gap-1">
                      <Badge className="bg-white dark:bg-blue-900 text-blue-700">{exercise.sets}</Badge>
                      <Badge className="bg-white dark:bg-blue-900 text-blue-700">{exercise.reps}</Badge>
                    </div>
                  </div>
                  {exercise.notes && (
                    <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">{exercise.notes}</p>
                  )}
                  </div>
                ))}
              </div>
          </CardContent>
        </motion.div>

        {/* Nutrition Column */}
        <motion.div variants={cardVariant} className="border-t-4 border-t-green-500 shadow-sm hover:shadow transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Utensils className="h-5 w-5" />
                  Nutrition Plan
            </CardTitle>
                <CardDescription className="mt-1">Daily Target: {planData.nutritionPlan.dailyCalories}</CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200">
                {currentDay.day}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Macros Summary - Visually balanced with progress bars */}
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 mb-5">
              <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">Macronutrients</h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Protein</span>
                    <span className="font-medium">{planData.nutritionPlan.macros.protein}</span>
                  </div>
                  <div className="h-2 w-full bg-white dark:bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '60%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Carbs</span>
                    <span className="font-medium">{planData.nutritionPlan.macros.carbs}</span>
                  </div>
                  <div className="h-2 w-full bg-white dark:bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '45%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fats</span>
                    <span className="font-medium">{planData.nutritionPlan.macros.fats}</span>
                      </div>
                  <div className="h-2 w-full bg-white dark:bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: '25%' }} />
                    </div>
                </div>
              </div>
            </div>

            {/* Meals */}
            <div className="space-y-4">
              {dayMeals.map((meal, index) => (
                <div key={index} className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-lg text-green-900 dark:text-green-300">{meal.name}</h4>
                    <Badge className="bg-white dark:bg-green-900 text-green-700">{meal.calories}</Badge>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400 mb-2">{meal.description}</p>
                  <Badge variant="outline" className="text-xs bg-white/60 dark:bg-black/20 text-green-800 border-green-200">
                    {meal.macros}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </motion.div>
      </motion.div>

      {/* Tips Section - More engaging and visually separated */}
      <motion.div variants={fadeIn} className="border-t-4 border-t-amber-500 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Flame className="h-5 w-5" />
            Tips For Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {planData.dietaryTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-800 dark:text-amber-200 text-sm font-medium">{index + 1}</span>
                </div>
                <p className="text-amber-800 dark:text-amber-200 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </motion.div>
    </motion.div>
  );
}

export default function PersonalizedPlansPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [plan, setPlan] = useState<PlanContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          setLoading(true)
          setError("")

          // Fetch profile data
          try {
            const profileData = await getUserProfile(user.uid)
            setProfile(profileData as UserProfile | null)
            console.log("Profile data fetched:", profileData)
          } catch (profileError: any) {
            console.error("Error fetching profile:", profileError)
            setError(`Error fetching profile: ${profileError.message}`)
          }

          // Fetch plan data
          try {
            const planData = await getUserPlans(user.uid)
            setPlan(planData as PlanContent | null)
            console.log("Plan data fetched:", planData)
          } catch (planError: any) {
            console.error("Error fetching plan:", planError)
            // Don't set error for plan - it's okay if user doesn't have a plan yet
          }
        } catch (error: any) {
          console.error("Error fetching data:", error)
          setError(`Error fetching data: ${error.message}`)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleGeneratePlan = async () => {
    if (!profile) {
      setError("Please complete your profile in settings first")
      return
    }

    setGenerating(true)
    setError("")

    try {
      console.log("Generating plan for user:", user?.uid)

      const userProfile: UserProfile = {
        age: profile.age || 30,
        gender: profile.gender || "not specified",
        weight: profile.weight || 70,
        height: profile.height || 170,
        activityLevel: profile.activityLevel || "moderate",
        fitnessGoal: profile.fitnessGoal || "general fitness",
        dietaryRestrictions: profile.dietaryRestrictions || [],
      }

      console.log("User profile for plan generation:", userProfile)

      const generatedPlan = await generateFitnessPlan(userProfile)
      console.log("Plan generated successfully")

      // Save the plan to Firestore
      try {
        if (user) {
          await savePlan(user.uid, {
            content: JSON.stringify(generatedPlan),
            createdAt: new Date(),
          })
          console.log("Plan saved to Firestore")
        }
      } catch (saveError: any) {
        console.error("Error saving plan to Firestore:", saveError)
        setError(`Plan generated but couldn't be saved: ${saveError.message}`)
      }

      // Update the local state
      setPlan({
        content: JSON.stringify(generatedPlan),
        createdAt: { seconds: Date.now() / 1000 },
      })
    } catch (error: any) {
      console.error("Error in plan generation process:", error)
      setError(`Failed to generate plan: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-6">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 py-6">
      {/* Enhanced Header with Background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Your Fitness Journey</h1>
          <p className="text-blue-100 max-w-2xl">
            Discover personalized workout and nutrition plans crafted specifically for your goals and preferences.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20">
          <Dumbbell className="h-32 w-32 text-white" />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-fadeIn">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!plan ? (
        // No Plan View - More visually appealing with better information layout
        <Card className="overflow-hidden shadow-lg border-none">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Create Your Personalized Plan
            </CardTitle>
            <CardDescription className="text-base">
              Get a customized fitness and nutrition strategy based on your specific goals
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {!profile ? (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-5 flex gap-4 items-start border border-amber-200 dark:border-amber-800">
                <div className="bg-amber-200 dark:bg-amber-800 rounded-full p-2 mt-1">
                  <AlertCircle className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Profile Required</h3>
                  <p className="text-amber-700 dark:text-amber-400">
                    To generate a personalized plan, please complete your fitness profile in the settings page first.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center pb-4">
                  <h3 className="text-xl font-medium mb-3">Your Profile Summary</h3>
                  <p className="text-muted-foreground mb-5">This information will be used to create your plan</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-5 text-center">
                    <div className="inline-flex items-center justify-center h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-3">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-medium mb-1">Personal Info</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Age: <span className="font-medium text-foreground">{profile.age || "Not set"}</span></p>
                      <p>Gender: <span className="font-medium text-foreground capitalize">{profile.gender || "Not set"}</span></p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-5 text-center">
                    <div className="inline-flex items-center justify-center h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full mb-3">
                      <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-medium mb-1">Body Metrics</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Height: <span className="font-medium text-foreground">{profile.height ? `${profile.height} cm` : "Not set"}</span></p>
                      <p>Weight: <span className="font-medium text-foreground">{profile.weight ? `${profile.weight} kg` : "Not set"}</span></p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-5 text-center">
                    <div className="inline-flex items-center justify-center h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full mb-3">
                      <Flame className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-medium mb-1">Fitness Goals</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Activity: <span className="font-medium text-foreground capitalize">{profile.activityLevel || "Not set"}</span></p>
                      <p>Goal: <span className="font-medium text-foreground capitalize">{profile.fitnessGoal?.replace(/-/g, " ") || "Not set"}</span></p>
                    </div>
                  </div>
                </div>
                
                {profile.dietaryRestrictions && profile.dietaryRestrictions.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 mt-4">
                    <h3 className="font-medium mb-2">Dietary Restrictions</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.dietaryRestrictions.map((restriction: string) => (
                        <Badge key={restriction} className="bg-white dark:bg-black/20 text-amber-700 dark:text-amber-300 border-amber-200 capitalize">
                          {restriction.replace(/-/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-t">
            <Button
              onClick={handleGeneratePlan}
              disabled={generating || !profile}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              {generating ? (
                <div className="flex items-center gap-2">
                  <RefreshCcw className="h-5 w-5 animate-spin" />
                  Creating Your Plan...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Generate Personalized Plan
                </div>
              )}
            </Button>
            
            {generating && (
              <p className="text-sm text-center text-muted-foreground">
                Our AI is crafting a personalized plan based on your profile. This may take a moment...
              </p>
            )}
          </CardFooter>
        </Card>
      ) : (
        // Plan View - Clean tabs and better structured content
        <Card className="overflow-hidden shadow-lg border-none">
          <CardHeader className="pb-0 pt-6 px-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Your Fitness Plan
            </CardTitle>
                <CardDescription className="mt-1">
                  Created on {new Date(plan.createdAt.seconds * 1000).toLocaleDateString()}
                </CardDescription>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none px-3 py-1 text-sm">
                {profile?.fitnessGoal?.replace(/-/g, " ") || "General Fitness"}
              </Badge>
                
                <Badge variant="outline" className="bg-white/80 dark:bg-black/20">
                  {profile?.activityLevel ? 
                    profile.activityLevel.charAt(0).toUpperCase() + profile.activityLevel.slice(1) 
                    : "Activity Level"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
            <Tabs defaultValue="all" className="w-full">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b px-6">
              <TabsList className="h-16 bg-transparent justify-start space-x-4">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-t-lg rounded-b-none border-b-2 data-[state=active]:border-primary h-full px-5"
                >
                  Complete Plan
                </TabsTrigger>
                <TabsTrigger
                  value="workout"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-t-lg rounded-b-none border-b-2 data-[state=active]:border-primary h-full px-5"
                >
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Workout
                </TabsTrigger>
                <TabsTrigger
                  value="nutrition"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-t-lg rounded-b-none border-b-2 data-[state=active]:border-primary h-full px-5"
                >
                  <Utensils className="h-4 w-4 mr-2" />
                  Nutrition
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800">
              <TabsContent value="all" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  {(() => {
                    try {
                      const planData = JSON.parse(plan.content) as FitnessPlan;
                      return <PlanContent planData={planData} />;
                    } catch (error) {
                      console.error("Error parsing plan content:", error);
                    return (
                      <div className="p-6 text-center">
                        <div className="mb-4 text-amber-500">
                          <AlertCircle className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">Error Displaying Plan</h3>
                        <p className="text-muted-foreground">We encountered an issue with your plan data. Please try generating a new plan.</p>
                      </div>
                    );
                    }
                  })()}
                </TabsContent>

              {/* Keep the existing workout and nutrition tab content */}
              <TabsContent value="workout" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  {(() => {
                    try {
                      const planData = JSON.parse(plan.content) as FitnessPlan;
                      return (
                        <div className="space-y-6">
                          {/* Workout Overview */}
                          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-2">Overview</h3>
                            <p>{planData.workoutPlan.overview}</p>
                          </div>

                          {/* Weekly Split */}
                          <div className="space-y-4">
                            {planData.workoutPlan.weeklySplit.map((day, index) => (
                              <div key={index} className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Dumbbell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                  <h3 className="text-lg font-semibold">{day.day}</h3>
                                  <Badge variant="outline" className="ml-2">{day.focus}</Badge>
                                </div>
                                <div className="space-y-3">
                                  {day.exercises.map((exercise, exIndex) => (
                                    <div key={exIndex} className="border-l-2 border-blue-300 dark:border-blue-700 pl-4">
                                      <h4 className="font-medium">{exercise.name}</h4>
                                      <div className="flex gap-2 mt-1">
                                        <Badge variant="outline">{exercise.sets}</Badge>
                                        <Badge variant="outline">{exercise.reps}</Badge>
                                      </div>
                                      {exercise.notes && (
                                        <p className="text-sm text-muted-foreground mt-1">{exercise.notes}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error("Error parsing workout plan:", error);
                      return <p>Error displaying workout plan. Please try generating a new plan.</p>;
                    }
                  })()}
                </TabsContent>

              <TabsContent value="nutrition" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  {(() => {
                    try {
                      const planData = JSON.parse(plan.content) as FitnessPlan;
                      return (
                        <div className="space-y-6">
                          {/* Nutrition Overview */}
                          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-2">Overview</h3>
                            <p>{planData.nutritionPlan.overview}</p>
                          </div>

                          {/* Daily Targets */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                              <h3 className="text-lg font-semibold mb-2">Daily Calories</h3>
                              <Badge variant="secondary" className="text-lg">{planData.nutritionPlan.dailyCalories}</Badge>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
                              <h3 className="text-lg font-semibold mb-2">Macronutrients</h3>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Protein</span>
                                  <Badge variant="secondary">{planData.nutritionPlan.macros.protein}</Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span>Carbs</span>
                                  <Badge variant="secondary">{planData.nutritionPlan.macros.carbs}</Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span>Fats</span>
                                  <Badge variant="secondary">{planData.nutritionPlan.macros.fats}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Meal Plans */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Meal Plans</h3>
                            {planData.nutritionPlan.mealPlans.map((dayPlan, index) => (
                              <div key={index} className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                                <h4 className="font-semibold mb-2">{dayPlan.day}</h4>
                                <div className="space-y-4">
                                  {dayPlan.meals.map((meal, mealIndex) => (
                                    <div key={mealIndex} className="border-l-2 border-green-300 dark:border-green-700 pl-4">
                                      <h5 className="font-medium text-green-700 dark:text-green-300">{meal.name}</h5>
                                      <p className="text-sm mt-1">{meal.description}</p>
                                      <div className="flex gap-2 mt-2">
                                        <Badge variant="outline">{meal.calories}</Badge>
                                        <Badge variant="outline">{meal.macros}</Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error("Error parsing nutrition plan:", error);
                      return <p>Error displaying nutrition plan. Please try generating a new plan.</p>;
                    }
                  })()}
                </TabsContent>
              </div>
            </Tabs>
          
          <CardFooter className="border-t bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">Want a different approach? Generate a new plan anytime.</p>
            <Button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="flex items-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                  <>
                    <RefreshCcw className="h-4 w-4" />
                    Generate New Plan
                  </>
              )}
            </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
