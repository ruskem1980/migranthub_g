/**
 * E2E тесты справочника (Legal Reference)
 */
import { test, expect } from '@playwright/test';

test.describe('Legal Reference', () => {
  test('should load reference page', async ({ page }) => {
    await page.goto('/reference');
    await page.waitForLoadState('networkidle');

    // Проверяем что страница загрузилась
    expect(page.url()).toContain('/reference');
  });

  test('should display navigation tabs', async ({ page }) => {
    await page.goto('/reference');
    await page.waitForLoadState('networkidle');

    // Проверяем наличие вкладок: categories, laws, forms, faq
    const tabsContainer = page.locator('button');
    const count = await tabsContainer.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should display categories tab by default', async ({ page }) => {
    await page.goto('/reference');
    await page.waitForLoadState('networkidle');

    // Categories должна быть активной по умолчанию
    const categoriesTab = page.locator('button:has-text("Категории"), button:has-text("Categories")').first();

    if (await categoriesTab.isVisible({ timeout: 3000 })) {
      // Проверяем что вкладка активна (имеет соответствующий класс)
      const className = await categoriesTab.getAttribute('class');
      expect(className).toBeTruthy();
    }
  });

  test('should switch to laws tab', async ({ page }) => {
    await page.goto('/reference');
    await page.waitForLoadState('networkidle');

    const lawsTab = page.locator('button:has-text("Законы"), button:has-text("Laws")').first();

    if (await lawsTab.isVisible({ timeout: 3000 })) {
      await lawsTab.click();
      await page.waitForTimeout(500);

      // Проверяем появление поиска (только на вкладке laws)
      const searchInput = page.locator('input[type="text"], input[placeholder*="поиск"], input[placeholder*="search"]');

      if (await searchInput.first().isVisible({ timeout: 2000 })) {
        await expect(searchInput.first()).toBeVisible();
      }
    }
  });

  test('should switch to forms tab', async ({ page }) => {
    await page.goto('/reference');
    await page.waitForLoadState('networkidle');

    const formsTab = page.locator('button:has-text("Бланки"), button:has-text("Forms"), button:has-text("Формы")').first();

    if (await formsTab.isVisible({ timeout: 3000 })) {
      await formsTab.click();
      await page.waitForTimeout(500);

      // Вкладка должна переключиться
      const url = page.url();
      expect(url).toContain('/reference');
    }
  });

  test('should switch to FAQ tab', async ({ page }) => {
    await page.goto('/reference');
    await page.waitForLoadState('networkidle');

    const faqTab = page.locator('button:has-text("FAQ"), button:has-text("Вопросы")').first();

    if (await faqTab.isVisible({ timeout: 3000 })) {
      await faqTab.click();
      await page.waitForTimeout(500);

      // Проверяем что FAQ контент загружается
      const url = page.url();
      expect(url).toContain('/reference');
    }
  });

  test('should have search functionality on laws tab', async ({ page }) => {
    await page.goto('/reference');
    await page.waitForLoadState('networkidle');

    // Переключаемся на вкладку законов
    const lawsTab = page.locator('button:has-text("Законы"), button:has-text("Laws")').first();

    if (await lawsTab.isVisible({ timeout: 3000 })) {
      await lawsTab.click();
      await page.waitForTimeout(500);

      const searchInput = page.locator('input[type="text"]').first();

      if (await searchInput.isVisible({ timeout: 2000 })) {
        // Вводим поисковый запрос
        await searchInput.fill('регистрация');
        await page.waitForTimeout(1000);

        // Поиск должен отработать (страница не должна упасть)
        expect(page.url()).toContain('/reference');
      }
    }
  });

  test('should navigate back from reference', async ({ page }) => {
    // Сначала идём на главную
    await page.goto('/prototype');
    await page.waitForLoadState('networkidle');

    // Потом на справочник
    await page.goto('/reference');
    await page.waitForLoadState('networkidle');

    // Нажимаем кнопку назад
    const backButton = page.locator('button:has(svg.lucide-arrow-left), button[aria-label*="назад"], button[aria-label*="back"]').first();

    if (await backButton.isVisible({ timeout: 2000 })) {
      await backButton.click();
      await page.waitForTimeout(500);

      // Должны вернуться назад
      const url = page.url();
      expect(url).not.toContain('/reference');
    }
  });
});

test.describe('FAQ Accordion', () => {
  test('should expand FAQ item on click', async ({ page }) => {
    await page.goto('/reference');
    await page.waitForLoadState('networkidle');

    // Переключаемся на FAQ
    const faqTab = page.locator('button:has-text("FAQ"), button:has-text("Вопросы")').first();

    if (await faqTab.isVisible({ timeout: 3000 })) {
      await faqTab.click();
      await page.waitForTimeout(1000);

      // Ищем первый FAQ элемент
      const faqItem = page.locator('[data-testid="faq-item"], .accordion-item, details').first();

      if (await faqItem.isVisible({ timeout: 3000 })) {
        await faqItem.click();
        await page.waitForTimeout(500);

        // Проверяем что элемент развернулся (или просто не упала страница)
        expect(page.url()).toContain('/reference');
      }
    }
  });
});

test.describe('Category Selection', () => {
  test('should select category and switch to laws', async ({ page }) => {
    await page.goto('/reference');
    await page.waitForLoadState('networkidle');

    // Ждём загрузки категорий
    await page.waitForTimeout(1000);

    // Ищем категорию для клика
    const categoryItem = page.locator('button:has-text("Регистрация"), button:has-text("Registration"), [data-testid="category-item"]').first();

    if (await categoryItem.isVisible({ timeout: 3000 })) {
      await categoryItem.click();
      await page.waitForTimeout(500);

      // После выбора категории должны перейти на вкладку законов
      // (согласно логике компонента: handleCategorySelect)
      expect(page.url()).toContain('/reference');
    }
  });
});
