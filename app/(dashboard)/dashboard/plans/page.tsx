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

// Add interfaces for plan content
interface PlanContent {
  content: string
  createdAt: {
    seconds: number
  }
}

// Create a separate component for the plan content
function PlanContent({ planData }: { planData: FitnessPlan }) {
  const [selectedDay, setSelectedDay] = useState("1");

  return (
    <div className="space-y-6">
      {/* Initial Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Initial Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{planData.initialAssessment}</p>
        </CardContent>
      </Card>

      {/* Daily View Selector */}
      <div className="flex items-center gap-4">
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {planData.workoutPlan.weeklySplit.map((day, index) => (
              <SelectItem key={index} value={String(index + 1)}>
                {day.day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Day's Plan */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Workout Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Today's Workout
            </CardTitle>
            <CardDescription>
              {planData.workoutPlan.weeklySplit[parseInt(selectedDay) - 1].focus}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {planData.workoutPlan.weeklySplit[parseInt(selectedDay) - 1].exercises.map((exercise, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{exercise.name}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline">{exercise.sets}</Badge>
                        <Badge variant="outline">{exercise.reps}</Badge>
                      </div>
                    </div>
                    {exercise.notes && (
                      <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Nutrition Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Today's Meals
            </CardTitle>
            <CardDescription>
              Daily Target: {planData.nutritionPlan.dailyCalories}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {/* Macros Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium">Protein</p>
                    <p className="text-lg font-bold">{planData.nutritionPlan.macros.protein}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Carbs</p>
                    <p className="text-lg font-bold">{planData.nutritionPlan.macros.carbs}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Fats</p>
                    <p className="text-lg font-bold">{planData.nutritionPlan.macros.fats}</p>
                  </div>
                </div>

                {/* Meals */}
                <div className="space-y-4">
                  {planData.nutritionPlan.mealPlans[parseInt(selectedDay) - 1]?.meals.map((meal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{meal.name}</h4>
                        <Badge variant="secondary">{meal.calories}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{meal.description}</p>
                      <Badge variant="outline">{meal.macros}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tips For Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] pr-4">
            <ul className="space-y-2">
              {planData.dietaryTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
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
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Personalized Plans</h1>
        <p className="text-muted-foreground">
          Get customized workout and nutrition plans based on your profile and goals.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!plan ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Generate Your Plan
            </CardTitle>
            <CardDescription>Create a personalized fitness and nutrition plan based on your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Our AI will generate a customized plan for you based on your profile information, fitness goals, and
              preferences.
            </p>
            {!profile ? (
              <Alert>
                <AlertDescription>
                  Please complete your profile in the settings page before generating a plan.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Age:</span>
                    <span>{profile.age || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Gender:</span>
                    <span className="capitalize">{profile.gender || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Weight:</span>
                    <span>{profile.weight ? `${profile.weight} kg` : "Not set"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Height:</span>
                    <span>{profile.height ? `${profile.height} cm` : "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Activity Level:</span>
                    <span className="capitalize">{profile.activityLevel || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Fitness Goal:</span>
                    <span className="capitalize">{profile.fitnessGoal?.replace(/-/g, " ") || "Not set"}</span>
                  </div>
                </div>
                {profile.dietaryRestrictions && profile.dietaryRestrictions.length > 0 && (
                  <div className="col-span-2">
                    <span className="font-medium">Dietary Restrictions:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.dietaryRestrictions.map((restriction: string) => (
                        <Badge key={restriction} variant="outline" className="capitalize">
                          {restriction.replace(/-/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGeneratePlan}
              disabled={generating || !profile}
              className="w-full flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                "Generate Plan"
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Your Personalized Plan
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span>Created on {new Date(plan.createdAt.seconds * 1000).toLocaleDateString()}</span>
              <Badge variant="outline" className="ml-2 capitalize">
                {profile?.fitnessGoal?.replace(/-/g, " ") || "General Fitness"}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="all"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                >
                  Complete Plan
                </TabsTrigger>
                <TabsTrigger
                  value="workout"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                >
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Workout
                </TabsTrigger>
                <TabsTrigger
                  value="nutrition"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                >
                  <Utensils className="h-4 w-4 mr-2" />
                  Nutrition
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="all" className="mt-0">
                  {(() => {
                    try {
                      const planData = JSON.parse(plan.content) as FitnessPlan;
                      return <PlanContent planData={planData} />;
                    } catch (error) {
                      console.error("Error parsing plan content:", error);
                      return <p>Error displaying plan content. Please try generating a new plan.</p>;
                    }
                  })()}
                </TabsContent>

                <TabsContent value="workout" className="mt-0">
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

                <TabsContent value="nutrition" className="mt-0">
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
          </CardContent>
          <CardFooter className="border-t bg-muted/30 px-6 py-4">
            <Button
              onClick={handleGeneratePlan}
              disabled={generating}
              variant="outline"
              className="flex items-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate New Plan"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
