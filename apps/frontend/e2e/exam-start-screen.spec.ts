/**
 * Тест начального экрана тренажера
 */
import { test, expect } from '@playwright/test';

test.describe('Тренажер - начальный экран', () => {
  test('Показывает начальный экран с выбором категории', async ({ page }) => {
    console.log('\n🧪 Тест начального экрана тренажера\n');

    await page.goto('http://localhost:3000/services');
    await page.waitForLoadState('networkidle');

    // Кликаем на "Экзамен по русскому"
    const examBtn = page.locator('button').filter({ hasText: 'Экзамен по русскому' });
    await examBtn.click();
    await page.waitForTimeout(500);

    // Проверяем что модальное окно открылось
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    console.log('✅ Модальное окно открылось');

    // Проверяем наличие начального экрана
    const startScreen = page.locator('text=Подготовьтесь к экзамену');
    const isStartScreen = await startScreen.isVisible().catch(() => false);
    console.log(`Начальный экран: ${isStartScreen ? '✅ Да' : '❌ Нет'}`);

    // Проверяем элементы начального экрана
    const elements = {
      'Описание теста': await page.locator('text=Подготовьтесь к экзамену').isVisible().catch(() => false),
      'Проходной балл 70%': await page.locator('text=70%').isVisible().catch(() => false),
      'Время ~5 мин': await page.locator('text=~5 мин').isVisible().catch(() => false),
      'Выбор категории': await page.locator('text=Выберите категорию').isVisible().catch(() => false),
      'Категория "Все вопросы"': await page.locator('button:has-text("Все вопросы")').isVisible().catch(() => false),
      'Категория "Русский язык"': await page.locator('button:has-text("Русский язык")').isVisible().catch(() => false),
      'Категория "История России"': await page.locator('button:has-text("История России")').isVisible().catch(() => false),
      'Кнопка "Начать тест"': await page.locator('button:has-text("Начать тест")').isVisible().catch(() => false),
    };

    console.log('\n📋 Элементы начального экрана:');
    for (const [name, exists] of Object.entries(elements)) {
      console.log(`   ${exists ? '✅' : '❌'} ${name}`);
    }

    await page.screenshot({ path: 'e2e/screenshots/exam-start-screen.png' });
    console.log('\n📸 Скриншот: exam-start-screen.png');

    // Проверяем что вопрос НЕ показывается сразу
    const questionVisible = await page.locator('text=Вопрос 1 из').isVisible().catch(() => false);
    console.log(`\n❓ Вопрос показывается сразу: ${questionVisible ? '❌ Да (ошибка!)' : '✅ Нет (правильно)'}`);

    // Кликаем "Начать тест"
    console.log('\n📍 Кликаем "Начать тест"...');
    await page.locator('button:has-text("Начать тест")').click();
    await page.waitForTimeout(500);

    // Теперь вопрос должен показаться
    const questionAfterStart = await page.locator('text=Вопрос 1 из').isVisible().catch(() => false);
    console.log(`❓ Вопрос после клика: ${questionAfterStart ? '✅ Да' : '❌ Нет'}`);

    await page.screenshot({ path: 'e2e/screenshots/exam-after-start.png' });
    console.log('📸 Скриншот: exam-after-start.png');

    // Итог
    const allElementsPresent = Object.values(elements).every(v => v);
    const startScreenWorks = isStartScreen && !questionVisible && questionAfterStart;

    console.log('\n' + '='.repeat(50));
    console.log(`📊 ИТОГ: ${allElementsPresent && startScreenWorks ? '✅ ВСЁ РАБОТАЕТ' : '❌ ЕСТЬ ПРОБЛЕМЫ'}`);
    console.log('='.repeat(50));

    expect(allElementsPresent).toBe(true);
    expect(startScreenWorks).toBe(true);
  });

  test('Выбор категории "Русский язык"', async ({ page }) => {
    console.log('\n🧪 Тест выбора категории\n');

    await page.goto('http://localhost:3000/services');
    await page.waitForLoadState('networkidle');

    await page.locator('button').filter({ hasText: 'Экзамен по русскому' }).click();
    await page.waitForTimeout(500);

    // Выбираем "Русский язык"
    await page.locator('button:has-text("Русский язык")').click();
    console.log('✅ Выбрана категория "Русский язык"');

    // Начинаем тест
    await page.locator('button:has-text("Начать тест")').click();
    await page.waitForTimeout(500);

    // Проверяем что показывается метка категории
    const categoryLabel = await page.locator('text=Русский язык').first().isVisible();
    console.log(`Метка категории: ${categoryLabel ? '✅ Видна' : '❌ Не видна'}`);

    await page.screenshot({ path: 'e2e/screenshots/exam-russian-category.png' });

    expect(categoryLabel).toBe(true);
  });
});
