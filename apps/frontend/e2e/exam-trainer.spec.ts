/**
 * Детальный E2E тест для тренажера по русскому языку
 * Проверяет все кнопки и функции с полным логированием
 */
import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  error?: string;
  details?: string;
}

const results: TestResult[] = [];
const consoleErrors: string[] = [];

function logResult(name: string, status: 'passed' | 'failed' | 'skipped', details?: string, error?: string) {
  const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
  console.log(`${icon} ${name}${details ? ` - ${details}` : ''}`);
  if (error) console.log(`   Ошибка: ${error}`);
  results.push({ name, status, details, error });
}

async function setupConsoleLogs(page: Page) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      consoleErrors.push(text);
      console.log(`🔴 Console Error: ${text}`);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.log(`🔴 Page Error: ${err.message}`);
  });
}

test.describe('Exam Trainer (Тренажер по русскому)', () => {
  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    await setupConsoleLogs(page);
  });

  test('1. Путь к тренажеру: Сервисы -> Другие -> Экзамен', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 ТЕСТ 1: Путь к тренажеру по русскому');
    console.log('='.repeat(60));

    // Шаг 1: Открытие страницы сервисов
    console.log('\n📍 Шаг 1: Открытие /services');
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');

    const pageLoaded = await page.locator('h1').first().isVisible();
    logResult('Страница /services загружена', pageLoaded ? 'passed' : 'failed');
    await page.screenshot({ path: 'e2e/screenshots/exam-01-services-page.png' });

    // Шаг 2: Поиск кнопки "Другие сервисы"
    console.log('\n📍 Шаг 2: Поиск кнопки "Другие сервисы"');

    // Ищем все кнопки и логируем их
    const allButtons = await page.locator('button').all();
    console.log(`   Найдено кнопок на странице: ${allButtons.length}`);

    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      console.log(`   [${i}] Кнопка: "${text?.trim().substring(0, 50)}"`);
    }

    // Ищем кнопку "Другие" или с иконкой Grid
    const otherButton = page.locator('button').filter({ hasText: /другие|other|ещё/i }).first();
    const otherButtonExists = await otherButton.count() > 0;

    if (!otherButtonExists) {
      // Пробуем найти по тексту "6 сервисов" или Grid3x3
      const gridButton = page.locator('button:has-text("6"), button:has-text("сервисов")').first();
      const gridExists = await gridButton.count() > 0;
      logResult('Кнопка "Другие сервисы"', gridExists ? 'passed' : 'failed',
        gridExists ? 'Найдена по тексту "6 сервисов"' : 'НЕ НАЙДЕНА');

      if (!gridExists) {
        await page.screenshot({ path: 'e2e/screenshots/exam-02-no-other-button.png' });
        return;
      }

      await gridButton.click();
    } else {
      logResult('Кнопка "Другие сервисы"', 'passed', 'Найдена');
      await otherButton.click();
    }

    console.log('   ▶️ Клик по кнопке "Другие сервисы"');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e/screenshots/exam-03-after-other-click.png' });

    // Шаг 3: Проверка модального окна "Другие сервисы"
    console.log('\n📍 Шаг 3: Проверка модального окна');
    const modalOverlay = page.locator('.fixed.inset-0.bg-black\\/50, [class*="fixed"][class*="inset-0"][class*="bg-black"]');
    const modalVisible = await modalOverlay.isVisible().catch(() => false);
    logResult('Модальное окно "Другие сервисы"', modalVisible ? 'passed' : 'failed');

    if (!modalVisible) {
      console.log('   ⚠️ Модальное окно не открылось. Проверяем состояние страницы...');
      const html = await page.content();
      console.log(`   HTML содержит "fixed": ${html.includes('fixed')}`);
      console.log(`   HTML содержит "bg-black": ${html.includes('bg-black')}`);
      await page.screenshot({ path: 'e2e/screenshots/exam-04-modal-not-opened.png' });
    }

    // Шаг 4: Поиск кнопки "Экзамен" / "Тренажер"
    console.log('\n📍 Шаг 4: Поиск кнопки "Экзамен"');

    // Ищем все кнопки в модальном окне
    const modalButtons = await page.locator('.fixed button, [role="dialog"] button').all();
    console.log(`   Кнопок в модальном окне: ${modalButtons.length}`);

    for (let i = 0; i < modalButtons.length; i++) {
      const text = await modalButtons[i].textContent();
      console.log(`   [${i}] "${text?.trim().substring(0, 50)}"`);
    }

    const examButton = page.locator('button').filter({ hasText: /экзамен|тренажер|русский|exam/i }).first();
    const examButtonExists = await examButton.count() > 0;
    logResult('Кнопка "Экзамен"', examButtonExists ? 'passed' : 'failed');

    if (!examButtonExists) {
      console.log('   ❌ Кнопка "Экзамен" не найдена!');
      await page.screenshot({ path: 'e2e/screenshots/exam-05-no-exam-button.png' });
      return;
    }

    // Шаг 5: Клик по кнопке "Экзамен"
    console.log('\n📍 Шаг 5: Клик по кнопке "Экзамен"');

    // Проверяем что кнопка кликабельна
    const isEnabled = await examButton.isEnabled();
    const isVisible = await examButton.isVisible();
    console.log(`   Кнопка видима: ${isVisible}`);
    console.log(`   Кнопка активна: ${isEnabled}`);

    if (isEnabled && isVisible) {
      try {
        await examButton.click({ timeout: 5000 });
        logResult('Клик по кнопке "Экзамен"', 'passed');
      } catch (e) {
        logResult('Клик по кнопке "Экзамен"', 'failed', undefined, String(e));
        await page.screenshot({ path: 'e2e/screenshots/exam-06-click-failed.png' });
        return;
      }
    } else {
      logResult('Клик по кнопке "Экзамен"', 'failed', 'Кнопка недоступна');
      return;
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e/screenshots/exam-07-after-exam-click.png' });

    // Шаг 6: Проверка открытия тренажера
    console.log('\n📍 Шаг 6: Проверка открытия тренажера');

    const trainerModal = page.locator('[role="dialog"], .fixed.inset-0');
    const trainerTitle = page.locator('h2:has-text("Тренажёр"), h2:has-text("экзамен"), #modal-title-exam-trainer');

    const trainerVisible = await trainerTitle.isVisible().catch(() => false);
    logResult('Тренажер открылся', trainerVisible ? 'passed' : 'failed');

    if (!trainerVisible) {
      console.log('   ❌ Тренажер НЕ открылся!');
      const pageHtml = await page.content();
      console.log(`   Страница содержит "Тренажёр": ${pageHtml.includes('Тренажёр')}`);
      console.log(`   Страница содержит "Вопрос": ${pageHtml.includes('Вопрос')}`);
      await page.screenshot({ path: 'e2e/screenshots/exam-08-trainer-not-opened.png' });
    }

    // Финальный отчет
    console.log('\n' + '='.repeat(60));
    console.log('📊 ИТОГОВЫЙ ОТЧЕТ ТЕСТА 1');
    console.log('='.repeat(60));
    console.log(`Всего проверок: ${results.length}`);
    console.log(`Успешно: ${results.filter(r => r.status === 'passed').length}`);
    console.log(`Провалено: ${results.filter(r => r.status === 'failed').length}`);
    console.log(`Ошибок консоли: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Ошибки консоли:');
      consoleErrors.forEach(e => console.log(`  - ${e}`));
    }
  });

  test('2. Функциональность тренажера: все кнопки', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 ТЕСТ 2: Функциональность всех кнопок тренажера');
    console.log('='.repeat(60));

    // Переходим сразу к тренажеру (если есть прямой путь)
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');

    // Открываем "Другие сервисы"
    const otherBtn = page.locator('button').filter({ hasText: /другие|6/i }).first();
    if (await otherBtn.count() > 0) {
      await otherBtn.click();
      await page.waitForTimeout(500);
    }

    // Открываем тренажер
    const examBtn = page.locator('button').filter({ hasText: /экзамен|тренажер/i }).first();
    if (await examBtn.count() > 0) {
      await examBtn.click();
      await page.waitForTimeout(1000);
    }

    // Проверяем открылся ли тренажер
    const questionVisible = await page.locator('text=Вопрос').isVisible().catch(() => false);
    if (!questionVisible) {
      console.log('❌ Тренажер не открылся - тест прерван');
      await page.screenshot({ path: 'e2e/screenshots/exam-func-01-not-opened.png' });
      return;
    }

    console.log('✅ Тренажер открылся');
    await page.screenshot({ path: 'e2e/screenshots/exam-func-02-trainer-opened.png' });

    // Тест 2.1: Проверка вариантов ответа
    console.log('\n📍 Тест 2.1: Варианты ответа');
    const answerOptions = page.locator('[class*="rounded-xl"][class*="border-2"]').filter({ hasText: /^[A-DА-Г]/ });
    const optionCount = await answerOptions.count();
    console.log(`   Найдено вариантов ответа: ${optionCount}`);
    logResult('Варианты ответа отображаются', optionCount >= 2 ? 'passed' : 'failed', `${optionCount} вариантов`);

    // Тест 2.2: Клик по варианту ответа
    console.log('\n📍 Тест 2.2: Клик по варианту ответа');
    if (optionCount > 0) {
      const firstOption = answerOptions.first();
      const optionText = await firstOption.textContent();
      console.log(`   Кликаем по: "${optionText?.trim().substring(0, 30)}"`);

      try {
        await firstOption.click();
        logResult('Клик по варианту ответа', 'passed');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'e2e/screenshots/exam-func-03-answer-clicked.png' });

        // Проверяем появление объяснения
        const explanation = page.locator('text=Правильно, text=Объяснение').first();
        const hasExplanation = await explanation.isVisible().catch(() => false);
        logResult('Объяснение появилось', hasExplanation ? 'passed' : 'failed');

      } catch (e) {
        logResult('Клик по варианту ответа', 'failed', undefined, String(e));
      }
    }

    // Тест 2.3: Кнопка "Следующий вопрос"
    console.log('\n📍 Тест 2.3: Кнопка "Следующий вопрос"');
    const nextButton = page.locator('button').filter({ hasText: /следующий|next/i }).first();
    const nextExists = await nextButton.count() > 0;

    if (nextExists) {
      const isEnabled = await nextButton.isEnabled();
      console.log(`   Кнопка найдена: ${nextExists}`);
      console.log(`   Кнопка активна: ${isEnabled}`);

      if (isEnabled) {
        try {
          await nextButton.click();
          logResult('Клик "Следующий вопрос"', 'passed');
          await page.waitForTimeout(500);
          await page.screenshot({ path: 'e2e/screenshots/exam-func-04-next-question.png' });
        } catch (e) {
          logResult('Клик "Следующий вопрос"', 'failed', undefined, String(e));
        }
      } else {
        logResult('Кнопка "Следующий вопрос"', 'failed', 'Кнопка неактивна');
      }
    } else {
      logResult('Кнопка "Следующий вопрос"', 'failed', 'Не найдена');
    }

    // Тест 2.4: Кнопка закрытия (X)
    console.log('\n📍 Тест 2.4: Кнопка закрытия');
    const closeButton = page.locator('button:has(svg.lucide-x), button:has(.lucide-x)').first();
    const closeExists = await closeButton.count() > 0;
    logResult('Кнопка закрытия (X)', closeExists ? 'passed' : 'failed');

    // Финальный отчет
    console.log('\n' + '='.repeat(60));
    console.log('📊 ИТОГОВЫЙ ОТЧЕТ ТЕСТА 2');
    console.log('='.repeat(60));
  });

  test('3. Полный прогон теста (все 10 вопросов)', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 ТЕСТ 3: Полный прогон (10 вопросов)');
    console.log('='.repeat(60));

    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');

    // Открываем тренажер
    const otherBtn = page.locator('button').filter({ hasText: /другие|6/i }).first();
    if (await otherBtn.count() > 0) {
      await otherBtn.click();
      await page.waitForTimeout(500);
    }

    const examBtn = page.locator('button').filter({ hasText: /экзамен|тренажер/i }).first();
    if (await examBtn.count() > 0) {
      await examBtn.click();
      await page.waitForTimeout(1000);
    }

    // Проходим все 10 вопросов
    for (let i = 1; i <= 10; i++) {
      console.log(`\n📍 Вопрос ${i}/10`);

      // Проверяем текущий вопрос
      const questionIndicator = page.locator(`text=Вопрос ${i} из 10`);
      const isCurrentQuestion = await questionIndicator.isVisible().catch(() => false);

      if (!isCurrentQuestion) {
        console.log(`   ⚠️ Индикатор "Вопрос ${i} из 10" не найден`);
      }

      // Выбираем первый вариант ответа
      const answerButtons = page.locator('button[class*="rounded-xl"]').filter({ hasText: /^[A-D]|Москва|Президент|85|Белой/ });
      const firstAnswer = answerButtons.first();

      if (await firstAnswer.count() > 0) {
        try {
          await firstAnswer.click();
          console.log(`   ✅ Ответ выбран`);
          await page.waitForTimeout(300);
        } catch (e) {
          console.log(`   ❌ Ошибка выбора ответа: ${e}`);
          break;
        }
      } else {
        console.log(`   ❌ Варианты ответа не найдены`);
        await page.screenshot({ path: `e2e/screenshots/exam-full-${i}-no-answers.png` });
        break;
      }

      // Кликаем "Следующий" или "Завершить"
      const nextOrFinish = page.locator('button').filter({ hasText: /следующий|завершить/i }).first();
      if (await nextOrFinish.count() > 0) {
        try {
          await nextOrFinish.click();
          console.log(`   ✅ Переход к следующему`);
          await page.waitForTimeout(500);
        } catch (e) {
          console.log(`   ❌ Ошибка перехода: ${e}`);
          break;
        }
      }
    }

    // Проверяем экран результатов
    console.log('\n📍 Проверка экрана результатов');
    await page.waitForTimeout(500);

    const resultsScreen = page.locator('text=Тест завершён, text=из 10');
    const hasResults = await resultsScreen.first().isVisible().catch(() => false);
    logResult('Экран результатов', hasResults ? 'passed' : 'failed');
    await page.screenshot({ path: 'e2e/screenshots/exam-full-results.png' });

    // Проверяем кнопку "Пройти ещё раз"
    const restartButton = page.locator('button').filter({ hasText: /ещё раз|restart/i }).first();
    const hasRestart = await restartButton.count() > 0;
    logResult('Кнопка "Пройти ещё раз"', hasRestart ? 'passed' : 'failed');

    if (hasRestart) {
      await restartButton.click();
      await page.waitForTimeout(500);
      const backToQ1 = await page.locator('text=Вопрос 1 из 10').isVisible().catch(() => false);
      logResult('Рестарт теста', backToQ1 ? 'passed' : 'failed');
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 ИТОГОВЫЙ ОТЧЕТ ТЕСТА 3');
    console.log('='.repeat(60));
  });
});

test.afterAll(() => {
  console.log('\n' + '='.repeat(60));
  console.log('📋 ОБЩИЙ ОТЧЕТ ПО ВСЕМ ТЕСТАМ');
  console.log('='.repeat(60));
  console.log(`Всего проверок: ${results.length}`);
  console.log(`✅ Успешно: ${results.filter(r => r.status === 'passed').length}`);
  console.log(`❌ Провалено: ${results.filter(r => r.status === 'failed').length}`);
  console.log(`⏭️ Пропущено: ${results.filter(r => r.status === 'skipped').length}`);
  console.log(`🔴 Ошибок консоли: ${consoleErrors.length}`);

  console.log('\n📝 Детали проверок:');
  results.forEach(r => {
    const icon = r.status === 'passed' ? '✅' : r.status === 'failed' ? '❌' : '⏭️';
    console.log(`${icon} ${r.name}${r.details ? ` (${r.details})` : ''}${r.error ? ` | Ошибка: ${r.error}` : ''}`);
  });
});