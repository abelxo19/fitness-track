import { db } from "./firebase"
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore"

// User profile
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    console.log("Creating user profile for:", userId, userData)
    const docRef = await addDoc(collection(db, "users"), {
      userId,
      ...userData,
      createdAt: serverTimestamp(),
    })
    console.log("User profile created with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}

export const getUserProfile = async (userId: string) => {
  try {
    console.log("Getting user profile for:", userId)
    const q = query(collection(db, "users"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const data = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
      console.log("User profile found:", data)
      return data
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
    const profileRef = doc(db, "users", profileId)
    await updateDoc(profileRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    })
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

    // Ensure userId is correctly set in the document
    const workoutWithUserId = {
      userId, // Make sure userId is at the top level
      ...workoutData,
      createdAt: serverTimestamp(),
    }

    console.log("Final workout data to save:", workoutWithUserId)

    const docRef = await addDoc(collection(db, "workouts"), workoutWithUserId)
    console.log("Workout logged with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error logging workout:", error)
    throw error
  }
}

export const getUserWorkouts = async (userId: string, limitCount = 10) => {
  try {
    console.log("Getting workouts for:", userId)

    // Try first with the composite index (filter + order)
    try {
      const q = query(
        collection(db, "workouts"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      )
      const querySnapshot = await getDocs(q)

      const workouts = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
        }
      })

      console.log(`Found ${workouts.length} workouts for user ${userId}`)
      return workouts
    } catch (indexError) {
      // If index error, fall back to simple query without ordering
      console.warn("Index not yet available, falling back to unordered query:", indexError)

      const simpleQuery = query(collection(db, "workouts"), where("userId", "==", userId), limit(limitCount))

      const querySnapshot = await getDocs(simpleQuery)

      const workouts = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
        }
      })

      // Sort client-side instead
      workouts.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt).getTime() / 1000
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt).getTime() / 1000
        return dateB - dateA // Descending order
      })

      console.log(`Found ${workouts.length} workouts for user ${userId} (unordered query)`)
      return workouts.slice(0, limitCount)
    }
  } catch (error) {
    console.error("Error getting user workouts:", error)
    // Return empty array instead of throwing to prevent UI crashes
    return []
  }
}

// Meals
export const logMeal = async (userId: string, mealData: any) => {
  try {
    console.log("Logging meal for:", userId, mealData)
    const docRef = await addDoc(collection(db, "meals"), {
      userId,
      ...mealData,
      createdAt: serverTimestamp(),
    })
    console.log("Meal logged with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error logging meal:", error)
    throw error
  }
}

export const getUserMeals = async (userId: string, limitCount = 10) => {
  try {
    console.log("Getting meals for:", userId)

    // Try first with the composite index (filter + order)
    try {
      const q = query(
        collection(db, "meals"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      )
      const querySnapshot = await getDocs(q)

      const meals = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
        }
      })

      console.log(`Found ${meals.length} meals for user ${userId}`)
      return meals
    } catch (indexError) {
      // If index error, fall back to simple query without ordering
      console.warn("Index not yet available, falling back to unordered query:", indexError)

      const simpleQuery = query(collection(db, "meals"), where("userId", "==", userId), limit(limitCount))

      const querySnapshot = await getDocs(simpleQuery)

      const meals = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
        }
      })

      // Sort client-side instead
      meals.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt).getTime() / 1000
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt).getTime() / 1000
        return dateB - dateA // Descending order
      })

      console.log(`Found ${meals.length} meals for user ${userId} (unordered query)`)
      return meals.slice(0, limitCount)
    }
  } catch (error) {
    console.error("Error getting user meals:", error)
    // Return empty array instead of throwing to prevent UI crashes
    return []
  }
}

// Plans
export const savePlan = async (userId: string, planData: any) => {
  try {
    console.log("Saving plan for:", userId, planData)
    const docRef = await addDoc(collection(db, "plans"), {
      userId,
      ...planData,
      createdAt: serverTimestamp(),
    })
    console.log("Plan saved with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error saving plan:", error)
    throw error
  }
}

export const getUserPlans = async (userId: string) => {
  try {
    console.log("Getting plans for:", userId)

    try {
      const q = query(collection(db, "plans"), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(1))

      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const data = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
        console.log("Plan found:", data)
        return data
      }
    } catch (indexError) {
      console.warn("Index not yet available for plans, falling back to unordered query:", indexError)

      const simpleQuery = query(collection(db, "plans"), where("userId", "==", userId))

      const querySnapshot = await getDocs(simpleQuery)

      if (!querySnapshot.empty) {
        // Get all plans and sort them client-side
        const plans = querySnapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() }
        })

        // Sort by createdAt in descending order
        plans.sort((a, b) => {
          const dateA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt).getTime() / 1000
          const dateB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt).getTime() / 1000
          return dateB - dateA
        })

        if (plans.length > 0) {
          console.log("Plan found (unordered query):", plans[0])
          return plans[0]
        }
      }
    }

    console.log("No plan found for:", userId)
    return null
  } catch (error) {
    console.error("Error getting user plans:", error)
    return null
  }
}

export const testFirestorePermissions = async (userId: string) => {
  try {
    console.log("Testing Firestore permissions for user:", userId)

    // Attempt to read a document.  If the security rules are not set up correctly, this will throw an error.
    const q = query(collection(db, "users"), where("userId", "==", userId), limit(1))
    await getDocs(q)

    // If we made it here, the read was successful.  Now attempt to write a document.
    const testDocRef = doc(collection(db, "tests"))
    await updateDoc(testDocRef, {
      userId,
      test: "test",
    })

    // If we made it here, the write was successful.  Delete the test document.
    // await deleteDoc(testDocRef);

    console.log("Firestore permissions test passed for user:", userId)
    return { success: true, message: "Permissions test passed!" }
  } catch (error: any) {
    console.error("Firestore permissions test failed:", error)
    return { success: false, message: error.message || "Permissions test failed" }
  }
}
