# 🏃‍♂️ FitTrack - AI-Powered Fitness Companion

> Transform your fitness journey with personalized tracking, analytics, and AI-powered insights.

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

### 🎯 **Core Functionality**
- **Workout Tracking** - Log exercises, duration, and calories burned
- **Nutrition Monitoring** - Track meals, calories, and macronutrients
- **Progress Analytics** - Visual charts and insights
- **AI-Powered Plans** - Personalized fitness recommendations
- **User Profiles** - Customizable goals and metrics

### 🎨 **Modern UI/UX**
- **Responsive Design** - Works seamlessly on all devices
- **Dark/Light Mode** - Beautiful theme switching
- **Smooth Animations** - Framer Motion powered interactions
- **Intuitive Navigation** - Clean, accessible interface
- **Real-time Updates** - Live data synchronization

### 🔧 **Technical Excellence**
- **TypeScript** - Full type safety
- **Firebase Integration** - Authentication & real-time database
- **Component Library** - Radix UI + shadcn/ui components
- **Testing Suite** - Jest + Playwright for reliability
- **Performance Optimized** - Next.js 15 with App Router

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Firebase project

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fitness-tracker.git
cd fitness-tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Setup

Create a `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
fitness-tracker/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API endpoints
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── landing-nav.tsx   # Landing page navigation
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── firebase.ts       # Firebase configuration
│   ├── firestore.ts      # Database operations
│   ├── analytics.ts      # Analytics utilities
│   └── gemini.ts         # AI integration
├── public/               # Static assets
└── styles/               # Additional stylesheets
```

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Beautiful component library

### **Backend & Services**
- **Firebase Authentication** - User management
- **Firestore** - Real-time database
- **Firebase Hosting** - Production deployment
- **Google Gemini AI** - AI-powered features

### **Development Tools**
- **Jest** - Unit testing
- **Playwright** - E2E testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🎯 Key Features Deep Dive

### **Dashboard Overview**
- Real-time progress tracking
- Daily calorie balance
- Workout and meal summaries
- Goal progress visualization

### **Workout Management**
- Exercise type selection
- Duration and intensity tracking
- Calorie burn calculations
- Workout history and trends

### **Nutrition Tracking**
- Meal logging with nutritional info
- Macro and micronutrient tracking
- Daily calorie intake monitoring
- Meal planning suggestions

### **AI Integration**
- Personalized workout recommendations
- Nutrition advice based on goals
- Progress analysis and insights
- Adaptive fitness plans

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

## 🚀 Deployment

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Deploy to Firebase
firebase deploy
```

### Vercel (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Firebase](https://firebase.google.com/) for backend services

## 📞 Support

- **Documentation**: [DOCUMENTATION.md](./DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/fitness-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/fitness-tracker/discussions)

---

<div align="center">
  <p>Made with ❤️ for fitness enthusiasts</p>
  <p>Transform your fitness journey today!</p>
</div> 