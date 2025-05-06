"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile, updateUserProfile, createUserProfile } from "@/lib/firestore"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, User, UserCog, Weight, Ruler, ActivitySquare, Target, Apple, Heart } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
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

// Add this interface near the top of the file with other imports
interface UserProfile {
  id: string;
  userId?: string;
  name?: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  activityLevel?: string;
  fitnessGoal?: string;
  dietaryRestrictions?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  const [profileData, setProfileData] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    activityLevel: "",
    fitnessGoal: "",
    dietaryRestrictions: [] as string[],
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          console.log("Fetching profile for user:", user.uid)
          const profileData = await getUserProfile(user.uid)
          
          if (profileData) {
            const profile = profileData as UserProfile;
            console.log("Profile found:", profile)
            setProfileId(profile.id)
            setProfileData({
              name: profile.name || "",
              age: profile.age?.toString() || "",
              gender: profile.gender || "",
              weight: profile.weight?.toString() || "",
              height: profile.height?.toString() || "",
              activityLevel: profile.activityLevel || "",
              fitnessGoal: profile.fitnessGoal || "",
              dietaryRestrictions: profile.dietaryRestrictions || [],
            })
          } else {
            console.log("No profile found, will create new one on save")
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleChange = (field: string, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDietaryRestrictionChange = (value: string) => {
    setProfileData((prev) => {
      const current = [...prev.dietaryRestrictions]

      if (current.includes(value)) {
        return {
          ...prev,
          dietaryRestrictions: current.filter((item) => item !== value),
        }
      } else {
        return {
          ...prev,
          dietaryRestrictions: [...current, value],
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setSaving(true)

    try {
      if (!user) throw new Error("You must be logged in")

      console.log("Saving profile data:", profileData)

      // Convert string values to numbers where appropriate
      const dataToSave = {
        ...profileData,
        age: profileData.age ? Number.parseInt(profileData.age) : undefined,
        weight: profileData.weight ? Number.parseFloat(profileData.weight) : undefined,
        height: profileData.height ? Number.parseFloat(profileData.height) : undefined,
      }

      if (profileId) {
        console.log("Updating existing profile:", profileId)
        await updateUserProfile(profileId, dataToSave)
      } else {
        console.log("Creating new profile for user:", user.uid)
        const newProfileId = await createUserProfile(user.uid, dataToSave)
        setProfileId(newProfileId)
        console.log("New profile created with ID:", newProfileId)
      }

      setSuccess(true)
      console.log("Profile saved successfully")
    } catch (error: any) {
      console.error("Error saving profile:", error)
      setError(error.message || "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-6">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
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
      <motion.div variants={fadeIn} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Profile Settings</h1>
          <p className="text-primary-foreground/80 max-w-xl">
            Manage your personal information, fitness preferences, and goals.
          </p>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
              {user?.email || "User Profile"}
            </Badge>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20">
          <UserCog className="h-32 w-32 text-white" />
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
            <AlertDescription>Profile updated successfully!</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div variants={cardVariant}>
        <Card className="overflow-hidden border-none shadow-md">
          <div className="h-1 bg-purple-500 w-full"></div>
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-purple-500" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal details and fitness preferences</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-500" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Your name"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={profileData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    placeholder="Your age"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Gender
                  </Label>
                  <Select value={profileData.gender} onValueChange={(value: string) => handleChange("gender", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-green-500" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={profileData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    placeholder="Your weight in kg"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-amber-500" />
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={profileData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    placeholder="Your height in cm"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityLevel" className="flex items-center gap-2">
                  <ActivitySquare className="h-4 w-4 text-blue-500" />
                  Activity Level
                </Label>
                <Select 
                  value={profileData.activityLevel} 
                  onValueChange={(value: string) => handleChange("activityLevel", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                    <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="very-active">Very Active (intense exercise daily)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fitnessGoal" className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-500" />
                  Fitness Goal
                </Label>
                <Select 
                  value={profileData.fitnessGoal} 
                  onValueChange={(value: string) => handleChange("fitnessGoal", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select fitness goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight-loss">Weight Loss</SelectItem>
                    <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                    <SelectItem value="endurance">Improve Endurance</SelectItem>
                    <SelectItem value="strength">Increase Strength</SelectItem>
                    <SelectItem value="general">General Fitness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                <Label className="text-base font-medium flex items-center gap-2 mb-4">
                  <Apple className="h-4 w-4 text-green-500" />
                  Dietary Restrictions
                </Label>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "vegetarian", label: "Vegetarian" },
                    { id: "vegan", label: "Vegan" },
                    { id: "gluten-free", label: "Gluten-Free" },
                    { id: "dairy-free", label: "Dairy-Free" },
                    { id: "nut-free", label: "Nut-Free" },
                    { id: "low-carb", label: "Low-Carb" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.id}
                        checked={profileData.dietaryRestrictions.includes(item.id)}
                        onCheckedChange={() => handleDietaryRestrictionChange(item.id)}
                      />
                      <Label htmlFor={item.id} className="font-normal">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end px-6 py-4 bg-gray-50 dark:bg-gray-900">
            <Button 
              type="submit"
              form="profile-form" 
              disabled={saving}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}
