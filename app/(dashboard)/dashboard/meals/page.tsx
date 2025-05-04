"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { logMeal } from "@/lib/firestore"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Utensils } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LogMealsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [mealData, setMealData] = useState({
    type: "breakfast",
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    notes: "",
  })

  const handleChange = (field: string, value: any) => {
    setMealData((prev) => ({ ...prev, [field]: value }))
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

      console.log("Submitting meal data:", mealData)

      // Ensure all required fields are present
      if (!mealData.name) {
        throw new Error("Please enter a meal name")
      }

      // Save meal to Firestore
      const mealId = await logMeal(user.uid, mealData)
      console.log("Meal saved with ID:", mealId)

      setSuccess(true)

      // Reset form
      setMealData({
        type: "breakfast",
        name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        notes: "",
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Error saving meal:", error)
      setError(error.message || "Failed to log meal")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Log Meals</h1>
        <p className="text-muted-foreground">Track your nutrition by logging your meals and snacks.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            New Meal Entry
          </CardTitle>
          <CardDescription>Record what you ate and its nutritional information</CardDescription>
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
              <AlertDescription>Meal logged successfully! Redirecting to dashboard...</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="breakfast" onValueChange={(value) => handleChange("type", value)} value={mealData.type}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
              <TabsTrigger value="lunch">Lunch</TabsTrigger>
              <TabsTrigger value="dinner">Dinner</TabsTrigger>
              <TabsTrigger value="snack">Snack</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Meal Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Oatmeal with Berries"
                  value={mealData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="0"
                    value={mealData.calories}
                    onChange={(e) => handleChange("calories", Number.parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    placeholder="0"
                    value={mealData.protein}
                    onChange={(e) => handleChange("protein", Number.parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    placeholder="0"
                    value={mealData.carbs}
                    onChange={(e) => handleChange("carbs", Number.parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    placeholder="0"
                    value={mealData.fat}
                    onChange={(e) => handleChange("fat", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional details about your meal"
                  value={mealData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </form>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !mealData.name}>
            {isLoading ? "Saving..." : "Save Meal"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
