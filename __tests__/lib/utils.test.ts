import { calculateBMI, calculateCalorieNeeds } from '@/lib/utils'

// Unit tests for utility functions
describe('Utility Functions', () => {
  describe('calculateBMI function', () => {
    it('should calculate BMI correctly', () => {
      // Test with standard values
      expect(calculateBMI(70, 170)).toBeCloseTo(24.22, 2)
      
      // Test with edge cases
      expect(calculateBMI(40, 150)).toBeCloseTo(17.78, 2)
      expect(calculateBMI(100, 180)).toBeCloseTo(30.86, 2)
    })
  })

  describe('calculateCalorieNeeds function', () => {
    it('should calculate calorie needs based on profile', () => {
      // Test for male
      const maleNeeds = calculateCalorieNeeds({
        gender: 'male',
        weight: 80,
        height: 180,
        age: 30,
        activityLevel: 'moderate'
      })
      expect(maleNeeds).toBeGreaterThan(2000)
      
      // Test for female
      const femaleNeeds = calculateCalorieNeeds({
        gender: 'female',
        weight: 60,
        height: 165,
        age: 30,
        activityLevel: 'moderate'
      })
      expect(femaleNeeds).toBeGreaterThan(1500)
      expect(femaleNeeds).toBeLessThan(maleNeeds)
    })
  })
}) 