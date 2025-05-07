"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  signUp: (email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  signUp: async () => {},
  signIn: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!auth) {
      console.error("Firebase auth is not initialized")
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user")
      setUser(user)
      setLoading(false)

      // Handle route protection
      if (!user && pathname?.startsWith('/dashboard')) {
        router.push('/')
      } else if (user && pathname === '/') {
        router.push('/dashboard')
      }
    })

    return () => unsubscribe()
  }, [pathname, router])

  const logout = async () => {
    if (!auth) throw new Error("Firebase auth is not initialized")
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase auth is not initialized")
    try {
      console.log("Attempting to sign up with email:", email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("Sign up successful:", userCredential.user.uid)
      return userCredential
    } catch (error: any) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase auth is not initialized")
    try {
      console.log("Attempting to sign in with email:", email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("Sign in successful:", userCredential.user.uid)
      return userCredential
    } catch (error: any) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, signUp, signIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
