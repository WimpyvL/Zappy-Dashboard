// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Comprehensive test suite covering all major user flows and button interactions
 * in the Zappy Dashboard application
 */
test.describe('Zappy Dashboard Complete User Flows', () => {
  // Store state between tests
  let authCookie;
  
  test.beforeEach(async ({ page }) => {
    // Reuse stored auth state if available
    if (authCookie) {
      await page.context().addCookies([authCookie]);
    }
  });
  
  test('Authentication flow: login, dashboard navigation, logout', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    await expect(page).toHaveTitle(/Zappy/);
    
    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Click login and wait for navigation
    await Promise.all([
      page.waitForNavigation(),
      page.click('button:has-text("Sign in")'),
    ]);
    
    // Verify landing on dashboard
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('h1')).toContainText(/Dashboard|Welcome/);
    
    // Store authentication for other tests
    authCookie = (await page.context().cookies()).find(c => c.name === 'authToken' || c.name === 'sb-auth-token');
    
    // Test logout process
    await page.click('[aria-label="User menu"]');
    await page.click('button:has-text("Log out")');
    
    // Verify return to login page
    await expect(page).toHaveURL(/login/);
  });
  
  test('Navigation flow: sidebar navigation to all main sections', async ({ page }) => {
    // Login first (or use stored auth)
    if (!authCookie) {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await Promise.all([
        page.waitForNavigation(),
        page.click('button:has-text("Sign in")'),
      ]);
    } else {
      await page.goto('/dashboard');
    }
    
    // Test navigation to each main section via sidebar
    const navigationItems = [
      { name: 'Dashboard', urlFragment: 'dashboard' },
      { name: 'Patients', urlFragment: 'patients' },
      { name: 'Tasks', urlFragment: 'tasks' },
      { name: 'Calendar', urlFragment: 'calendar' },
      { name: 'Invoices', urlFragment: 'invoices' },
      { name: 'Messages', urlFragment: 'messages' },
      { name: 'Settings', urlFragment: 'settings' },
    ];
    
    for (const item of navigationItems) {
      // Find and click the navigation item
      await page.click(`nav >> text=${item.name}`);
      
      // Verify URL change
      await expect(page).toHaveURL(new RegExp(item.urlFragment, 'i'));
      
      // Verify page content loaded
      await page.waitForSelector('main', { state: 'attached' });
      
      // Take screenshot for verification
      await page.screenshot({ path: `test-results/${item.urlFragment}-page.png` });
    }
  });
  
  test('Patient management flow: view, create, and edit patient records', async ({ page }) => {
    // Navigate to Patients page
    await page.goto('/patients');
    
    // Verify patients page loaded
    await expect(page.locator('h1, h2')).toContainText(/Patients|Patient Management/i);
    
    // Click Add Patient button
    await page.click('button:has-text("Add Patient"), button:has-text("New Patient")');
    
    // Wait for form to appear
    await expect(page.locator('form')).toBeVisible();
    
    // Fill required patient details
    await page.fill('[placeholder*="first name" i], [name="firstName"]', 'John');
    await page.fill('[placeholder*="last name" i], [name="lastName"]', 'Playwright');
    await page.fill('[placeholder*="email" i], [name="email"]', 'john.playwright@example.com');
    await page.fill('[placeholder*="phone" i], [name="phone"]', '5551234567');
    
    // Fill address details if fields exist
    const addressFieldsExist = await page.isVisible('[placeholder*="address" i], [name="address"]');
    if (addressFieldsExist) {
      await page.fill('[placeholder*="address" i], [name="address"]', '123 Test Street');
      await page.fill('[placeholder*="city" i], [name="city"]', 'Testville');
      await page.fill('[placeholder*="zip" i], [name="zip"]', '12345');
      
      // Select state if dropdown exists
      const stateSelectExists = await page.isVisible('select[name="state"]');
      if (stateSelectExists) {
        await page.selectOption('select[name="state"]', 'CA');
      }
    }
    
    // Save patient record
    await Promise.all([
      page.waitForResponse(response => response.url().includes('patients') && response.status() === 200),
      page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]'),
    ]).catch(() => {
      // If waitForResponse fails, just continue (mock data may be used)
      console.log('Continuing without response validation');
    });
    
    // Verify return to patients list
    await page.waitForSelector('table, [role="grid"]');
    
    // Search for the newly created patient
    const searchExists = await page.isVisible('input[placeholder*="search" i]');
    if (searchExists) {
      await page.fill('input[placeholder*="search" i]', 'John Playwright');
      await page.press('input[placeholder*="search" i]', 'Enter');
    }
    
    // Verify patient was added
    await expect(page.locator('table, [role="grid"]')).toContainText(/John Playwright/);
  });
  
  test('Task management flow: create, complete, delete tasks', async ({ page }) => {
    // Navigate to Tasks page
    await page.goto('/tasks');
    
    // Verify tasks page loaded
    await expect(page.locator('h1, h2')).toContainText(/Tasks|Task Management/i);
    
    // Click Add Task button
    await page.click('button:has-text("Add Task"), button:has-text("New Task")');
    
    // Wait for task form to appear
    await expect(page.locator('form, dialog')).toBeVisible();
    
    // Fill task details
    await page.fill('[placeholder*="title" i], [name="title"]', 'Important Test Task');
    
    // Select task priority if dropdown exists
    const prioritySelectExists = await page.isVisible('select[name="priority"]');
    if (prioritySelectExists) {
      await page.selectOption('select[name="priority"]', 'high');
    }
    
    // Add task notes if field exists
    const notesFieldExists = await page.isVisible('[placeholder*="notes" i], [name="notes"]');
    if (notesFieldExists) {
      await page.fill('[placeholder*="notes" i], [name="notes"]', 'This is a test task created by Playwright');
    }
    
    // Set due date if field exists
    const dueDateExists = await page.isVisible('input[type="date"], input[name="dueDate"]');
    if (dueDateExists) {
      // Set to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      await page.fill('input[type="date"], input[name="dueDate"]', dateString);
    }
    
    // Save task
    await Promise.all([
      page.waitForResponse(response => response.url().includes('tasks') && response.status() === 200),
      page.click('button:has-text("Save"), button:has-text("Create"), button[type="submit"]'),
    ]).catch(() => {
      // If waitForResponse fails, just continue (mock data may be used)
      console.log('Continuing without response validation');
    });
    
    // Verify task was added
    await expect(page.locator('table, [role="grid"]')).toContainText(/Important Test Task/);
    
    // Mark task as complete
    await page.check('text=Important Test Task >> xpath=./ancestor::tr//input[@type="checkbox"]');
    
    // Verify task was marked as complete
    await expect(page.locator('text=Important Test Task')).toHaveCSS('text-decoration', /line-through/);
    
    // Delete the task
    await page.click('text=Important Test Task >> xpath=./ancestor::tr//button[contains(@aria-label, "Delete") or contains(@title, "Delete")]');
    
    // Confirm deletion if confirmation dialog appears
    const confirmDeleteVisible = await page.isVisible('button:has-text("Confirm"), button:has-text("Yes")');
    if (confirmDeleteVisible) {
      await page.click('button:has-text("Confirm"), button:has-text("Yes")');
    }
    
    // Verify task was removed
    await expect(page.locator('table, [role="grid"]')).not.toContainText(/Important Test Task/);
  });
  
  test('Form submission flow: patient intake form', async ({ page }) => {
    // Navigate to Forms section (path may vary)
    await page.goto('/forms');
    
    // If forms page doesn't exist, try patients section
    if (!(await page.isVisible('h1, h2'))) {
      await page.goto('/patients');
      
      // Look for forms tab or button
      const formsTabExists = await page.isVisible('button:has-text("Forms")');
      if (formsTabExists) {
        await page.click('button:has-text("Forms")');
      }
    }
    
    // Verify forms page or section loaded
    await page.waitForSelector('main', { state: 'attached' });
    
    // Click to add new form or open existing form template
    const addFormExists = await page.isVisible('button:has-text("New Form"), button:has-text("Add Form")');
    if (addFormExists) {
      await page.click('button:has-text("New Form"), button:has-text("Add Form")');
    } else {
      // Try to open an existing form template
      await page.click('text="Patient Intake Form"');
    }
    
    // Wait for form editor or preview to load
    await page.waitForSelector('form', { state: 'attached' });
    
    // If it's a form editor, add some fields
    const isFormEditor = await page.isVisible('button:has-text("Add Field")');
    if (isFormEditor) {
      await page.click('button:has-text("Add Field")');
      
      // Select field type from dropdown if exists
      const fieldTypeSelectExists = await page.isVisible('select, [role="listbox"]');
      if (fieldTypeSelectExists) {
        await page.selectOption('select', 'text');
      }
      
      // Set field label
      await page.fill('[placeholder*="label" i], [name="label"]', 'Medical History');
      
      // Save field
      await page.click('button:has-text("Add"), button:has-text("Save")');
    }
    
    // If it's a form preview, fill it out
    else {
      // Fill any visible text inputs
      const textInputs = await page.$$('input[type="text"]');
      for (let i = 0; i < textInputs.length; i++) {
        await textInputs[i].fill(`Test answer ${i+1}`);
      }
      
      // Fill any visible textareas
      const textareas = await page.$$('textarea');
      for (let i = 0; i < textareas.length; i++) {
        await textareas[i].fill(`Detailed test answer for question ${i+1}`);
      }
      
      // Check some checkboxes
      const checkboxes = await page.$$('input[type="checkbox"]');
      for (let i = 0; i < Math.min(2, checkboxes.length); i++) {
        await checkboxes[i].check();
      }
      
      // Submit the form
      await page.click('button[type="submit"], button:has-text("Submit")');
      
      // Verify submission feedback
      await expect(page.locator('text=submitted successfully, text=thank you')).toBeVisible();
    }
  });
  
  test('Settings and profile management flow', async ({ page }) => {
    // Navigate to Settings
    await page.goto('/settings');
    
    // Verify settings page loaded
    await expect(page.locator('h1, h2')).toContainText(/Settings|Preferences/i);
    
    // Look for profile section
    await page.click('button:has-text("Profile"), a:has-text("Profile")');
    
    // Wait for profile section to appear
    await expect(page.locator('form')).toBeVisible();
    
    // Update some profile information
    await page.fill('input[name="name"], input[name="full_name"]', 'Playwright Test User');
    
    // Try to update phone if field exists
    const phoneFieldExists = await page.isVisible('input[name="phone"]');
    if (phoneFieldExists) {
      await page.fill('input[name="phone"]', '5559876543');
    }
    
    // Save changes
    await page.click('button:has-text("Save"), button:has-text("Update")');
    
    // Verify success message
    await expect(page.locator('text=saved, text=updated')).toBeVisible();
    
    // Navigate to password change if exists
    const passwordSectionExists = await page.isVisible('button:has-text("Password"), a:has-text("Security")');
    if (passwordSectionExists) {
      await page.click('button:has-text("Password"), a:has-text("Security")');
      
      // Fill password change form
      await page.fill('input[name="currentPassword"]', 'password123');
      await page.fill('input[name="newPassword"]', 'updatedPassword123');
      await page.fill('input[name="confirmPassword"]', 'updatedPassword123');
      
      // Submit form
      await page.click('button:has-text("Change Password"), button:has-text("Update Password")');
      
      // Verify success message
      await expect(page.locator('text=password updated, text=password changed')).toBeVisible();
    }
  });
  
  test('Reports and analytics navigation', async ({ page }) => {
    // Navigate to Reports page if it exists
    await page.goto('/reports');
    
    // Check if reports page exists
    const reportsPageExists = await page.isVisible('h1, h2');
    if (!reportsPageExists) {
      // It might be under Analytics or Dashboard
      await page.goto('/analytics');
      
      // If that doesn't exist either, look for it in the navigation
      if (!(await page.isVisible('h1, h2'))) {
        await page.goto('/dashboard');
        
        // Try to find reports/analytics section
        const reportsLinkExists = await page.isVisible('a:has-text("Reports"), a:has-text("Analytics")');
        if (reportsLinkExists) {
          await page.click('a:has-text("Reports"), a:has-text("Analytics")');
        }
      }
    }
    
    // Verify reports/analytics page loaded
    await page.waitForSelector('main', { state: 'attached' });
    
    // Try to interact with date range selector if exists
    const dateRangeExists = await page.isVisible('[aria-label="Date range"], [placeholder*="date range"]');
    if (dateRangeExists) {
      await page.click('[aria-label="Date range"], [placeholder*="date range"]');
      
      // Try to select a predefined range like "Last 30 days"
      const predefinedRangeExists = await page.isVisible('text="Last 30 days"');
      if (predefinedRangeExists) {
        await page.click('text="Last 30 days"');
      } else {
        // Close the date picker
        await page.press('[aria-label="Date range"]', 'Escape');
      }
    }
    
    // Try to interact with report type selector if exists
    const reportTypeExists = await page.isVisible('select[name="reportType"]');
    if (reportTypeExists) {
      await page.selectOption('select[name="reportType"]', 'revenue');
    }
    
    // Look for any visualization or data table
    const hasVisualization = await page.isVisible('canvas, svg, table');
    expect(hasVisualization).toBeTruthy();
    
    // Screenshot the reports page
    await page.screenshot({ path: 'test-results/reports-page.png' });
  });
});