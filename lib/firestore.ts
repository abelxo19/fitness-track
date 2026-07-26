import { supabase } from "./supabase"

const nowIso = () => new Date().toISOString()

// User profile
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    console.log("Creating user profile for:", userId, userData)
    const { data, error } = await supabase.from("users").insert([
      {
        userId,
        ...userData,
        created_at: nowIso(),
      },
    ])
    if (error) throw error
    console.log("User profile created:", data)
    return data?.[0]?.id ?? null
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}

export const getUserProfile = async (userId: string) => {
  try {
    console.log("Getting user profile for:", userId)
    const { data, error } = await supabase.from("users").select("*").eq("userId", userId).limit(1)
    if (error) throw error
    if (data && data.length > 0) {
      console.log("User profile found:", data[0])
      return data[0]
    }
    console.log("No user profile found for:", userId)
    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

export const updateUserProfile = async (profileId: string, userData: any) => {
  try {
    console.log("Updating user profile:", profileId, userData)
    const { error } = await supabase.from("users").update({ ...userData, updated_at: nowIso() }).eq("id", profileId)
    if (error) throw error
    console.log("User profile updated successfully")
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Workouts
export const logWorkout = async (userId: string, workoutData: any) => {
  try {
    console.log("Logging workout for:", userId, workoutData)
    const payload = { userId, ...workoutData, created_at: nowIso() }
    const { data, error } = await supabase.from("workouts").insert([payload])
    if (error) throw error
    console.log("Workout logged:", data)
    return data?.[0]?.id ?? null
  } catch (error) {
    console.error("Error logging workout:", error)
    throw error
  }
}

export const getUserWorkouts = async (userId: string, limitCount = 10) => {
  try {
    console.log("Getting workouts for:", userId)
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("userId", userId)
      .order("created_at", { ascending: false })
      .limit(limitCount)

    if (error) {
      console.error("Error querying workouts:", error)
      return []
    }

    return (data || []).map((row: any) => ({ id: row.id, ...row }))
  } catch (error) {
    console.error("Error getting user workouts:", error)
    return []
  }
}

// Meals
export const logMeal = async (userId: string, mealData: any) => {
  try {
    console.log("Logging meal for:", userId, mealData)
    const payload = { userId, ...mealData, created_at: nowIso() }
    const { data, error } = await supabase.from("meals").insert([payload])
    if (error) throw error
    console.log("Meal logged:", data)
    return data?.[0]?.id ?? null
  } catch (error) {
    console.error("Error logging meal:", error)
    throw error
  }
}

export const getUserMeals = async (userId: string, limitCount = 10) => {
  try {
    console.log("Getting meals for:", userId)
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("userId", userId)
      .order("created_at", { ascending: false })
      .limit(limitCount)

    if (error) {
      console.error("Error querying meals:", error)
      return []
    }

    return (data || []).map((row: any) => ({ id: row.id, ...row }))
  } catch (error) {
    console.error("Error getting user meals:", error)
    return []
  }
}

// Plans
export const savePlan = async (userId: string, planData: any) => {
  try {
    console.log("Saving plan for:", userId, planData)
    const payload = { userId, ...planData, created_at: nowIso() }
    const { data, error } = await supabase.from("plans").insert([payload])
    if (error) throw error
    console.log("Plan saved:", data)
    return data?.[0]?.id ?? null
  } catch (error) {
    console.error("Error saving plan:", error)
    throw error
  }
}

export const getUserPlans = async (userId: string) => {
  try {
    console.log("Getting plans for:", userId)
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("userId", userId)
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) throw error
    if (data && data.length > 0) return data[0]

    console.log("No plan found for:", userId)
    return null
  } catch (error) {
    console.error("Error getting user plans:", error)
    return null
  }
}

export const testFirestorePermissions = async (userId: string) => {
  try {
    console.log("Testing DB permissions for user:", userId)

    // Attempt to read
    const { error: readError } = await supabase.from("users").select("*").eq("userId", userId).limit(1)
    if (readError) throw readError

    // Attempt to write to a test table (should be allowed for authenticated users if policies permit)
    const { error: writeError } = await supabase.from("tests").insert([{ userId, test: "test", created_at: nowIso() }])
    if (writeError) throw writeError

    console.log("DB permissions test passed for user:", userId)
    return { success: true, message: "Permissions test passed!" }
  } catch (error: any) {
    console.error("DB permissions test failed:", error)
    return { success: false, message: error.message || "Permissions test failed" }
  }
}
