"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { motion } from "framer-motion"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, BarChart3, Check, Lock, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
      toast({
        title: "Success",
        description: "You have been logged in successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to login. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden relative">
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
        {/* Left Column - Login Form */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md mx-auto p-8 lg:p-10 rounded-2xl bg-background/60 backdrop-blur-md border shadow-lg"
        >
          <motion.div variants={slideUp} className="flex items-center justify-center mb-8">
            <div className="relative rounded-full bg-gradient-to-br from-primary to-blue-600 p-2 shadow-inner mr-2">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">
              <span className="text-primary">Fit</span>Track
            </span>
          </motion.div>
          
          <motion.div variants={slideUp} className="space-y-2 text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </motion.div>
          
          <motion.form variants={staggerContainer} onSubmit={handleLogin} className="space-y-5">
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
              <div className="flex justify-between">
                <Label htmlFor="password" className="text-foreground/70 font-medium">Password</Label>
                <Link href="/reset-password" className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
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
            
            <motion.div variants={slideUp}>
              <Button 
                type="submit" 
                className="w-full py-6 h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div 
            variants={slideUp} 
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Create account
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Right Column - Hidden on mobile */}
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="hidden lg:flex items-center justify-center"
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
                  <h2 className="text-2xl font-bold mb-2 text-foreground">Unlock Your Fitness Potential</h2>
                  <p className="text-muted-foreground">Track your progress with our advanced dashboard</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="bg-background/40 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Personalized Plans</h3>
                      <p className="text-sm text-muted-foreground">AI-generated workouts tailored to your goals</p>
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
                      <h3 className="font-medium text-foreground">Advanced Analytics</h3>
                      <p className="text-sm text-muted-foreground">Track your progress with detailed metrics</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Background decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-blue-500/5 z-0"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
