"use client";
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { LandingNav } from "@/components/landing-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Activity, 
  ArrowRight, 
  BarChart3,
  Calendar, 
  ChevronRight, 
  Dumbbell, 
  LineChart, 
  Shield, 
  Sparkles, 
  Target, 
  Utensils 
} from "lucide-react"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25
    }
  }
}

const slideUp = {
  hidden: { opacity: 0, y: 30 },
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

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl opacity-60"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-3xl opacity-60"></div>
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col">
        <LandingNav />

        {/* Hero Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="w-full flex-1 pt-24 md:pt-32 lg:pt-40 lg:min-h-[80vh] lg:flex lg:items-center"
        >
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <motion.div variants={slideUp} className="flex flex-col justify-center space-y-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex max-w-fit items-center rounded-full px-4 py-1.5 text-sm font-semibold transition-colors bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary shadow-sm"
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                  <span>AI-Powered Fitness Platform</span>
                </motion.div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    <span className="block">Transform Your</span>
                    <span className="block bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                      Fitness Journey
                    </span>
                  </h1>
                  <p className="text-muted-foreground text-lg md:text-xl max-w-[600px] leading-relaxed">
                    Your personal AI-powered fitness companion. Track workouts, monitor nutrition, and achieve your goals with personalized plans.
                  </p>
                </div>
                
                <motion.div 
                  variants={staggerContainer}
                  className="flex flex-col gap-4 sm:flex-row pt-4"
                >
                  <motion.div variants={slideUp}>
                    <Link href="/signup">
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md hover:shadow-lg transition-all duration-300 text-white"
                      >
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div variants={slideUp}>
                    <Link href="/dashboard/plans">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full sm:w-auto border-primary/30 text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
                      >
                        Try Sample Plans
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  variants={fadeIn}
                  className="flex items-center gap-8 pt-8"
                >
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-primary">5K+</div>
                    <div className="text-xs text-muted-foreground">Active Users</div>
                  </div>
                  <div className="h-8 border-l border-muted"></div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-primary">98%</div>
                    <div className="text-xs text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="h-8 border-l border-muted"></div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-xs text-muted-foreground">Support</div>
                  </div>
                </motion.div>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="flex items-center justify-center relative"
              >
                <motion.div 
                  variants={floatingAnimation}
                  className="relative w-full max-w-[520px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 z-10 rounded-2xl mix-blend-overlay"></div>
                  
                  <Image
                    src="/hero-img.jpg"
                    alt="Fitness tracking dashboard preview"
                    fill
                    className="object-cover z-0 rounded-2xl"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 600px"
                    priority
                  />
                  
                  {/* Glass cards */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="absolute top-4 right-4 bg-background/70 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/20 z-20"
                  >
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Daily Progress</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <div className="h-1.5 w-10 rounded-full bg-primary"></div>
                      <div className="h-1.5 w-3 rounded-full bg-muted"></div>
                      <div className="h-1.5 w-3 rounded-full bg-muted"></div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="absolute bottom-4 left-4 bg-background/70 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/20 z-20"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">Goal Progress</span>
                    </div>
                    <div className="mt-1 grid grid-cols-5 gap-1">
                      <div className="h-1 rounded-full bg-blue-500"></div>
                      <div className="h-1 rounded-full bg-blue-500"></div>
                      <div className="h-1 rounded-full bg-blue-500"></div>
                      <div className="h-1 rounded-full bg-muted"></div>
                      <div className="h-1 rounded-full bg-muted"></div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    className="absolute top-1/2 -translate-y-1/2 -left-6 bg-background/70 backdrop-blur-md rounded-xl py-3 px-4 shadow-lg border border-white/20 z-20"
                  >
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">AI Plans</span>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="w-full py-24 md:py-32"
        >
          <div className="container px-4 md:px-6">
            <motion.div variants={slideUp} className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary">
                  <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                  <span>Key Features</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Comprehensive <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Fitness Tracking</span>
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed leading-relaxed">
                  Track your workouts, monitor your nutrition, and get personalized AI-generated plans to help you achieve
                  your fitness goals.
                </p>
              </div>
            </motion.div>
            
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-10 pt-8">
              <motion.div
                variants={cardVariant}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className="flex flex-col items-start h-full rounded-xl bg-gradient-to-br from-background to-blue-500/5 border-blue-500/30 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full"></div>
                  <CardHeader className="pb-2">
                    <motion.div 
                      className="p-3 rounded-xl bg-blue-500/10 mb-3 w-fit"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Dumbbell className="h-6 w-6 text-blue-500" />
                    </motion.div>
                    <CardTitle className="text-xl">Workout Tracking</CardTitle>
                    <CardDescription className="text-muted-foreground/80">Log workouts and track progress</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Record different types of workouts, track duration, intensity, and calories burned with our intuitive interface.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={cardVariant}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className="flex flex-col items-start h-full rounded-xl bg-gradient-to-br from-background to-green-500/5 border-green-500/30 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full"></div>
                  <CardHeader className="pb-2">
                    <motion.div 
                      className="p-3 rounded-xl bg-green-500/10 mb-3 w-fit"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Utensils className="h-6 w-6 text-green-500" />
                    </motion.div>
                    <CardTitle className="text-xl">Nutrition Tracking</CardTitle>
                    <CardDescription className="text-muted-foreground/80">Monitor your nutrition</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Track meals, calories, and macronutrients to maintain a balanced diet and reach your fitness goals faster.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={cardVariant}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className="flex flex-col items-start h-full rounded-xl bg-gradient-to-br from-background to-purple-500/5 border-purple-500/30 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-full"></div>
                  <CardHeader className="pb-2">
                    <motion.div 
                      className="p-3 rounded-xl bg-purple-500/10 mb-3 w-fit"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Sparkles className="h-6 w-6 text-purple-500" />
                    </motion.div>
                    <CardTitle className="text-xl">AI-Powered Plans</CardTitle>
                    <CardDescription className="text-muted-foreground/80">Get personalized plans</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Receive customized workout and nutrition plans based on your goals, preferences, and fitness level.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Analytics Preview */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="w-full py-24 md:py-32 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <motion.div variants={slideUp} className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary">
                  <LineChart className="mr-2 h-3.5 w-3.5 text-primary" />
                  <span>Real-Time Analytics</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Data-Driven</span> Insights
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed leading-relaxed">
                  Monitor your fitness journey with detailed analytics and insights to optimize your performance.
                </p>
              </div>
            </motion.div>
            
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-8">
              <motion.div variants={cardVariant}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/50 rounded-xl overflow-hidden bg-gradient-to-br from-background to-blue-500/5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Workouts</CardTitle>
                    <Dumbbell className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Track</div>
                    <p className="text-xs text-muted-foreground">Your fitness activities</p>
                    <div className="mt-3 flex items-center gap-1">
                      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-2/3 rounded-full bg-blue-500"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={cardVariant}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/50 rounded-xl overflow-hidden bg-gradient-to-br from-background to-green-500/5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nutrition</CardTitle>
                    <Utensils className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Monitor</div>
                    <p className="text-xs text-muted-foreground">Your daily intake</p>
                    <div className="mt-3 flex items-center gap-1">
                      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-3/4 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={cardVariant}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/50 rounded-xl overflow-hidden bg-gradient-to-br from-background to-purple-500/5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progress</CardTitle>
                    <Activity className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform duration-300" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Analyze</div>
                    <p className="text-xs text-muted-foreground">Your achievements</p>
                    <div className="mt-3 flex items-center gap-1">
                      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-4/5 rounded-full bg-purple-500"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={cardVariant}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/50 rounded-xl overflow-hidden bg-gradient-to-br from-background to-orange-500/5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Plans</CardTitle>
                    <Calendar className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform duration-300" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Follow</div>
                    <p className="text-xs text-muted-foreground">Your fitness journey</p>
                    <div className="mt-3 flex items-center gap-1">
                      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-1/2 rounded-full bg-orange-500"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="w-full py-24 md:py-32"
        >
          <div className="container px-4 md:px-6">
            <motion.div 
              variants={slideUp}
              className="flex flex-col items-center justify-center space-y-6 text-center max-w-4xl mx-auto p-8 md:p-12 rounded-2xl border shadow-lg bg-gradient-to-br from-background to-primary/5"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="space-y-4"
              >
                <div className="inline-flex mx-auto items-center rounded-full px-3 py-1 text-sm font-medium bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary mb-4">
                  <Shield className="mr-2 h-3.5 w-3.5 text-primary" />
                  <span>Trusted by 5,000+ users</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Start Your <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Fitness Journey</span> Today
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed">
                  Join thousands of users who are already tracking their fitness progress and achieving their goals.
                </p>
              </motion.div>
              <motion.div variants={slideUp} className="pt-6">
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="text-lg px-10 py-6 h-auto bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md hover:shadow-lg transition-all duration-300 text-white rounded-xl"
                  >
                    Get Started
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="w-full border-t py-8 md:py-10 mt-auto bg-gradient-to-b from-background to-primary/5"
        >
          <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 md:px-6">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-gradient-to-br from-primary to-primary/70 p-1">
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} <span className="font-medium">FitTrack</span>. All rights reserved.</p>
            </div>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  )
}
