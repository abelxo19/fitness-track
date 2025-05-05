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
import { AlertCircle, CalendarClock, Check, Coffee, Clock, Utensils } from "lucide-react"
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

  const handleChange = (field: string, value: string | number) => {
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

  // Helper function to get meal type icon
  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case "breakfast":
        return <Coffee className="h-4 w-4" />;
      case "lunch":
        return <Utensils className="h-4 w-4" />;
      case "dinner":
        return <Utensils className="h-4 w-4" />;
      case "snack":
        return <Coffee className="h-4 w-4" />;
      default:
        return <Utensils className="h-4 w-4" />;
    }
  };

  return (
    <motion.div 
      className="space-y-8 pb-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Header with Gradient */}
      <motion.div variants={fadeIn} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-purple-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Log Meals</h1>
          <p className="text-primary-foreground/80 max-w-xl">
            Track your nutrition by logging your meals and snacks to maintain a healthy diet.
          </p>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
              <CalendarClock className="mr-1 h-3.5 w-3.5" />
              {new Date().toLocaleDateString()}
            </Badge>
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
              <Clock className="mr-1 h-3.5 w-3.5" />
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Badge>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20">
          <Utensils className="h-32 w-32 text-white" />
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
            <Check className="h-4 w-4" />
            <AlertDescription>Meal logged successfully! Redirecting to dashboard...</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div variants={cardVariant}>
        <Card className="overflow-hidden border-none shadow-lg">
          <div className="h-1 bg-primary w-full"></div>
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Utensils className="h-5 w-5 text-primary" />
              New Meal Entry
            </CardTitle>
            <CardDescription>Record what you ate and its nutritional information</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs 
              defaultValue="breakfast" 
              onValueChange={(value: string) => handleChange("type", value)} 
              value={mealData.type}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 mb-6 w-full">
                <TabsTrigger value="breakfast" className="flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  <span className="hidden sm:inline">Breakfast</span>
                </TabsTrigger>
                <TabsTrigger value="lunch" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  <span className="hidden sm:inline">Lunch</span>
                </TabsTrigger>
                <TabsTrigger value="dinner" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  <span className="hidden sm:inline">Dinner</span>
                </TabsTrigger>
                <TabsTrigger value="snack" className="flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  <span className="hidden sm:inline">Snack</span>
                </TabsTrigger>
              </TabsList>

              <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  {getMealTypeIcon(mealData.type)}
                  <h3 className="text-lg font-medium capitalize">{mealData.type} Details</h3>
                </div>

                <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-md text-sm dark:bg-slate-800 dark:border-primary/30">
                  <p className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-gray-700 dark:text-gray-300">Tip: Not sure about nutritional values? Consider consulting a nutritionist or searching online for accurate measurements.</span>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-primary" />
                      Meal Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Oatmeal with Berries"
                      value={mealData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="border-primary/25 focus:border-primary"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="calories" className="text-sm font-medium flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">C</span>
                        Calories
                      </Label>
                      <Input
                        id="calories"
                        type="number"
                        placeholder="0"
                        value={mealData.calories}
                        onChange={(e) => handleChange("calories", Number.parseInt(e.target.value) || 0)}
                        className="border-gray-200 focus:border-primary"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="protein" className="text-sm font-medium flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-primary">P</span>
                        Protein (g)
                      </Label>
                      <Input
                        id="protein"
                        type="number"
                        placeholder="0"
                        value={mealData.protein}
                        onChange={(e) => handleChange("protein", Number.parseInt(e.target.value) || 0)}
                        className="border-gray-200 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="carbs" className="text-sm font-medium flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center text-xs font-semibold text-orange-700">C</span>
                        Carbs (g)
                      </Label>
                      <Input
                        id="carbs"
                        type="number"
                        placeholder="0"
                        value={mealData.carbs}
                        onChange={(e) => handleChange("carbs", Number.parseInt(e.target.value) || 0)}
                        className="border-gray-200 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fat" className="text-sm font-medium flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-semibold text-yellow-700">F</span>
                        Fat (g)
                      </Label>
                      <Input
                        id="fat"
                        type="number"
                        placeholder="0"
                        value={mealData.fat}
                        onChange={(e) => handleChange("fat", Number.parseInt(e.target.value) || 0)}
                        className="border-gray-200 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      Notes (optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional details about your meal"
                      value={mealData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      className="border-gray-200 focus:border-primary min-h-[100px]"
                      rows={3}
                    />
                  </div>
                </form>
              </div>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900">
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard")}
              className="border-primary/25 text-primary hover:bg-primary/5"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !mealData.name}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isLoading ? "Saving..." : "Save Meal"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      
      <motion.div 
        variants={fadeIn} 
        className="opacity-80 text-center text-sm text-muted-foreground mt-4"
      >
        Tracking your meals helps maintain nutritional awareness and supports your fitness goals.
      </motion.div>
    </motion.div>
  )
}
