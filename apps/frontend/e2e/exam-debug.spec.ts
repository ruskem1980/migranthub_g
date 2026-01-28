/**
 * Детальная диагностика тренажера по русскому
 * Проверяет каждый шаг с максимальным логированием
 */
import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Диагностика тренажера', () => {
  test('Детальный тест кнопки "Экзамен по русскому"', async ({ page }) => {
    const logs: string[] = [];
    const log = (msg: string) => {
      console.log(msg);
      logs.push(msg);
    };

    // Логируем все события консоли
    page.on('console', msg => {
      if (msg.type() === 'error') {
        log(`🔴 Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        log(`🟡 Console Warning: ${msg.text()}`);
      }
    });

    page.on('pageerror', err => {
      log(`🔴 Page Error: ${err.message}`);
    });

    log('\n' + '='.repeat(70));
    log('🔍 ДЕТАЛЬНАЯ ДИАГНОСТИКА: Тренажер по русскому');
    log('='.repeat(70));

    // 1. Открываем страницу
    log('\n📍 ШАГ 1: Открытие страницы /services');
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    log('   ✅ Страница загружена');

    // 2. Делаем скриншот начального состояния
    await page.screenshot({ path: 'e2e/screenshots/debug-01-initial.png', fullPage: true });
    log('   📸 Скриншот: debug-01-initial.png');

    // 3. Анализируем DOM структуру
    log('\n📍 ШАГ 2: Анализ DOM структуры');

    const html = await page.content();
    log(`   HTML длина: ${html.length} символов`);
    log(`   Содержит "Экзамен по русскому": ${html.includes('Экзамен по русскому')}`);
    log(`   Содержит "Тренажёр": ${html.includes('Тренажёр')}`);
    log(`   Содержит "ExamTrainer": ${html.includes('ExamTrainer')}`);
    log(`   Содержит "modal": ${html.includes('modal')}`);

    // 4. Находим все кнопки
    log('\n📍 ШАГ 3: Поиск кнопок');
    const buttons = await page.locator('button').all();
    log(`   Найдено кнопок: ${buttons.length}`);

    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      const text = await btn.textContent() || '';
      const isVisible = await btn.isVisible();
      const isEnabled = await btn.isEnabled();
      const bbox = await btn.boundingBox();

      log(`   [${i}] "${text.trim().substring(0, 40)}..."`);
      log(`       visible: ${isVisible}, enabled: ${isEnabled}`);
      log(`       bbox: ${bbox ? `x=${bbox.x}, y=${bbox.y}, w=${bbox.width}, h=${bbox.height}` : 'null'}`);
    }

    // 5. Находим кнопку экзамена
    log('\n📍 ШАГ 4: Поиск кнопки "Экзамен по русскому"');

    const examButton = page.locator('button').filter({ hasText: 'Экзамен по русскому' });
    const examCount = await examButton.count();
    log(`   Найдено кнопок с текстом "Экзамен по русскому": ${examCount}`);

    if (examCount === 0) {
      log('   ❌ КРИТИЧЕСКАЯ ОШИБКА: Кнопка не найдена!');
      await page.screenshot({ path: 'e2e/screenshots/debug-02-no-button.png', fullPage: true });
      return;
    }

    const examBtn = examButton.first();
    const examVisible = await examBtn.isVisible();
    const examEnabled = await examBtn.isEnabled();
    const examBbox = await examBtn.boundingBox();

    log(`   ✅ Кнопка найдена`);
    log(`   Видима: ${examVisible}`);
    log(`   Активна: ${examEnabled}`);
    log(`   Позиция: ${examBbox ? `x=${examBbox.x}, y=${examBbox.y}` : 'null'}`);
    log(`   Размер: ${examBbox ? `${examBbox.width}x${examBbox.height}` : 'null'}`);

    // 6. Добавляем слушатели событий перед кликом
    log('\n📍 ШАГ 5: Подготовка к клику');

    await page.evaluate(() => {
      const btn = document.querySelector('button[class*="emerald"]') as HTMLElement;
      if (btn) {
        btn.addEventListener('click', () => {
          console.log('[DEBUG] Клик по кнопке сработал!');
        });
        btn.addEventListener('mousedown', () => {
          console.log('[DEBUG] Mousedown сработал!');
        });
        btn.addEventListener('mouseup', () => {
          console.log('[DEBUG] Mouseup сработал!');
        });
      }
    });

    // 7. Проверяем состояние React state перед кликом
    log('\n📍 ШАГ 6: Проверка состояния до клика');

    const stateBeforeClick = await page.evaluate(() => {
      // Проверяем есть ли модальное окно
      const modal = document.querySelector('[role="dialog"]');
      const fixedElements = document.querySelectorAll('.fixed');
      return {
        hasModal: !!modal,
        fixedElementsCount: fixedElements.length,
        bodyOverflow: document.body.style.overflow,
      };
    });

    log(`   Модальное окно до клика: ${stateBeforeClick.hasModal}`);
    log(`   Fixed элементов: ${stateBeforeClick.fixedElementsCount}`);
    log(`   Body overflow: ${stateBeforeClick.bodyOverflow || 'default'}`);

    // 8. Кликаем!
    log('\n📍 ШАГ 7: КЛИК ПО КНОПКЕ');
    await page.screenshot({ path: 'e2e/screenshots/debug-03-before-click.png', fullPage: true });

    try {
      // Используем разные методы клика
      log('   Метод 1: Playwright click()...');
      await examBtn.click({ timeout: 5000 });
      log('   ✅ click() выполнен');
    } catch (e) {
      log(`   ❌ click() ошибка: ${e}`);

      try {
        log('   Метод 2: force click...');
        await examBtn.click({ force: true, timeout: 5000 });
        log('   ✅ force click выполнен');
      } catch (e2) {
        log(`   ❌ force click ошибка: ${e2}`);

        try {
          log('   Метод 3: JavaScript click...');
          await page.evaluate(() => {
            const btn = document.querySelector('button[class*="emerald"]') as HTMLElement;
            if (btn) btn.click();
          });
          log('   ✅ JS click выполнен');
        } catch (e3) {
          log(`   ❌ JS click ошибка: ${e3}`);
        }
      }
    }

    // 9. Ждём реакции
    log('\n📍 ШАГ 8: Ожидание реакции');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e/screenshots/debug-04-after-click.png', fullPage: true });
    log('   📸 Скриншот: debug-04-after-click.png');

    // 10. Проверяем состояние после клика
    log('\n📍 ШАГ 9: Проверка состояния после клика');

    const stateAfterClick = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      const fixedOverlay = document.querySelector('.fixed.inset-0.bg-black\\/50, [class*="fixed"][class*="inset-0"]');
      const trainerHeader = document.querySelector('h2[id="modal-title-exam-trainer"]');
      const questionText = document.body.innerText.includes('Вопрос 1 из');
      const anyQuestion = document.body.innerText.includes('Вопрос');

      return {
        hasModal: !!modal,
        hasFixedOverlay: !!fixedOverlay,
        hasTrainerHeader: !!trainerHeader,
        hasQuestionIndicator: questionText,
        hasAnyQuestion: anyQuestion,
        fixedElements: document.querySelectorAll('.fixed').length,
        visibleText: document.body.innerText.substring(0, 500),
      };
    });

    log(`   Модальное окно (role=dialog): ${stateAfterClick.hasModal}`);
    log(`   Fixed overlay (bg-black/50): ${stateAfterClick.hasFixedOverlay}`);
    log(`   Заголовок тренажера: ${stateAfterClick.hasTrainerHeader}`);
    log(`   Индикатор "Вопрос 1 из": ${stateAfterClick.hasQuestionIndicator}`);
    log(`   Любой текст "Вопрос": ${stateAfterClick.hasAnyQuestion}`);
    log(`   Fixed элементов: ${stateAfterClick.fixedElements}`);

    // 11. Проверяем появление тренажера
    log('\n📍 ШАГ 10: Финальная проверка');

    const trainerOpened = stateAfterClick.hasModal ||
                         stateAfterClick.hasTrainerHeader ||
                         stateAfterClick.hasQuestionIndicator;

    if (trainerOpened) {
      log('   ✅ ТРЕНАЖЕР ОТКРЫЛСЯ!');
    } else {
      log('   ❌ ТРЕНАЖЕР НЕ ОТКРЫЛСЯ!');
      log('\n   Видимый текст на странице:');
      log(`   ${stateAfterClick.visibleText}`);
    }

    // 12. Дополнительная проверка - ищем элементы тренажера
    log('\n📍 ШАГ 11: Поиск элементов тренажера');

    const trainerElements = await page.evaluate(() => {
      return {
        'h2 с Тренажёр': !!document.querySelector('h2:has-text("Тренажёр")'),
        'Вопрос в innerText': document.body.innerText.includes('Вопрос'),
        'Столица в innerText': document.body.innerText.includes('Столица'),
        'Москва в innerText': document.body.innerText.includes('Москва'),
        'GraduationCap icon': !!document.querySelector('.lucide-graduation-cap'),
        'Emerald bg elements': document.querySelectorAll('[class*="emerald"]').length,
      };
    });

    for (const [key, value] of Object.entries(trainerElements)) {
      log(`   ${key}: ${value}`);
    }

    // Итоговый отчет
    log('\n' + '='.repeat(70));
    log('📊 ИТОГОВЫЙ ДИАГНОСТИЧЕСКИЙ ОТЧЕТ');
    log('='.repeat(70));
    log(`Тренажер открылся: ${trainerOpened ? '✅ ДА' : '❌ НЕТ'}`);

    if (!trainerOpened) {
      log('\n🔍 ВЕРОЯТНЫЕ ПРИЧИНЫ ПРОБЛЕМЫ:');

      if (!examVisible) {
        log('   1. Кнопка не видима на экране');
      }
      if (!examEnabled) {
        log('   2. Кнопка неактивна (disabled)');
      }
      if (stateAfterClick.fixedElements === stateBeforeClick.fixedElementsCount) {
        log('   3. Количество fixed элементов не изменилось - state не обновился');
        log('      Возможно проблема в React useState или обработчике onClick');
      }
      if (!stateAfterClick.hasModal) {
        log('   4. role="dialog" не появился - компонент ExamTrainer не рендерится');
      }
    }

    log('\n📁 Скриншоты сохранены в e2e/screenshots/debug-*.png');
  });
});
