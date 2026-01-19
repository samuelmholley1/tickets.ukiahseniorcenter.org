import { test, expect } from '@playwright/test';

test.describe('Lunch Sales Page - Basic Functionality', () => {
  test('page loads without errors', async ({ page }) => {
    await page.goto('/internal/lunch');
    // Page should load and have the main heading
    await expect(page.locator('h1')).toBeVisible();
    // Should have a form
    await expect(page.locator('form')).toBeVisible();
  });

  test('can navigate back to internal page', async ({ page }) => {
    await page.goto('/internal/lunch');
    // Find any back/internal link
    const backLink = page.locator('a[href="/internal"]');
    await expect(backLink.first()).toBeVisible();
  });

  test('form has input fields and submit button', async ({ page }) => {
    await page.goto('/internal/lunch');
    // Should have text inputs for customer info
    const textInputs = page.locator('input[type="text"]');
    expect(await textInputs.count()).toBeGreaterThan(2);
    // Should have a submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('can fill out customer name fields', async ({ page }) => {
    await page.goto('/internal/lunch');
    // Fill first two text inputs (first name, last name)
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill('Test');
    await inputs.nth(1).fill('Customer');
    
    await expect(inputs.nth(0)).toHaveValue('Test');
    await expect(inputs.nth(1)).toHaveValue('Customer');
  });
});
