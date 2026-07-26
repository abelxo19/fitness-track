"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: any | null
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
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user || null
      console.log("Auth state changed:", user ? "User logged in" : "No user")
      setUser(user)
      setLoading(false)

      if (!user && pathname?.startsWith('/dashboard')) {
        router.push('/')
      } else if (user && pathname === '/') {
        router.push('/dashboard')
      }
    })

    // Check initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    return () => listener?.subscription?.unsubscribe?.()
  }, [pathname, router])

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign up with email:", email)
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      return data
    } catch (error: any) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with email:", email)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
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
