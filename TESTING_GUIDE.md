# Evalia Testing Guide

## Overview

This guide covers the comprehensive testing suite for Evalia, including unit tests, integration tests, and end-to-end (E2E) tests.

## Testing Stack

- **Unit Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Test Runner**: Vitest CLI and Playwright Test
- **Coverage**: V8 coverage reporting

## Running Tests

### Unit Tests

Run all unit tests:
```bash
npm run test
```

Run tests in watch mode (re-run on file changes):
```bash
npm run test:watch
```

Run tests with UI dashboard:
```bash
npm run test:ui
```

Generate coverage report:
```bash
npm run test:coverage
```

### End-to-End Tests

Run all E2E tests:
```bash
npm run test:e2e
```

Run E2E tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

Run E2E tests in debug mode:
```bash
npm run test:e2e:debug
```

View E2E test report:
```bash
npm run test:e2e:report
```

## Test Structure

### Unit Tests

Located in `client/src/test/components/`

- **Button.test.tsx** - Tests for the Button component
  - Rendering
  - Click handlers
  - Variants and sizes
  - Disabled state
  - Type attribute

- **WizardSteps.test.tsx** - Tests for the WizardSteps component
  - Step rendering
  - Current step highlighting
  - Completed step indication
  - Step navigation

### E2E Tests

Located in `client/src/test/e2e/`

- **survey-creation.spec.ts** - Survey creation workflow
  - Wizard step navigation
  - Form submission
  - Responsive behavior

- **dashboard.spec.ts** - Dashboard functionality
  - KPI card display
  - Navigation
  - Button interactions

- **navigation.spec.ts** - Application routing
  - Page navigation
  - 404 handling
  - Back button functionality

## Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    await page.locator('button').click();
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

## Best Practices

### Unit Testing

1. **Test Behavior, Not Implementation** - Focus on what the component does, not how it does it
2. **Use Semantic Queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Keep Tests Isolated** - Each test should be independent and not rely on other tests
4. **Mock External Dependencies** - Use `vi.fn()` and `vi.mock()` for external services
5. **Test User Interactions** - Use `userEvent` instead of `fireEvent` for realistic interactions

### E2E Testing

1. **Test Critical User Paths** - Focus on the most important user workflows
2. **Use Data Attributes** - Add `data-testid` attributes to important elements
3. **Wait for Elements** - Use Playwright's built-in waiting mechanisms
4. **Avoid Hardcoded Waits** - Use `page.waitForLoadState()` instead of `page.waitForTimeout()`
5. **Clean Up Resources** - Ensure tests clean up any created data

## CI/CD Integration

Tests should be run in your CI/CD pipeline:

```yaml
- name: Run unit tests
  run: npm run test

- name: Run E2E tests
  run: npm run test:e2e
```

## Debugging Tests

### Debug Unit Tests

```bash
npm run test:ui  # Visual UI dashboard
```

### Debug E2E Tests

```bash
npm run test:e2e:debug
# Or use
npm run test:e2e:headed  # See browser while tests run
```

Use Playwright Inspector:
```bash
PWDEBUG=1 npm run test:e2e
```

## Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

View detailed coverage:
```bash
npm run test:coverage
# Open coverage/index.html in browser
```

## Common Issues

### Tests timing out
- Increase timeout in `vitest.config.ts` or `playwright.config.ts`
- Check for missing `await` statements
- Verify selectors are correct

### Flaky tests
- Use explicit waits instead of fixed delays
- Ensure proper cleanup in `afterEach`
- Check for race conditions

### Module resolution errors
- Verify path aliases in `vitest.config.ts` match `vite.config.ts`
- Check import paths use `@` alias correctly

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
