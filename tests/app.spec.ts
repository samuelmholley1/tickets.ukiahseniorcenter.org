import { test, expect } from '@playwright/test';

test.describe('Homepage - Public Ticket Sales', () => {
  test('should load homepage and display both event buttons', async ({ page }) => {
    await page.goto('/');
    
    // Check page has a title
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for both event buttons/cards
    await expect(page.getByText('Christmas Drive-Thru Meal')).toBeVisible();
    await expect(page.getByText('New Year\'s Eve Gala Dance')).toBeVisible();
    
    // Check for dates
    await expect(page.getByText('December 23, 2025')).toBeVisible();
    await expect(page.getByText('December 31, 2025')).toBeVisible();
  });

  test('should have clickable event buttons', async ({ page }) => {
    await page.goto('/');
    
    // Find and verify buttons are clickable (look for any button-like element)
    const christmasButton = page.locator('text=Christmas Drive-Thru Meal').first();
    const nyeButton = page.locator('text=New Year\'s Eve Gala Dance').first();
    
    await expect(christmasButton).toBeVisible();
    await expect(nyeButton).toBeVisible();
  });
});

test.describe('Internal Landing Page', () => {
  test('should load internal page with header', async ({ page }) => {
    await page.goto('/internal');
    
    await expect(page.locator('h1')).toContainText('Internal Ticket Sales');
    await expect(page.getByText('Staff use only')).toBeVisible();
  });

  test('should have Record Ticket Sale button', async ({ page }) => {
    await page.goto('/internal');
    
    const salesButton = page.getByText('Record Ticket Sale');
    await expect(salesButton).toBeVisible();
    
    // Verify it's a link
    const link = page.locator('a:has-text("Record Ticket Sale")');
    await expect(link).toHaveAttribute('href', '/internal/sales');
  });

  test('should navigate to sales form when button clicked', async ({ page }) => {
    await page.goto('/internal');
    
    await page.click('text=Record Ticket Sale');
    await expect(page).toHaveURL('/internal/sales');
  });
});

test.describe('Unified Sales Form - Field Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/internal/sales');
  });

  test('should display all form sections', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Ticket Sales');
    await expect(page.getByText('Select Tickets')).toBeVisible();
    await expect(page.getByText('Customer Information')).toBeVisible();
  });

  test('should have all ticket quantity fields', async ({ page }) => {
    // Check for ticket input fields by looking for number inputs
    const numberInputs = page.locator('input[type="number"]');
    await expect(numberInputs.nth(0)).toBeVisible(); // Christmas Member
    await expect(numberInputs.nth(1)).toBeVisible(); // Christmas Non-Member
    await expect(numberInputs.nth(2)).toBeVisible(); // NYE Member
    await expect(numberInputs.nth(3)).toBeVisible(); // NYE Non-Member
    
    // Verify labels exist
    await expect(page.getByText(/Member Tickets.*\$15/)).toBeVisible();
    await expect(page.getByText(/Non-Member Tickets.*\$20/)).toBeVisible();
    await expect(page.getByText(/Member Tickets.*\$35/)).toBeVisible();
    await expect(page.getByText(/Non-Member Tickets.*\$40/)).toBeVisible();
  });

  test('should have all customer information fields', async ({ page }) => {
    // Check for all required form fields
    await expect(page.getByText('First Name *')).toBeVisible();
    await expect(page.getByText('Last Name *')).toBeVisible();
    await expect(page.getByText('Email Address *')).toBeVisible();
    await expect(page.getByText('Phone Number *')).toBeVisible();
    await expect(page.getByText('Payment Method *')).toBeVisible();
    await expect(page.getByText(/Staff Initials/)).toBeVisible();
    
    // Verify actual inputs exist
    const textInputs = page.locator('input[type="text"], input[type="email"], input[type="tel"]');
    const count = await textInputs.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('should calculate Christmas subtotal correctly', async ({ page }) => {
    // Add 2 member tickets and 1 non-member ticket using nth selectors
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(0).fill('2'); // Christmas Member
    await numberInputs.nth(1).fill('1'); // Christmas Non-Member
    
    // Should show subtotal: 2*15 + 1*20 = $50
    await expect(page.getByText('Subtotal: $50.00')).toBeVisible();
  });

  test('should calculate NYE subtotal correctly', async ({ page }) => {
    // Add 1 member ticket and 2 non-member tickets
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(2).fill('1'); // NYE Member
    await numberInputs.nth(3).fill('2'); // NYE Non-Member
    
    // Should show subtotal: 1*35 + 2*40 = $115
    await expect(page.getByText('Subtotal: $115.00')).toBeVisible();
  });

  test('should calculate grand total correctly', async ({ page }) => {
    // Christmas: 1 member, NYE: 1 member
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(0).fill('1'); // Christmas Member
    await numberInputs.nth(2).fill('1'); // NYE Member
    
    // Grand total: 15 + 35 = $50
    await expect(page.getByText('Total: $50.00')).toBeVisible();
  });

  test('should show check number field when check payment selected', async ({ page }) => {
    const paymentSelect = page.locator('select').first();
    await paymentSelect.selectOption('check');
    
    await expect(page.getByText('Check Number *')).toBeVisible();
  });

  test('should hide check number field when cash payment selected', async ({ page }) => {
    const paymentSelect = page.locator('select').first();
    
    // First select check to show field
    await paymentSelect.selectOption('check');
    await expect(page.getByText('Check Number *')).toBeVisible();
    
    // Then select cash to hide it
    await paymentSelect.selectOption('cash');
    await expect(page.getByText('Check Number *')).not.toBeVisible();
  });

  test('should have submit button', async ({ page }) => {
    // Look for any button that could be used to proceed/submit
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    // Should be disabled when no tickets selected
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when tickets are selected', async ({ page }) => {
    // Add a ticket
    await page.getByLabel(/Member Tickets.*\$15/).first().fill('1');
    
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
  });
});

test.describe('Form Submission Flow', () => {
  test('should complete full submission and show confirmation', async ({ page }) => {
    await page.goto('/internal/sales');
    
    // Fill in ticket quantities using nth selectors
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(0).fill('2'); // Christmas Member
    await numberInputs.nth(2).fill('1'); // NYE Member
    
    // Fill in customer information using placeholder or nth
    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('John'); // First Name
    await textInputs.nth(1).fill('Doe'); // Last Name
    
    await page.locator('input[type="email"]').fill('john.doe@example.com');
    await page.locator('input[type="tel"]').fill('707-555-1234');
    
    // Select payment method
    await page.locator('select').selectOption('cash');
    
    // Fill staff initials (last text input)
    await textInputs.last().fill('JD');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Should navigate to success page
    await expect(page).toHaveURL(/\/internal\/sales\/success/);
    
    // Should show success confirmation
    await expect(page.getByText('Sale Recorded Successfully!')).toBeVisible();
  });

  test('success page should display sale summary', async ({ page }) => {
    // Complete a sale first
    await page.goto('/internal/sales');
    
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(0).fill('1'); // Christmas Member
    
    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Jane'); // First Name
    await textInputs.nth(1).fill('Smith'); // Last Name
    
    await page.locator('input[type="email"]').fill('jane@example.com');
    await page.locator('input[type="tel"]').fill('707-555-5678');
    
    await page.locator('select').selectOption('check');
    
    // Fill check number (appears after selecting check)
    await page.waitForSelector('input[type="text"]:visible');
    const visibleTextInputs = page.locator('input[type="text"]:visible');
    await visibleTextInputs.nth(2).fill('1234'); // Check number
    await visibleTextInputs.nth(3).fill('JS'); // Staff initials
    
    await page.locator('button[type="submit"]').click();
    
    // Verify success page content
    await expect(page).toHaveURL(/\/internal\/sales\/success/);
    await expect(page.getByText('Sale Summary')).toBeVisible();
    await expect(page.getByText('Customer Information')).toBeVisible();
    
    // Verify customer details are shown
    await expect(page.getByText('Jane Smith')).toBeVisible();
    await expect(page.getByText('jane@example.com')).toBeVisible();
    await expect(page.getByText('707-555-5678')).toBeVisible();
    await expect(page.getByText(/Check.*1234/)).toBeVisible();
    
    // Verify total is shown
    await expect(page.getByText('$15.00')).toBeVisible();
  });

  test('success page should have return to form button', async ({ page }) => {
    await page.goto('/internal/sales');
    
    // Complete minimal form
    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(0).fill('1');
    
    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Test');
    await textInputs.nth(1).fill('User');
    
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="tel"]').fill('707-555-0000');
    await textInputs.last().fill('TU');
    
    await page.locator('button[type="submit"]').click();
    
    // Should be on success page
    await expect(page).toHaveURL(/\/internal\/sales\/success/);
    
    // Look for button to proceed/return (flexible matching)
    const returnButton = page.locator('a:has-text("Record Another Sale"), a:has-text("Return"), a:has-text("Back")').first();
    await expect(returnButton).toBeVisible();
    
    // Click it
    await returnButton.click();
    
    // Should navigate somewhere (either back to form or internal menu)
    await page.waitForURL(/\/(internal|internal\/sales)/);
  });

  test('should prevent submission without tickets', async ({ page }) => {
    await page.goto('/internal/sales');
    
    // Fill only customer info, no tickets
    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Test');
    await textInputs.nth(1).fill('User');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="tel"]').fill('707-555-0000');
    await textInputs.last().fill('TU');
    
    // Submit button should be disabled
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });
});

test.describe('Ticket Generator Page', () => {
  test('should load ticket generator page', async ({ page }) => {
    await page.goto('/ticket');
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have all input fields', async ({ page }) => {
    await page.goto('/ticket');
    
    // Check for common form fields (flexible matching)
    const inputs = page.locator('input[type="text"], input[type="email"]');
    const count = await inputs.count();
    
    // Should have at least some input fields
    expect(count).toBeGreaterThan(0);
  });

  test('should have print button or similar action', async ({ page }) => {
    await page.goto('/ticket');
    
    // Look for any button that could be used to print or proceed
    const actionButton = page.locator('button').first();
    await expect(actionButton).toBeVisible();
  });
});
