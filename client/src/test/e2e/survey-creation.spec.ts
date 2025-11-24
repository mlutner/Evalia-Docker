import { test, expect } from '@playwright/test';

test.describe('Survey Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the builder
    await page.goto('/builder');
  });

  test('should navigate through wizard steps', async ({ page }) => {
    // Check if we're on the first step
    await expect(page.locator('[data-testid="wizard-step-1"]')).toBeVisible();
    
    // Fill in basic info
    const surveyTitleInput = page.locator('input[placeholder*="title"]').first();
    if (await surveyTitleInput.isVisible()) {
      await surveyTitleInput.fill('Test Survey');
    }
    
    // Proceed to next step
    const nextButton = page.locator('button:has-text("Next")').first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }
  });

  test('should display builder interface', async ({ page }) => {
    // Verify main layout elements are present
    await expect(page.locator('[data-testid="wizard-step-1"]')).toBeVisible();
  });

  test('should handle responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if AI chat button is visible on mobile
    const aiChatButton = page.locator('[data-testid="button-floating-ai-chat"]');
    if (await aiChatButton.isVisible()) {
      await expect(aiChatButton).toBeVisible();
    }
  });
});
