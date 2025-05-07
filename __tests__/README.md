# Fitness Track - Test Documentation

This document provides information about the testing structure and how to run tests for the Fitness Track application.

## Test Structure

The project includes three types of tests:

1. **Unit Tests** - Testing individual functions and utilities
2. **Integration Tests** - Testing components and their interactions
3. **End-to-End (E2E) Tests** - Testing complete user flows

## Prerequisites

Before running tests, install the required dependencies:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @playwright/test
```

## Running Tests

### Unit and Integration Tests

Run unit and integration tests with Jest:

```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run specific test file
npm test -- __tests__/lib/utils.test.ts
```

### End-to-End Tests

Run E2E tests with Playwright:

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npx playwright test

# Run in UI mode
npx playwright test --ui

# Run specific test file
npx playwright test __tests__/e2e/navigation.test.ts
```

## Test Coverage

The tests cover:

### Unit Tests (`__tests__/lib/utils.test.ts`)
- BMI calculation function
- Calorie needs calculation

### Integration Tests (`__tests__/app/dashboard.test.ts`)
- Dashboard rendering with authenticated user
- Dashboard UI components and stats display

### E2E Tests (`__tests__/e2e/navigation.test.ts`)
- Landing page navigation
- Authentication flow
- Protected route access

## Test Results for Report

When documenting test results for your coursework report:

1. Include screenshot(s) of passing tests
2. Mention test coverage percentages
3. Highlight any edge cases tested
4. Explain how the tests validate your application requirements

Example format for reporting a test:

```
Test: BMI Calculation
Purpose: Validate the BMI calculation algorithm
Results: All test cases passed (3/3)
Coverage: 100% of function lines
Notes: Successfully handles standard and edge cases
```

## Extending Tests

To add more tests:

1. Unit tests: Add more test cases in `__tests__/lib/`
2. Integration tests: Create component tests in `__tests__/app/`
3. E2E tests: Add user flows in `__tests__/e2e/` 