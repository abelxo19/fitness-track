import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate Body Mass Index (BMI)
 * @param weight Weight in kilograms
 * @param height Height in centimeters
 * @returns BMI value
 */
export function calculateBMI(weight: number, height: number): number {
  return (weight / Math.pow(height / 100, 2));
}

/**
 * Calculate estimated daily calorie needs
 * @param profile User profile with basic metrics
 * @returns Estimated daily calorie needs
 */
export function calculateCalorieNeeds(profile: {
  gender: string;
  weight: number;
  height: number;
  age: number;
  activityLevel: string;
}): number {
  const { gender, weight, height, age, activityLevel } = profile;
  
  // Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Apply activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.2;
  
  return Math.round(bmr * multiplier);
}
