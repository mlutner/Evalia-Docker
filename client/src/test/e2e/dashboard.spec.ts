import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/');
  });

  test('should display dashboard overview', async ({ page }) => {
    // Check for dashboard title
    const dashboardTitle = page.locator('text=Dashboard');
    await expect(dashboardTitle).toBeVisible();
  });

  test('should display KPI cards', async ({ page }) => {
    // Check for KPI card elements
    const kpiCards = page.locator('[class*="card"]');
    const count = await kpiCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have new questionnaire button', async ({ page }) => {
    const newQuestButton = page.locator('[data-testid="button-start-survey-dashboard"]');
    await expect(newQuestButton).toBeVisible();
    await expect(newQuestButton).toContainText('New Questionnaire');
  });

  test('should navigate to builder on new questionnaire click', async ({ page }) => {
    const newQuestButton = page.locator('[data-testid="button-start-survey-dashboard"]');
    await newQuestButton.click();
    
    // Should navigate to builder
    await expect(page).toHaveURL(/\/builder/);
  });

  test('should display date filter button', async ({ page }) => {
    const dateFilter = page.locator('[data-testid="button-date-filter"]');
    await expect(dateFilter).toBeVisible();
  });
});
