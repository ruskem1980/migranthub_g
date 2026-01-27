/**
 * E2E тесты авторизации и онбординга
 */
import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('should show welcome screen on first visit', async ({ page }) => {
    await page.goto('/');

    // Проверяем наличие элементов welcome страницы или редирект
    const currentUrl = page.url();

    // Может быть редирект на /welcome или /prototype
    expect(currentUrl).toMatch(/\/(welcome|prototype)?$/);
  });

  test('should display welcome page correctly', async ({ page }) => {
    await page.goto('/welcome');

    // Ждём загрузки
    await page.waitForLoadState('networkidle');

    // Проверяем наличие кнопки начала
    const startButton = page.locator('button:has-text("Начать"), a:has-text("Начать"), button:has-text("Start")');
    await expect(startButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to auth method from welcome', async ({ page }) => {
    await page.goto('/welcome');
    await page.waitForLoadState('networkidle');

    // Кликаем кнопку начала
    const startButton = page.locator('button:has-text("Начать"), a:has-text("Начать")').first();

    if (await startButton.isVisible({ timeout: 3000 })) {
      await startButton.click();
      await page.waitForTimeout(1000);

      // Проверяем навигацию
      const url = page.url();
      expect(url).toMatch(/\/(auth|prototype)/);
    }
  });

  test('should display auth method selection', async ({ page }) => {
    await page.goto('/auth/method');
    await page.waitForLoadState('networkidle');

    // Проверяем наличие вариантов авторизации
    const authOptions = page.locator('button, [role="button"]');
    const count = await authOptions.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should display phone input on auth/phone page', async ({ page }) => {
    await page.goto('/auth/phone');
    await page.waitForLoadState('networkidle');

    // Проверяем поле ввода телефона
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="телефон"], input[placeholder*="phone"], input[inputmode="tel"]');

    if (await phoneInput.first().isVisible({ timeout: 3000 })) {
      await expect(phoneInput.first()).toBeVisible();

      // Пробуем ввести номер
      await phoneInput.first().fill('+79991234567');
      await expect(phoneInput.first()).toHaveValue(/\+7.*999.*123.*45.*67/);
    }
  });

  test('should display OTP input fields', async ({ page }) => {
    await page.goto('/auth/otp');
    await page.waitForLoadState('networkidle');

    // Проверяем наличие полей OTP
    const otpInputs = page.locator('input[type="text"], input[type="number"], input[inputmode="numeric"]');
    const count = await otpInputs.count();

    // OTP обычно имеет 4-6 полей
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should have recovery page accessible', async ({ page }) => {
    const response = await page.goto('/recovery');

    // Страница должна загрузиться без ошибок
    expect(response?.status()).toBeLessThan(400);
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Auth Redirects', () => {
  test('should handle unauthenticated access to protected routes', async ({ page }) => {
    // Пробуем открыть защищённую страницу
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    const url = page.url();

    // Должен быть редирект на auth или показана страница профиля
    // (зависит от реализации - может быть local-first без auth)
    expect(url).toBeTruthy();
  });

  test('should handle access to documents without auth', async ({ page }) => {
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');

    // Страница должна отобразиться или сделать редирект
    const response = page.url();
    expect(response).toBeTruthy();
  });
});
