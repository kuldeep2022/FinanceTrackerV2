import { test, expect } from '@playwright/test';

test.describe('Finance Tracker Core Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear local storage and set the version to CURRENT_VERSION to skip WhatsNewModal
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('flux_whats_new_version', '2.0.0');
    });
    await page.reload();
  });

  test('should add and delete a transaction', async ({ page }) => {
    // Click Add Transaction button (plus icon in header)
    await page.click('header .btn-primary'); 
    
    // Fill in transaction details
    await page.fill('input[placeholder="0.00"]', '50');
    await page.fill('input[placeholder="Rent, Coffee, Bonus..."]', 'Test Expense');
    
    // Ensure it's an expense (the type toggle button)
    const typeToggle = page.locator('button', { hasText: /^expense$/i }).first();
    await typeToggle.click();
    
    // Click Add (the submit button)
    await page.click('button:has-text("Add expense")');
    
    // Verify it appears in the dashboard summary (Total Expenses)
    const expenseCard = page.locator('.glass-card:has-text("Expenses")').first();
    await expect(expenseCard).toContainText('$50');

    // Go to Transactions tab
    await page.click('nav button:has-text("Activity")');
    
    // Check if the transaction is listed
    await expect(page.locator('text=Test Expense')).toBeVisible();
    
    // Delete the transaction
    page.on('dialog', dialog => dialog.accept()); // Handle confirmation
    await page.click('button:has(svg[class*="lucide-trash2"])');
    
    // Verify it's gone
    await expect(page.locator('text=Test Expense')).not.toBeVisible();
    await expect(page.locator('text=No transactions yet')).toBeVisible();
  });

  test('should handle CSV import with sign flipping', async ({ page }) => {
    await page.click('nav button:has-text("Import")');
    
    // Create a mock CSV
    const csvContent = 'Date,Description,Amount\n2026-02-01,Starbucks,15.50\n2026-02-02,Salary,2500.00';
    
    // Upload the mock CSV
    await page.setInputFiles('input[type="file"]', {
      name: 'statement.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    // Now on mapping step
    await page.selectOption('select:near(label:has-text("Date"))', 'Date');
    await page.selectOption('select:near(label:has-text("Title"))', 'Description');
    await page.selectOption('select:near(label:has-text("Amount"))', 'Amount');

    // Verify Flip Signs toggle exists and click it
    const flipToggle = page.locator('text=Flip Transaction Signs');
    await expect(flipToggle).toBeVisible();
    
    // First, check preview WITHOUT flip
    await page.click('button:has-text("Review Transactions")');
    
    // In preview, Starbucks (positive in CSV) should be Income by default (amount > 0)
    // Transaction description is in an input field
    const starbucksInput = page.locator('input[value="Starbucks"]').first();
    await expect(starbucksInput).toBeVisible();
    
    // Go back and flip signs
    await page.click('button:has-text("Back")');
    await page.click('text=Flip Transaction Signs');
    await page.click('button:has-text("Review Transactions")');
    
    // Verify it still exists after flip
    await expect(page.locator('input[value="Starbucks"]').first()).toBeVisible();
  });
});
