"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, onAuthStateChanged, type Auth } from "firebase/auth"
import { getFirestore, enableIndexedDbPersistence, type Firestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUvrKo19L47o9VZQzCyYLaF_0-BZWgQ8o",
  authDomain: "fitness-tracker-458718.firebaseapp.com",
  projectId: "fitness-tracker-458718",
  storageBucket: "fitness-tracker-458718.firebasestorage.app",
  messagingSenderId: "525096617878",
  appId: "1:525096617878:web:c1f6ab6fe1eb0313527fb7",
  measurementId: "G-6KFBNYRS8Y",
}

// Initialize Firebase
let app
let analytics
let auth: Auth
let db: Firestore

// Only initialize Firebase if we're on the client side
if (typeof window !== "undefined") {
  try {
    // Check if Firebase is already initialized
    app = getApps().length ? getApp() : initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)

    // Print the current user to debug authentication issues
    onAuthStateChanged(auth, (user) => {
      console.log("Current auth state:", user ? `User logged in: ${user.uid}` : "No user logged in")
    })

    // Try to enable offline persistence
    try {
      enableIndexedDbPersistence(db)
        .then(() => console.log("Offline persistence enabled"))
        .catch((err) => {
          if (err.code === "failed-precondition") {
            console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.")
          } else if (err.code === "unimplemented") {
            console.warn("The current browser doesn't support all of the features required to enable persistence")
          } else {
            console.error("Error enabling persistence:", err)
          }
        })
    } catch (e) {
      console.warn("Error enabling persistence:", e)
    }

    // Only initialize analytics on the client side
    try {
      analytics = getAnalytics(app)
      console.log("Analytics initialized")
    } catch (error) {
      console.error("Analytics initialization error:", error)
    }

    console.log("Firebase initialized successfully with project:", firebaseConfig.projectId)
  } catch (error) {
    console.error("Error initializing Firebase:", error)
  }
}

export { app, auth, db, analytics }
