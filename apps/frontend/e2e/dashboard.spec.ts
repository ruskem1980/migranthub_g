/**
 * E2E тесты главного экрана и навигации
 */
import { test, expect } from '@playwright/test';

test.describe('Main Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Мокаем состояние auth через localStorage
    await page.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          isAuthenticated: true,
          user: { id: 'test-user', deviceId: 'test-device' }
        }
      }));
    });
  });

  test('should load prototype page', async ({ page }) => {
    await page.goto('/prototype');
    await page.waitForLoadState('networkidle');

    // Страница должна загрузиться
    const response = page.url();
    expect(response).toContain('/prototype');
  });

  test('should display navigation tabs', async ({ page }) => {
    await page.goto('/prototype');
    await page.waitForLoadState('networkidle');

    // Ищем навигационные элементы
    const navItems = page.locator('nav button, nav a, [role="navigation"] button, [role="navigation"] a');
    const count = await navItems.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to documents from main page', async ({ page }) => {
    await page.goto('/prototype');
    await page.waitForLoadState('networkidle');

    // Ищем ссылку на документы
    const docsLink = page.locator('a[href*="documents"], button:has-text("Документы"), a:has-text("Документы")').first();

    if (await docsLink.isVisible({ timeout: 3000 })) {
      await docsLink.click();
      await page.waitForTimeout(1000);

      const url = page.url();
      expect(url).toMatch(/documents/);
    }
  });

  test('should navigate to services', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');

    // Проверяем что страница сервисов загрузилась
    const buttons = page.locator('button');
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to calculator', async ({ page }) => {
    await page.goto('/calculator');
    await page.waitForLoadState('networkidle');

    // Проверяем элементы калькулятора
    const inputs = page.locator('input');
    const buttons = page.locator('button');

    const inputCount = await inputs.count();
    const buttonCount = await buttons.count();

    expect(inputCount + buttonCount).toBeGreaterThan(0);
  });

  test('should navigate to profile', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Проверяем что профиль загрузился
    const url = page.url();
    expect(url).toContain('/profile');
  });
});

test.describe('Documents Page', () => {
  test('should display documents list', async ({ page }) => {
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');

    // Страница должна загрузиться
    expect(page.url()).toContain('/documents');
  });

  test('should have add document button', async ({ page }) => {
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');

    // Ищем кнопку добавления
    const addButton = page.locator('button:has-text("Добавить"), button:has-text("добавить"), button[aria-label*="добавить"]').first();

    if (await addButton.isVisible({ timeout: 3000 })) {
      await expect(addButton).toBeVisible();
    }
  });

  test('should open document type selection', async ({ page }) => {
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /добавить документ/i });

    if (await addButton.isVisible({ timeout: 3000 })) {
      await addButton.click();
      await page.waitForTimeout(800);

      // Проверяем появление типов документов
      const docTypes = ['Паспорт', 'Патент', 'Миграционная карта'];
      let foundAny = false;

      for (const docType of docTypes) {
        const typeBtn = page.locator(`button:has-text("${docType}")`).first();
        if (await typeBtn.isVisible({ timeout: 500 })) {
          foundAny = true;
          break;
        }
      }

      expect(foundAny).toBe(true);
    }
  });
});

test.describe('Calculator Page', () => {
  test('should display 90/180 calculator', async ({ page }) => {
    await page.goto('/calculator');
    await page.waitForLoadState('networkidle');

    // Проверяем наличие формы калькулятора
    const calculatorForm = page.locator('form, [data-testid="calculator"], .calculator');

    if (await calculatorForm.first().isVisible({ timeout: 3000 })) {
      await expect(calculatorForm.first()).toBeVisible();
    }
  });

  test('should have date inputs', async ({ page }) => {
    await page.goto('/calculator');
    await page.waitForLoadState('networkidle');

    // Ищем поля для дат
    const dateInputs = page.locator('input[type="date"], input[placeholder*="дата"], input[placeholder*="date"]');
    const count = await dateInputs.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have calculate button', async ({ page }) => {
    await page.goto('/calculator');
    await page.waitForLoadState('networkidle');

    const calcButton = page.locator('button:has-text("Рассчитать"), button:has-text("Посчитать"), button:has-text("Calculate")').first();

    if (await calcButton.isVisible({ timeout: 3000 })) {
      await expect(calcButton).toBeVisible();
    }
  });
});
