"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { createUserProfile } from "@/lib/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, BarChart3, Check, Lock, Mail, Star, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
}

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      damping: 15,
      stiffness: 100
    } 
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
}

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const userCredential = await signUp(email, password)

      // Create user profile in Firestore
      if (userCredential && userCredential.user) {
        await createUserProfile(userCredential.user.uid, {
          name,
          email,
          fitnessGoal: "general",
          activityLevel: "moderate",
        })
      }

      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden relative px-4">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl opacity-60"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-3xl opacity-60"></div>
      </div>

      <motion.div
        initial="hidden" 
        animate="visible"
        variants={fadeIn}
        className="absolute top-4 left-4 z-20"
      >
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2 hover:bg-background/80 hover:text-primary transition-all duration-300">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </motion.div>
      
      <div className="container grid lg:grid-cols-2 gap-0 lg:gap-8 relative z-10">
        {/* Left Column - Hidden on mobile */}
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="hidden lg:flex items-center justify-center order-2 lg:order-1"
        >
          <div className="relative rounded-2xl overflow-hidden w-full max-w-md shadow-2xl bg-gradient-to-br from-primary/5 to-blue-500/10 border border-white/10">
            <div className="aspect-[4/5] relative p-8 flex items-center justify-center">
              {/* Feature highlights */}
              <div className="relative z-10 space-y-6 px-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-2xl font-bold mb-2 text-foreground">Start Your Fitness Journey</h2>
                  <p className="text-muted-foreground">Join thousands of users already achieving their fitness goals</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="bg-background/40 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">New Features</h3>
                      <p className="text-sm text-muted-foreground">Access to all our advanced tracking tools</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="bg-background/40 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-500/10 p-2 mt-0.5">
                      <Check className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Let's go!</h3>
                      <p className="text-sm text-muted-foreground">Try risk-free with our satisfaction guarantee</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Background decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-blue-500/5 z-0"></div>
            </div>
          </div>
        </motion.div>
        
        {/* Right Column - Sign up Form */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md mx-auto order-1 lg:order-2"
        >
          <Card className="shadow-lg rounded-2xl overflow-hidden bg-background/60 backdrop-blur-md border p-8 lg:p-10">
            <CardHeader className="space-y-1 p-0 mb-8">
              <motion.div variants={slideUp} className="flex items-center justify-center mb-6">
                <div className="relative rounded-full bg-gradient-to-br from-primary to-blue-600 p-2 shadow-inner mr-2">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold text-foreground tracking-tight">
                  <span className="text-primary">Fit</span>Track
                </span>
              </motion.div>
              <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
              <CardDescription className="text-center">Enter your information to get started</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 p-0">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              
              <motion.form variants={staggerContainer} onSubmit={handleSubmit} className="space-y-5">
                <motion.div variants={slideUp} className="space-y-2">
                  <Label htmlFor="name" className="text-foreground/70 font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 py-6 h-12 bg-background/60 border-primary/20 focus:border-primary/60 rounded-xl"
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div variants={slideUp} className="space-y-2">
                  <Label htmlFor="email" className="text-foreground/70 font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 py-6 h-12 bg-background/60 border-primary/20 focus:border-primary/60 rounded-xl"
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div variants={slideUp} className="space-y-2">
                  <Label htmlFor="password" className="text-foreground/70 font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 py-6 h-12 bg-background/60 border-primary/20 focus:border-primary/60 rounded-xl"
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div variants={slideUp} className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground/70 font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 py-6 h-12 bg-background/60 border-primary/20 focus:border-primary/60 rounded-xl"
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div variants={slideUp}>
                  <Button 
                    type="submit" 
                    className="w-full py-6 h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </motion.div>
              </motion.form>
            </CardContent>
            
            <CardFooter className="flex justify-center p-0 mt-8">
              <motion.p variants={slideUp} className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </motion.p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
