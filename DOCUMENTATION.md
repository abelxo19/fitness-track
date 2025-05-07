# Fitness Tracker - MVP Project Documentation

## 1. Project Overview

### Purpose
The Fitness Tracker app helps users track workouts, meals, and generate simple fitness plans.

### Core Features
- Track workouts and nutrition
- Generate basic fitness plans
- View progress analytics
- User authentication

## 2. System Architecture

### Technology Stack
- **Frontend**: Next.js with TypeScript
- **Backend**: Firebase (Authentication and Firestore)
- **Hosting**: firebasehosting

## 3. Key Features

### User Profiles
- Basic user information
- Fitness goals
- Height/weight metrics

### Workout Tracking
- Log workout type and duration
- Calculate calories burned
- View workout history

### Nutrition Tracking
- Log meals with basic nutritional info
- Track daily calorie intake
- View meal history

### Analytics
- Basic progress charts
- Weekly/monthly summaries

## 4. Data Models

### User Profile
```typescript
interface UserProfile {
  name: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  activityLevel: string;
  fitnessGoal: string;
}
```

### Workout
```typescript
interface Workout {
  type: string;
  duration: number;
  caloriesBurned: number;
  notes: string;
  createdAt: Timestamp;
}
```

### Meal
```typescript
interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Timestamp;
}
```

## 5. Implementation

### Authentication
- Firebase email/password authentication
- Protected routes for logged-in users

### Data Storage
- Firestore collections for users, workouts, and meals
- Basic security rules

## 6. Testing

### Testing Approach
- Simple unit tests for utility functions
- Basic component tests
- Simple E2E tests for critical flows

## 7. Deployment

### Development
- Local development with `npm run dev`
- Firebase emulator for local testing

### Production
- Deployed to Vercel
- Connected to Firebase production instance

## 8. Future Improvements
- Mobile app version
- Social features
- Integration with fitness devices
- Advanced analytics

## 9. API Overview

The app uses Firebase SDK directly rather than custom API endpoints:

- Firebase Authentication for user management
- Firestore for data storage
- Simple utility functions for calculations

## 10. Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up Firebase credentials
4. Run development server with `npm run dev`
5. Deploy with Vercel CLI or GitHub integration 