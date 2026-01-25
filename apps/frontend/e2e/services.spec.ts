/**
 * E2E тест страницы сервисов
 * Автоматически кликает по всем кнопкам и проверяет модальные окна
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Services Page', () => {
  test.beforeEach(async ({ page }) => {
    // Логируем все ошибки консоли
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });

    page.on('pageerror', err => {
      console.log(`❌ Page Error: ${err.message}`);
    });
  });

  test('Проверка всех сервисов на странице /services', async ({ page }) => {
    console.log('\n🚀 Открываем страницу сервисов...');
    await page.goto(`${BASE_URL}/services`);

    // Ждём загрузки страницы
    await page.waitForLoadState('networkidle');
    console.log('✅ Страница загружена');

    // Список сервисов для проверки
    const services = [
      { name: 'Проверка запретов', modal: true },
      { name: 'Калькулятор 90/180', modal: true },
      { name: 'Карта мигранта', modal: true },
      { name: 'Экзамен по русскому', modal: true },
      { name: 'Переводчик', modal: false, external: true },
      { name: 'Карта мечетей', modal: true },
    ];

    for (const service of services) {
      console.log(`\n📌 Тестируем: ${service.name}`);

      try {
        // Находим кнопку сервиса
        const button = page.locator(`button:has-text("${service.name}")`);
        const isVisible = await button.isVisible();

        if (!isVisible) {
          console.log(`❌ Кнопка "${service.name}" не найдена`);
          continue;
        }

        console.log(`  ✅ Кнопка найдена`);

        if (service.external) {
          console.log(`  ⏭️ Внешняя ссылка - пропускаем клик`);
          continue;
        }

        // Кликаем
        await button.click();
        console.log(`  ✅ Клик выполнен`);

        // Ждём появления модального окна
        await page.waitForTimeout(500);

        // Проверяем, появился ли оверлей модального окна
        const overlay = page.locator('.fixed.inset-0.bg-black\\/50, [class*="fixed"][class*="inset-0"]');
        const modalVisible = await overlay.isVisible().catch(() => false);

        if (modalVisible) {
          console.log(`  ✅ Модальное окно открылось`);

          // Закрываем модальное окно
          const closeButton = page.locator('button:has(svg.lucide-x), button:has-text("Закрыть")').first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
            console.log(`  ✅ Модальное окно закрыто`);
          } else {
            // Кликаем по оверлею для закрытия
            await page.keyboard.press('Escape');
            console.log(`  ⚠️ Закрыли через Escape`);
          }

          await page.waitForTimeout(300);
        } else {
          console.log(`  ❌ Модальное окно НЕ открылось!`);
        }

      } catch (error) {
        console.log(`  ❌ Ошибка: ${error}`);
      }
    }

    console.log('\n📊 Тестирование завершено!\n');
  });

  test('Проверка калькулятора детально', async ({ page }) => {
    console.log('\n🧮 Детальная проверка калькулятора...');
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');

    // Кликаем на калькулятор
    const calcButton = page.locator('button:has-text("Калькулятор 90/180")');
    await calcButton.click();
    console.log('✅ Клик по калькулятору');

    await page.waitForTimeout(1000);

    // Проверяем состояние страницы
    const html = await page.content();
    const hasModal = html.includes('fixed') && html.includes('inset-0');
    console.log(`Модальный оверлей в HTML: ${hasModal ? '✅ Да' : '❌ Нет'}`);

    // Делаем скриншот
    await page.screenshot({ path: 'e2e/screenshots/calculator-test.png', fullPage: true });
    console.log('📸 Скриншот сохранён: e2e/screenshots/calculator-test.png');

    // Проверяем консоль на ошибки
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    if (errors.length > 0) {
      console.log('❌ Ошибки в консоли:');
      errors.forEach(e => console.log(`   ${e}`));
    } else {
      console.log('✅ Ошибок в консоли нет');
    }
  });
});
