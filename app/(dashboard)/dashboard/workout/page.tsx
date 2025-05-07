"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { logWorkout, testFirestorePermissions } from "@/lib/firestore"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { AlertCircle, Dumbbell, Flame, Activity } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

export default function LogWorkoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [workoutData, setWorkoutData] = useState({
    type: "",
    duration: 30,
    intensity: "medium",
    notes: "",
    caloriesBurned: 0,
  })

  const handleChange = (field: string, value: any) => {
    setWorkoutData((prev) => ({ ...prev, [field]: value }))

    // Estimate calories burned based on duration and intensity
    if (field === "duration" || field === "intensity") {
      let multiplier = 5 // base calories per minute

      if (workoutData.intensity === "low" || value === "low") {
        multiplier = 4
      } else if (workoutData.intensity === "high" || value === "high") {
        multiplier = 8
      }

      const duration = field === "duration" ? value : workoutData.duration
      const estimatedCalories = Math.round(duration * multiplier)

      setWorkoutData((prev) => ({ ...prev, caloriesBurned: estimatedCalories }))
    }
  }

  const testPermissions = async () => {
    if (!user) {
      setError("You must be logged in to test permissions")
      return
    }

    setIsLoading(true)
    try {
      const result = await testFirestorePermissions(user.uid)
      if (result.success) {
        setSuccess(true)
        console.log("Permissions test passed:", result)
      } else {
        setError(`Permissions test failed: ${result.message}`)
        console.error("Permissions test failed:", result)
      }
    } catch (error: any) {
      setError(`Error testing permissions: ${error.message}`)
      console.error("Error testing permissions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      if (!user) {
        throw new Error("You must be logged in")
      }

      console.log("Current user:", user.uid)
      console.log("Submitting workout data:", workoutData)

      // Ensure all required fields are present
      if (!workoutData.type) {
        throw new Error("Please select a workout type")
      }

      // Save workout to Firestore
      try {
        const workoutId = await logWorkout(user.uid, workoutData)
        console.log("Workout saved with ID:", workoutId)

        setSuccess(true)

        // Reset form
        setWorkoutData({
          type: "",
          duration: 30,
          intensity: "medium",
          notes: "",
          caloriesBurned: 0,
        })

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } catch (firestoreError: any) {
        console.error("Firestore error details:", firestoreError)
        throw new Error(`Firestore error: ${firestoreError.message || "Unknown error"}`)
      }
    } catch (error: any) {
      console.error("Error saving workout:", error)
      setError(error.message || "Failed to log workout")
    } finally {
      setIsLoading(false)
    }
  }

  const workoutTypes = [
    "Running",
    "Walking",
    "Cycling",
    "Swimming",
    "Weight Training",
    "HIIT",
    "Yoga",
    "Pilates",
    "CrossFit",
    "Other",
  ]

  // Get intensity badge color
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "low":
        return "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      case "medium":
        return "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800";
      case "high":
        return "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
    }
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8 px-4 py-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Header with Gradient */}
      <motion.div variants={fadeIn} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Log Your Workout</h1>
          <p className="text-primary-foreground/80 max-w-xl">
            Keep track of your exercise routine and monitor your fitness progress over time.
          </p>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </Badge>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20">
          <Dumbbell className="h-32 w-32 text-white" />
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

      {success && (
        <motion.div variants={fadeIn}>
          <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
            <AlertDescription>Workout logged successfully! Redirecting to dashboard...</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div variants={cardVariant}>
        <Card className="overflow-hidden border-none shadow-md">
          <div className="h-1 bg-blue-500 w-full"></div>
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Dumbbell className="h-5 w-5 text-blue-500" />
              New Workout
            </CardTitle>
            <CardDescription>Fill in the details of your workout session</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Workout Type</Label>
                  <Select value={workoutData.type} onValueChange={(value: string) => handleChange("type", value)} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select workout type" />
                    </SelectTrigger>
                    <SelectContent>
                      {workoutTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intensity">Intensity</Label>
                  <Select value={workoutData.intensity} onValueChange={(value: string) => handleChange("intensity", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select intensity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <span>Low</span>
                          <Badge variant="outline" className={getIntensityColor("low") + " text-xs"}>low</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <span>Medium</span>
                          <Badge variant="outline" className={getIntensityColor("medium") + " text-xs"}>medium</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <span>High</span>
                          <Badge variant="outline" className={getIntensityColor("high") + " text-xs"}>high</Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="duration"
                    min={5}
                    max={180}
                    step={5}
                    value={[workoutData.duration]}
                    onValueChange={(value: number[]) => handleChange("duration", value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={workoutData.duration}
                    onChange={(e) => handleChange("duration", Number.parseInt(e.target.value) || 0)}
                    className="w-20"
                    min={5}
                    max={180}
                  />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="calories" className="text-base font-medium flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Estimated Calories Burned
                  </Label>
                  <Badge variant="outline" className={getIntensityColor(workoutData.intensity)}>
                    {workoutData.intensity} intensity
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4">
                  <Input
                    id="calories"
                    type="number"
                    value={workoutData.caloriesBurned}
                    onChange={(e) => handleChange("caloriesBurned", Number.parseInt(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This is an estimate based on duration and intensity. Feel free to adjust if needed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  Notes (optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional details about your workout"
                  value={workoutData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between px-6 py-4 bg-gray-50 dark:bg-gray-900">
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard")}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !workoutData.type}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isLoading ? "Saving..." : "Save Workout"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}
