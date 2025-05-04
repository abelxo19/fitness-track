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
import { AlertCircle, Dumbbell } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Log Workout</h1>
        <p className="text-muted-foreground">Record your workout details to track your fitness progress.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            New Workout
          </CardTitle>
          <CardDescription>Fill in the details of your workout session</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>Workout logged successfully! Redirecting to dashboard...</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type">Workout Type</Label>
              <Select value={workoutData.type} onValueChange={(value) => handleChange("type", value)} required>
                <SelectTrigger>
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
              <Label htmlFor="duration">Duration (minutes)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="duration"
                  min={5}
                  max={180}
                  step={5}
                  value={[workoutData.duration]}
                  onValueChange={(value) => handleChange("duration", value[0])}
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

            <div className="space-y-2">
              <Label htmlFor="intensity">Intensity</Label>
              <Select value={workoutData.intensity} onValueChange={(value) => handleChange("intensity", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories">Estimated Calories Burned</Label>
              <Input
                id="calories"
                type="number"
                value={workoutData.caloriesBurned}
                onChange={(e) => handleChange("caloriesBurned", Number.parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                This is an estimate based on duration and intensity. Feel free to adjust.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional details about your workout"
                value={workoutData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Cancel
          </Button>
          <Button variant="outline" onClick={testPermissions} disabled={isLoading}>
            Test Permissions
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !workoutData.type}>
            {isLoading ? "Saving..." : "Save Workout"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
