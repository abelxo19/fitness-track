# Simple Testing Approach for MVP

## Testing Goals
- Verify core functionality works
- Catch obvious bugs
- Provide basic confidence in the application

## Testing Types

### 1. Unit Tests
We use Jest to test basic utility functions:
- BMI calculator
- Calorie calculator
- Date formatters

Example:
```typescript
test('BMI calculator works correctly', () => {
  expect(calculateBMI(70, 170)).toBeCloseTo(24.22, 2);
});
```

### 2. Component Tests
We test critical UI components with React Testing Library:
- Authentication forms
- Workout entry form
- Basic dashboard rendering

Example:
```typescript
test('Workout form submits with correct data', () => {
  // Render form
  // Fill inputs
  // Click submit
  // Verify correct data
});
```

### 3. Basic E2E Tests
We use Playwright for a few essential user flows:
- User signup/login
- Adding a workout
- Viewing the dashboard

Example:
```typescript
test('User can log in and view dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## Running Tests

### Unit and Component Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## Test Reports
For the MVP, we'll use Jest's basic console output and Playwright's HTML report to verify test results.

## Future Test Improvements
After MVP, we can expand:
- Increase test coverage
- Add more edge cases
- Implement continuous integration
- Add accessibility testing 