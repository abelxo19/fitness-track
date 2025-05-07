"use client"

import { useState } from "react"
import Link from "next/link"
import { sendPasswordResetEmail } from "firebase/auth"
import { motion } from "framer-motion"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, BarChart3, Mail } from "lucide-react"
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

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      toast({
        title: "Success",
        description: "Password reset email sent. Please check your inbox.",
      })
      setEmail("") // Clear the email field
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
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
        <Link href="/login">
          <Button variant="ghost" className="flex items-center gap-2 hover:bg-background/80 hover:text-primary transition-all duration-300">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </Link>
      </motion.div>
      
      <div className="container max-w-md mx-auto p-8 lg:p-10 rounded-2xl bg-background/60 backdrop-blur-md border shadow-lg relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={slideUp}
          className="flex items-center justify-center mb-8"
        >
          <div className="relative rounded-full bg-gradient-to-br from-primary to-blue-600 p-2 shadow-inner mr-2">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground tracking-tight">
            <span className="text-primary">Fit</span>Track
          </span>
        </motion.div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={slideUp}
          className="space-y-2 text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground">Enter your email to receive a password reset link</p>
        </motion.div>
        
        <motion.form 
          initial="hidden"
          animate="visible"
          variants={slideUp}
          onSubmit={handleResetPassword} 
          className="space-y-5"
        >
          <div className="space-y-2">
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
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-6 h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </motion.form>
      </div>
    </div>
  )
} 