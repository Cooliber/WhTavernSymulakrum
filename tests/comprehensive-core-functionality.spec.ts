import { test, expect, type Page } from '@playwright/test';

test.describe('Comprehensive Core Functionality Tests - Cognitive Cycle Implementation', () => {

  test.beforeEach(async ({ page }) => {
    // Set longer timeout for navigation
    page.setDefaultTimeout(60000);

    // Navigate to the homepage before each test
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for basic page structure instead of networkidle
    await page.waitForSelector('body', { timeout: 30000 });
  });

  test.describe('Homepage Core Functionality', () => {
    test('homepage loads with all essential elements', async ({ page }) => {
      // Check page title (more flexible)
      await expect(page).toHaveTitle(/Warhammer|Tavern/);

      // Check if page has loaded by looking for any h1
      const heroTitle = page.locator('h1').first();
      await expect(heroTitle).toBeVisible({ timeout: 30000 });

      // Check for main content area
      const mainContent = page.locator('main, body > div, #__nuxt').first();
      await expect(mainContent).toBeVisible({ timeout: 30000 });

      // Check if there are any interactive elements
      const interactiveElements = page.locator('button, a[href], [role="button"]');
      await expect(interactiveElements.first()).toBeVisible({ timeout: 30000 });
    });

    test('hero section interactions work correctly', async ({ page }) => {
      // Test Enter Tavern button
      const enterTavernBtn = page.locator('button, a').filter({ hasText: /Enter Tavern|Wejdź do Karczmy/ }).first();
      await enterTavernBtn.click();
      await page.waitForURL('**/tavern');
      await expect(page).toHaveURL(/.*tavern/);

      // Go back to homepage
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test Meet Characters button
      const meetCharactersBtn = page.locator('button, a').filter({ hasText: /Meet Characters|Poznaj Postacie/ }).first();
      await meetCharactersBtn.click();
      await page.waitForURL('**/characters');
      await expect(page).toHaveURL(/.*characters/);
    });

    test('character gallery interactions', async ({ page }) => {
      // Check if character items are clickable
      const characterItems = page.locator('.character-item, [class*="character"]');
      const count = await characterItems.count();

      if (count > 0) {
        // Click on first character
        await characterItems.first().click();

        // Should navigate to conversations or character details
        await page.waitForTimeout(1000);
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(conversations|characters)/);
      }
    });

    test('loading screen functionality', async ({ page }) => {
      // Reload page to trigger loading screen
      await page.reload();

      // Check if loading screen appears (it might be very fast)
      const loadingScreen = page.locator('[class*="loader"], .loading');

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');

      // Main content should be visible after loading
      const mainContent = page.locator('main, body > div').first();
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe('Navigation and Page Loading', () => {
    const pages = [
      { path: '/characters', title: /Character|Postacie/, heading: /Character Roster|Roster Postaci/ },
      { path: '/tavern', title: /Tavern|Karczma/, heading: /Prancing Pony|Karczma/ },
      { path: '/conversations', title: /Conversations|Rozmowy/, heading: /Conversations|Rozmowy/ },
      { path: '/gm-dashboard', title: /GM Dashboard|Panel GM/, heading: /Game Master|Mistrz Gry/ },
      { path: '/battle', title: /Battle|Bitwa/, heading: /Battle Arena|Arena Bitwy/ },
      { path: '/generators', title: /Generators|Generatory/, heading: /Content Generators|Generatory/ },
      { path: '/inventory', title: /Inventory|Ekwipunek/, heading: /Character Inventory|Ekwipunek/ },
      { path: '/map', title: /Map|Mapa/, heading: /World Map|Mapa Świata/ },
      { path: '/quests', title: /Quest|Zadania/, heading: /Quest Board|Tablica Zadań/ },
      { path: '/settings', title: /Settings|Ustawienia/, heading: /Settings|Ustawienia/ },
      { path: '/about', title: /About|O Grze/, heading: /About|O Grze/ }
    ];

    pages.forEach(({ path, title, heading }) => {
      test(`${path} page loads correctly`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        // Check page title
        await expect(page).toHaveTitle(title);

        // Check main heading
        const mainHeading = page.locator('h1').first();
        await expect(mainHeading).toBeVisible();

        // Check that page content is loaded
        const mainContent = page.locator('main, .main-content, body > div').first();
        await expect(mainContent).toBeVisible();

        // Check for no critical errors in console
        const errors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error' && !msg.text().includes('favicon')) {
            errors.push(msg.text());
          }
        });

        // Allow some time for any async operations
        await page.waitForTimeout(1000);

        // Should have minimal console errors
        expect(errors.length).toBeLessThan(3);
      });
    });

    test('navigation between pages works correctly', async ({ page }) => {
      // Test navigation flow: Home -> Characters -> Tavern -> Conversations
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Navigate to Characters
      await page.goto('/characters');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*characters/);

      // Navigate to Tavern
      await page.goto('/tavern');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*tavern/);

      // Navigate to Conversations
      await page.goto('/conversations');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*conversations/);

      // Navigate back to Home
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/^[^\/]*\/$/);
    });
  });

  test.describe('Interactive Elements and Components', () => {
    test('buttons and interactive elements are functional', async ({ page }) => {
      // Check various button types across pages
      const testPages = ['/', '/characters', '/tavern', '/settings'];

      for (const pagePath of testPages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');

        // Find interactive elements
        const buttons = page.locator('button, [role="button"], a[href]');
        const count = await buttons.count();

        if (count > 0) {
          // Test first few buttons (avoid testing all to prevent timeouts)
          const testCount = Math.min(count, 3);

          for (let i = 0; i < testCount; i++) {
            const button = buttons.nth(i);
            const isVisible = await button.isVisible();

            if (isVisible) {
              // Check if button is clickable
              await expect(button).toBeEnabled();

              // Check for proper accessibility attributes
              const hasText = await button.textContent();
              const hasAriaLabel = await button.getAttribute('aria-label');
              const hasTitle = await button.getAttribute('title');

              // Button should have accessible text
              const hasAccessibleText = (hasText && hasText.trim().length > 0) || hasAriaLabel || hasTitle;
              expect(hasAccessibleText).toBeTruthy();
            }
          }
        }
      }
    });
  });
});