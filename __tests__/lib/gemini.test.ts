import { describe, expect, it } from '@jest/globals'
import { generateFitnessPlan } from '@/lib/gemini'
import type { UserProfile } from '@/lib/gemini'

describe('Gemini API Integration', () => {
  const mockUserProfile: UserProfile = {
    age: 30,
    gender: 'male',
    weight: 75,
    height: 180,
    activityLevel: 'moderate',
    fitnessGoal: 'weight_loss',
    dietaryRestrictions: ['vegetarian'],
    medicalConditions: [],
    equipment: ['dumbbells', 'resistance_bands'],
    timeAvailability: 60,
  }

  it('should generate a valid fitness plan', async () => {
    const plan = await generateFitnessPlan(mockUserProfile)
    
    expect(plan).toBeDefined()
    expect(plan.initialAssessment).toBeDefined()
    expect(plan.nutritionPlan).toBeDefined()
    expect(plan.workoutPlan).toBeDefined()
    expect(plan.dietaryTips).toBeDefined()
    
    // Check nutrition plan structure
    expect(plan.nutritionPlan.overview).toBeDefined()
    expect(plan.nutritionPlan.dailyTargets).toBeDefined()
    expect(plan.nutritionPlan.mealPlans).toHaveLength(7)
    
    // Check workout plan structure
    expect(plan.workoutPlan.overview).toBeDefined()
    expect(plan.workoutPlan.weeklySplit).toHaveLength(7)
    
    // Check each day's workout
    plan.workoutPlan.weeklySplit.forEach(day => {
      expect(day.day).toBeDefined()
      expect(day.focus).toBeDefined()
      expect(day.exercises).toBeDefined()
      expect(day.exercises.length).toBeGreaterThan(0)
    })
    
    // Check each day's meal plan
    plan.nutritionPlan.mealPlans.forEach(dayPlan => {
      expect(dayPlan.day).toBeDefined()
      expect(dayPlan.meals).toBeDefined()
      expect(dayPlan.meals.length).toBeGreaterThan(0)
    })
  })

  it('should handle API errors gracefully', async () => {
    // Test with invalid profile data
    const invalidProfile: UserProfile = { ...mockUserProfile, age: -1 }
    
    await expect(generateFitnessPlan(invalidProfile)).rejects.toThrow()
  })

  it('should generate appropriate plan based on user goals', async () => {
    const weightLossProfile: UserProfile = {
      ...mockUserProfile,
      fitnessGoal: 'weight_loss',
    }
    
    const plan = await generateFitnessPlan(weightLossProfile)
    
    // Check if the plan includes weight loss specific elements
    expect(plan.nutritionPlan.overview.toLowerCase()).toContain('calorie deficit')
    expect(plan.workoutPlan.overview.toLowerCase()).toContain('cardio')
  })
}) 