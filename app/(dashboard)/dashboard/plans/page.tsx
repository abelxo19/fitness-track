"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile, getUserPlans, savePlan } from "@/lib/firestore"
import { generateFitnessPlan, type UserProfile } from "@/lib/gemini"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Calendar, Dumbbell, RefreshCcw, Utensils, Clock, Flame, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Add interfaces for plan content
interface PlanContent {
  content: string
  createdAt: {
    seconds: number
  }
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
            content: generatedPlan,
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
        content: generatedPlan,
        createdAt: { seconds: Date.now() / 1000 },
      })
    } catch (error: any) {
      console.error("Error in plan generation process:", error)
      setError(`Failed to generate plan: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  // Function to parse and format the plan content
  const formatPlanContent = (content: string) => {
    // Split the content into sections
    const sections = content.split(/\n\n+/)

    return (
      <div className="space-y-6">
        {sections.map((section: string, index: number) => {
          // Check if this is a header section
          if (section.includes("===") || section.toUpperCase() === section) {
            return (
              <div key={index} className="pt-4">
                <h2 className="text-xl font-bold text-primary mb-2">{section.replace(/=/g, "").trim()}</h2>
                <Separator className="my-2" />
              </div>
            )
          }

          // Check if this is a workout day section
          else if (
            section.match(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i) &&
            (section.includes("Workout") || section.includes("workout") || section.includes("WORKOUT"))
          ) {
            const dayMatch = section.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday):/i)
            const day = dayMatch ? dayMatch[1].charAt(0).toUpperCase() + dayMatch[1].slice(1).toLowerCase() : "Day"

            return (
              <div key={index} className="bg-secondary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{day}</h3>
                </div>
                <div className="pl-2 border-l-2 border-primary/30">
                  {section.split("\n").map((line: string, lineIndex: number) => (
                    <p key={lineIndex} className="py-0.5">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )
          }

          // Check if this is a meal section
          else if (
            section.includes("Breakfast") ||
            section.includes("Lunch") ||
            section.includes("Dinner") ||
            section.includes("Snack") ||
            section.includes("MEAL PLAN") ||
            section.includes("Meal Plan")
          ) {
            return (
              <div key={index} className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Utensils className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-semibold">Nutrition</h3>
                </div>
                <div className="pl-2 border-l-2 border-green-300 dark:border-green-700">
                  {section.split("\n").map((line: string, lineIndex: number) => {
                    // Highlight meal types
                    if (
                      line.includes("Breakfast") ||
                      line.includes("Lunch") ||
                      line.includes("Dinner") ||
                      line.includes("Snack")
                    ) {
                      return (
                        <p key={lineIndex} className="font-medium text-green-700 dark:text-green-300 py-1">
                          {line}
                        </p>
                      )
                    }
                    return (
                      <p key={lineIndex} className="py-0.5">
                        {line}
                      </p>
                    )
                  })}
                </div>
              </div>
            )
          }

          // Check if this is a calorie/macros section
          else if (
            section.includes("Calorie") ||
            section.includes("calorie") ||
            section.includes("Protein") ||
            section.includes("protein") ||
            section.includes("Carb") ||
            section.includes("Fat")
          ) {
            return (
              <div key={index} className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold">Nutrition Targets</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.split("\n").map((line: string, lineIndex: number) => {
                    if (line.includes(":")) {
                      const [label, value] = line.split(":")
                      return (
                        <div
                          key={lineIndex}
                          className="flex justify-between items-center border-b border-blue-100 dark:border-blue-800 py-2"
                        >
                          <span className="font-medium">{label.trim()}</span>
                          <Badge variant="secondary" className="ml-2">
                            {value.trim()}
                          </Badge>
                        </div>
                      )
                    }
                    return (
                      <p key={lineIndex} className="py-0.5 col-span-2">
                        {line}
                      </p>
                    )
                  })}
                </div>
              </div>
            )
          }

          // Check if this is a tips section
          else if (section.includes("TIPS") || section.includes("Tips") || section.includes("tips")) {
            return (
              <div key={index} className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-lg font-semibold">Tips For Success</h3>
                </div>
                <ul className="space-y-2 pl-2">
                  {section.split("\n").map((line: string, lineIndex: number) => {
                    // Skip the header line
                    if (line.includes("TIPS") || line.includes("Tips") || line.includes("tips")) {
                      return null
                    }

                    // Format numbered tips
                    const tipMatch = line.match(/^\d+\.\s+(.+)/)
                    if (tipMatch) {
                      return (
                        <li key={lineIndex} className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 mt-1 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>{tipMatch[1]}</span>
                        </li>
                      )
                    }

                    if (line.trim()) {
                      return (
                        <li key={lineIndex} className="py-0.5">
                          {line}
                        </li>
                      )
                    }

                    return null
                  })}
                </ul>
              </div>
            )
          }

          // Default formatting for other sections
          else if (section.trim()) {
            return (
              <div key={index} className="prose dark:prose-invert max-w-none">
                {section.split("\n").map((line: string, lineIndex: number) => (
                  <p key={lineIndex} className="py-0.5">
                    {line}
                  </p>
                ))}
              </div>
            )
          }

          return null
        })}
      </div>
    )
  }

  // Function to extract workout section from plan content
  const extractWorkoutSection = (content: string) => {
    // Look for workout section - typically contains words like "WORKOUT SCHEDULE" or "WEEKLY WORKOUT"
    const workoutMatch = content.match(
      /(?:WEEKLY\s+WORKOUT\s+SCHEDULE:|WORKOUT\s+PLAN:|WORKOUT\s+SCHEDULE:)[\s\S]+?(?=DAILY\s+MEAL\s+PLAN:|NUTRITION\s+PLAN:|MEAL\s+PLAN:|CALORIE\s+AND\s+MACRONUTRIENT|$)/i,
    )

    if (workoutMatch) {
      return formatPlanContent(workoutMatch[0])
    }

    // Fallback: just look for sections with workout-related terms
    const sections = content.split(/\n\n+/)
    const workoutSections = sections.filter(
      (section: string) =>
        section.match(
          /workout|exercise|training|cardio|strength|monday|tuesday|wednesday|thursday|friday|saturday|sunday/i,
        ) && !section.match(/meal|nutrition|calorie|protein|carb|fat/i),
    )

    if (workoutSections.length > 0) {
      return formatPlanContent(workoutSections.join("\n\n"))
    }

    return <p>No workout section found in the plan.</p>
  }

  // Function to extract nutrition section from plan content
  const extractNutritionSection = (content: string) => {
    // Look for nutrition section - typically contains words like "MEAL PLAN" or "NUTRITION"
    const nutritionMatch = content.match(
      /(?:DAILY\s+MEAL\s+PLAN:|NUTRITION\s+PLAN:|MEAL\s+PLAN:|CALORIE\s+AND\s+MACRONUTRIENT)[\s\S]+?(?=TIPS\s+FOR\s+SUCCESS:|$)/i,
    )

    if (nutritionMatch) {
      return formatPlanContent(nutritionMatch[0])
    }

    // Fallback: just look for sections with nutrition-related terms
    const sections = content.split(/\n\n+/)
    const nutritionSections = sections.filter(
      (section: string) =>
        section.match(/meal|nutrition|calorie|protein|carb|fat|breakfast|lunch|dinner|snack/i) &&
        !section.match(/workout|exercise|training|cardio|strength/i),
    )

    if (nutritionSections.length > 0) {
      return formatPlanContent(nutritionSections.join("\n\n"))
    }

    return <p>No nutrition section found in the plan.</p>
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
                <TabsContent value="all" className="mt-0 space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    {plan.content.split(/\n{2,}/).map((section: string, idx: number) => {
                      // Format headers (all caps or with ===)
                      if (section.toUpperCase() === section && section.length > 10) {
                        return (
                          <div key={idx} className="mt-6">
                            <h2 className="text-xl font-bold text-primary border-b pb-1">{section}</h2>
                          </div>
                        )
                      }

                      // Format workout days
                      if (/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(section)) {
                        const dayMatch = section.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday):/i)
                        const day = dayMatch ? dayMatch[1].toUpperCase() : ""

                        return (
                          <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 my-4">
                            {day && (
                              <h3 className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-300 mb-2">
                                <Dumbbell className="h-5 w-5" />
                                {day}
                              </h3>
                            )}
                            <div className="pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                              {section.split("\n").map((line: string, lineIdx: number) => (
                                <p key={lineIdx} className="my-1">
                                  {line}
                                </p>
                              ))}
                            </div>
                          </div>
                        )
                      }

                      // Format meal sections
                      if (/breakfast|lunch|dinner|snack|meal plan/i.test(section)) {
                        return (
                          <div key={idx} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 my-4">
                            <h3 className="flex items-center gap-2 font-bold text-green-700 dark:text-green-300 mb-2">
                              <Utensils className="h-5 w-5" />
                              MEAL PLAN
                            </h3>
                            <div className="pl-4 border-l-2 border-green-200 dark:border-green-700">
                              {section.split("\n").map((line: string, lineIdx: number) => {
                                // Highlight meal types
                                if (/breakfast|lunch|dinner|snack/i.test(line)) {
                                  return (
                                    <h4
                                      key={lineIdx}
                                      className="font-bold text-green-600 dark:text-green-400 mt-3 mb-2"
                                    >
                                      {line}
                                    </h4>
                                  )
                                }
                                return (
                                  <p key={lineIdx} className="my-1">
                                    {line}
                                  </p>
                                )
                              })}
                            </div>
                          </div>
                        )
                      }

                      // Format calorie/macro sections
                      if (/calorie|protein|carb|fat/i.test(section) && /target|goal|macro/i.test(section)) {
                        return (
                          <div key={idx} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 my-4">
                            <h3 className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300 mb-2">
                              <Flame className="h-5 w-5" />
                              NUTRITION TARGETS
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {section.split("\n").map((line: string, lineIdx: number) => {
                                if (line.includes(":")) {
                                  const [label, value] = line.split(":")
                                  return (
                                    <div
                                      key={lineIdx}
                                      className="flex justify-between items-center border-b border-purple-100 dark:border-purple-800 py-2"
                                    >
                                      <span className="font-medium">{label.trim()}</span>
                                      <Badge variant="outline" className="bg-purple-100 dark:bg-purple-800">
                                        {value.trim()}
                                      </Badge>
                                    </div>
                                  )
                                }
                                return (
                                  <p key={lineIdx} className="col-span-2 my-1">
                                    {line}
                                  </p>
                                )
                              })}
                            </div>
                          </div>
                        )
                      }

                      // Format tips sections
                      if (/tips|success/i.test(section)) {
                        return (
                          <div key={idx} className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 my-4">
                            <h3 className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300 mb-2">
                              <Clock className="h-5 w-5" />
                              TIPS FOR SUCCESS
                            </h3>
                            <ul className="space-y-2 list-none pl-0">
                              {section.split("\n").map((line: string, lineIdx: number) => {
                                // Skip header line
                                if (/tips|success/i.test(line) && lineIdx === 0) return null

                                // Format numbered tips
                                const tipMatch = line.match(/^\d+\.\s+(.+)/)
                                if (tipMatch) {
                                  return (
                                    <li key={lineIdx} className="flex items-start gap-2">
                                      <ArrowRight className="h-4 w-4 mt-1 flex-shrink-0 text-amber-600" />
                                      <span>{tipMatch[1]}</span>
                                    </li>
                                  )
                                }

                                if (line.trim()) {
                                  return (
                                    <li key={lineIdx} className="my-1">
                                      {line}
                                    </li>
                                  )
                                }

                                return null
                              })}
                            </ul>
                          </div>
                        )
                      }

                      // Default formatting
                      return (
                        <div key={idx} className="my-4">
                          {section.split("\n").map((line: string, lineIdx: number) => (
                            <p key={lineIdx} className="my-1">
                              {line}
                            </p>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="workout" className="mt-0 space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    {plan.content.split(/\n{2,}/).map((section: string, idx: number) => {
                      // Only include workout-related sections
                      if (
                        (/workout|exercise|training|cardio|strength/i.test(section) &&
                          !/meal|nutrition|calorie|protein|carb|fat/i.test(section)) ||
                        /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(section)
                      ) {
                        // Format workout days
                        if (/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(section)) {
                          const dayMatch = section.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday):/i)
                          const day = dayMatch ? dayMatch[1].toUpperCase() : ""

                          return (
                            <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 my-4">
                              {day && (
                                <h3 className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-300 mb-2">
                                  <Dumbbell className="h-5 w-5" />
                                  {day}
                                </h3>
                              )}
                              <div className="pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                                {section.split("\n").map((line: string, lineIdx: number) => (
                                  <p key={lineIdx} className="my-1">
                                    {line}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )
                        }

                        // Format workout headers
                        if (section.toUpperCase() === section && section.length > 10) {
                          return (
                            <div key={idx} className="mt-6">
                              <h2 className="text-xl font-bold text-primary border-b pb-1">{section}</h2>
                            </div>
                          )
                        }

                        // Default workout section formatting
                        return (
                          <div key={idx} className="my-4">
                            {section.split("\n").map((line: string, lineIdx: number) => (
                              <p key={lineIdx} className="my-1">
                                {line}
                              </p>
                            ))}
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="nutrition" className="mt-0 space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    {plan.content.split(/\n{2,}/).map((section: string, idx: number) => {
                      // Only include nutrition-related sections
                      if (
                        /meal|nutrition|calorie|protein|carb|fat|breakfast|lunch|dinner|snack/i.test(section) &&
                        !/workout|exercise|training|cardio|strength/i.test(section)
                      ) {
                        // Format meal sections
                        if (/breakfast|lunch|dinner|snack|meal plan/i.test(section)) {
                          return (
                            <div key={idx} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 my-4">
                              <h3 className="flex items-center gap-2 font-bold text-green-700 dark:text-green-300 mb-2">
                                <Utensils className="h-5 w-5" />
                                MEAL PLAN
                              </h3>
                              <div className="pl-4 border-l-2 border-green-200 dark:border-green-700">
                                {section.split("\n").map((line: string, lineIdx: number) => {
                                  // Highlight meal types
                                  if (/breakfast|lunch|dinner|snack/i.test(line)) {
                                    return (
                                      <h4
                                        key={lineIdx}
                                        className="font-bold text-green-600 dark:text-green-400 mt-3 mb-2"
                                      >
                                        {line}
                                      </h4>
                                    )
                                  }
                                  return (
                                    <p key={lineIdx} className="my-1">
                                      {line}
                                    </p>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        }

                        // Format calorie/macro sections
                        if (/calorie|protein|carb|fat/i.test(section) && /target|goal|macro/i.test(section)) {
                          return (
                            <div key={idx} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 my-4">
                              <h3 className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300 mb-2">
                                <Flame className="h-5 w-5" />
                                NUTRITION TARGETS
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {section.split("\n").map((line: string, lineIdx: number) => {
                                  if (line.includes(":")) {
                                    const [label, value] = line.split(":")
                                    return (
                                      <div
                                        key={lineIdx}
                                        className="flex justify-between items-center border-b border-purple-100 dark:border-purple-800 py-2"
                                      >
                                        <span className="font-medium">{label.trim()}</span>
                                        <Badge variant="outline" className="bg-purple-100 dark:bg-purple-800">
                                          {value.trim()}
                                        </Badge>
                                      </div>
                                    )
                                  }
                                  return (
                                    <p key={lineIdx} className="col-span-2 my-1">
                                      {line}
                                    </p>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        }

                        // Default nutrition section formatting
                        return (
                          <div key={idx} className="my-4">
                            {section.split("\n").map((line: string, lineIdx: number) => (
                              <p key={lineIdx} className="my-1">
                                {line}
                              </p>
                            ))}
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
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
