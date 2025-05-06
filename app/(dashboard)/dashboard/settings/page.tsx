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
import { AlertCircle, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

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
          const profile = await getUserProfile(user.uid)

          if (profile) {
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
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-8 w-40" />
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
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal details and fitness preferences</CardDescription>
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
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}

          <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profileData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="Your age"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={profileData.gender} onValueChange={(value) => handleChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={profileData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  placeholder="Your weight in kg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={profileData.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                  placeholder="Your height in cm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLevel">Activity Level</Label>
              <Select value={profileData.activityLevel} onValueChange={(value) => handleChange("activityLevel", value)}>
                <SelectTrigger>
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
              <Label htmlFor="fitnessGoal">Fitness Goal</Label>
              <Select value={profileData.fitnessGoal} onValueChange={(value) => handleChange("fitnessGoal", value)}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Dietary Restrictions</Label>
              <div className="grid grid-cols-2 gap-2">
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
        <CardFooter>
          <Button type="submit" form="profile-form" disabled={saving} className="ml-auto">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
