import { test, expect } from '@playwright/test'

// Simple E2E test for basic navigation and functionality
test.describe('Navigation E2E Test', () => {
  test('landing page navigation', async ({ page }) => {
    // Visit the landing page
    await page.goto('/')
    
    // Check for main elements
    await expect(page.getByRole('heading', { name: /Fitness Track/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible()
    
    // Navigate to features section
    await page.getByRole('link', { name: /Features/i }).click()
    await expect(page.getByRole('heading', { name: /Key Features/i })).toBeVisible()
  })
  
  test('authentication flow', async ({ page }) => {
    // Visit the sign-in page
    await page.goto('/auth/signin')
    
    // Check for auth elements
    await expect(page.getByRole('heading', { name: /Sign In/i })).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Password/i)).toBeVisible()
    
    // Test navigation to sign-up
    await page.getByRole('link', { name: /Sign Up/i }).click()
    await expect(page.getByRole('heading', { name: /Create an Account/i })).toBeVisible()
  })
  
  test('dashboard access requires auth', async ({ page }) => {
    // Try to visit dashboard directly (should redirect to login)
    await page.goto('/dashboard')
    
    // Should be redirected to sign-in
    await expect(page).toHaveURL(/.*signin/)
  })
}) 