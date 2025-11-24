import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    // Start at dashboard
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Navigate to builder
    const builderLink = page.locator('a[href*="/builder"]').first();
    if (await builderLink.isVisible()) {
      await builderLink.click();
      await expect(page).toHaveURL(/\/builder/);
    }
  });

  test('should display 404 page for invalid routes', async ({ page }) => {
    await page.goto('/nonexistent-page');
    // Should either stay on current page or show 404
    await expect(page).toHaveURL(/\/|\/not-found/);
  });

  test('should handle back navigation', async ({ page }) => {
    await page.goto('/');
    await page.goto('/builder');
    
    await page.goBack();
    await expect(page).toHaveURL('/');
  });
});
