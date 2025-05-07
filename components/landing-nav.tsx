"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { BarChart3, Menu, X } from "lucide-react"
import { useState } from "react"

// Animation variants
const navbarVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: "easeOut" 
    } 
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0,
    transition: { 
      delay: i * 0.1,
      duration: 0.4
    }
  })
}

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5,
      type: "spring",
      stiffness: 200
    } 
  }
}

const mobileMenuVariants = {
  closed: { 
    opacity: 0,
    y: -20,
    pointerEvents: "none" as const,
  },
  open: { 
    opacity: 1,
    y: 0,
    pointerEvents: "auto" as const,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
    }
  }
}

export function LandingNav() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <motion.nav 
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
      className="fixed top-0 w-full z-50"
    >
      {/* Gradient blur background */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-lg border-b"></div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <motion.div 
            variants={logoVariants}
            className="flex items-center"
          >
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative rounded-full bg-gradient-to-br from-primary to-primary/70 p-1.5 transition-transform duration-300 group-hover:scale-110">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">
                <span className="text-primary">Fit</span>Track
              </span>
            </Link>
          </motion.div>
          
          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative z-20"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <motion.div custom={0} variants={itemVariants}>
                  <Link href="/dashboard">
                    <Button 
                      variant="ghost" 
                      className="px-4 font-medium text-foreground/80 hover:text-foreground hover:bg-primary/10"
                    >
                      Dashboard
                    </Button>
                  </Link>
                </motion.div>
                <motion.div custom={1} variants={itemVariants}>
                  <Button 
                    variant="outline" 
                    onClick={logout}
                    className="px-4 border-primary/30 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                  >
                    Logout
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div custom={0} variants={itemVariants}>
                  <Link href="/login">
                    <Button 
                      variant="ghost"
                      className="px-4 font-medium text-foreground/80 hover:text-foreground hover:bg-primary/10"
                    >
                      Login
                    </Button>
                  </Link>
                </motion.div>
                <motion.div custom={1} variants={itemVariants}>
                  <Link href="/signup">
                    <Button 
                      className="px-6 bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-primary text-primary-foreground shadow-sm hover:shadow transition-all duration-300"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial="closed"
        animate={mobileMenuOpen ? "open" : "closed"}
        variants={mobileMenuVariants}
        className="absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg shadow-lg border-b md:hidden"
      >
        <div className="px-4 py-6 space-y-4">
          {user ? (
            <>
              <motion.div variants={itemVariants} className="w-full">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-lg font-medium"
                  >
                    Dashboard
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants} className="w-full">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-lg font-medium"
                >
                  Logout
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={itemVariants} className="w-full">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-lg font-medium"
                  >
                    Login
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants} className="w-full">
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    className="w-full justify-start text-lg font-medium bg-primary hover:bg-primary/90"
                  >
                    Sign Up
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </motion.nav>
  )
} 