import { test, expect } from '@playwright/test';

test.describe('Lunch Sales Page', () => {
  test('page loads and form is functional', async ({ page }) => {
    await page.goto('/internal/lunch');
    
    // Page loads
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
    
    // Can fill customer info
    const customerCard = page.locator('.card:has-text("Customer Information")');
    const inputs = customerCard.locator('input[type="text"]');
    await inputs.nth(0).fill('Test');
    await inputs.nth(1).fill('Customer');
    
    // Staff initials
    await page.locator('input[placeholder="ABC"]').fill('TC');
    
    // Submit button becomes enabled
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    
    // Verify form is ready to submit (don't actually submit in test)
    const buttonText = await submitButton.textContent();
    expect(buttonText).toContain('Complete Transaction');
  });
});
