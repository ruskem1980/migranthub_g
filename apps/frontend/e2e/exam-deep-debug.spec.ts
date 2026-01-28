/**
 * Глубокая диагностика JavaScript и React для тренажера
 */
import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Глубокая диагностика', () => {
  test('Проверка JavaScript и React обработчиков', async ({ page }) => {
    const logs: string[] = [];
    const log = (msg: string) => {
      console.log(msg);
      logs.push(msg);
    };

    // Собираем ВСЕ сообщения консоли
    const allConsoleLogs: { type: string; text: string }[] = [];
    page.on('console', msg => {
      const text = msg.text();
      allConsoleLogs.push({ type: msg.type(), text });
      if (msg.type() === 'error') {
        log(`🔴 Error: ${text}`);
      } else if (msg.type() === 'log' && text.includes('[DEBUG]')) {
        log(`🟢 Debug: ${text}`);
      }
    });

    page.on('pageerror', err => {
      log(`🔴 Page Error: ${err.message}`);
    });

    log('\n' + '='.repeat(70));
    log('🔬 ГЛУБОКАЯ ДИАГНОСТИКА JAVASCRIPT И REACT');
    log('='.repeat(70));

    // 1. Открываем страницу
    log('\n📍 ШАГ 1: Загрузка страницы');
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    log('   Страница загружена');

    // 2. Проверяем гидратацию React
    log('\n📍 ШАГ 2: Проверка React гидратации');

    const reactCheck = await page.evaluate(() => {
      // Проверяем наличие React fiber
      const root = document.getElementById('__next');
      if (!root) return { hasRoot: false };

      // Ищем React fiber в DOM элементах
      const anyElement = document.querySelector('button');
      if (!anyElement) return { hasRoot: true, hasFiber: false };

      // Проверяем наличие React internal props
      const fiberKey = Object.keys(anyElement).find(key =>
        key.startsWith('__reactFiber') || key.startsWith('__reactProps')
      );

      return {
        hasRoot: true,
        hasFiber: !!fiberKey,
        fiberKey: fiberKey || 'not found',
      };
    });

    log(`   __next root: ${reactCheck.hasRoot}`);
    log(`   React fiber: ${reactCheck.hasFiber}`);
    log(`   Fiber key: ${reactCheck.fiberKey}`);

    // 3. Добавляем debug обработчики ДО React
    log('\n📍 ШАГ 3: Установка debug обработчиков');

    await page.evaluate(() => {
      // Перехватываем все клики на странице
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        console.log(`[DEBUG] Global click on: ${target.tagName}.${target.className}`);
      }, true);

      // Находим кнопку экзамена и добавляем обработчики
      const buttons = document.querySelectorAll('button');
      buttons.forEach((btn, i) => {
        const text = btn.textContent || '';
        if (text.includes('Экзамен')) {
          console.log(`[DEBUG] Found exam button at index ${i}`);

          // Добавляем native обработчик
          btn.addEventListener('click', (e) => {
            console.log('[DEBUG] Native click handler fired!');
            console.log(`[DEBUG] Event bubbles: ${e.bubbles}, cancelable: ${e.cancelable}`);
            console.log(`[DEBUG] Event defaultPrevented: ${e.defaultPrevented}`);
          }, false);

          // Проверяем React props
          const fiberKey = Object.keys(btn).find(key => key.startsWith('__reactProps'));
          if (fiberKey) {
            const props = (btn as any)[fiberKey];
            console.log(`[DEBUG] React props found: ${JSON.stringify(Object.keys(props))}`);
            console.log(`[DEBUG] Has onClick: ${typeof props.onClick === 'function'}`);
          }
        }
      });
    });

    log('   Debug обработчики установлены');

    // 4. Находим кнопку
    log('\n📍 ШАГ 4: Поиск кнопки "Экзамен по русскому"');
    const examButton = page.locator('button').filter({ hasText: 'Экзамен по русскому' }).first();
    const isVisible = await examButton.isVisible();
    log(`   Кнопка видима: ${isVisible}`);

    // 5. Получаем информацию о React обработчике
    log('\n📍 ШАГ 5: Анализ React обработчика onClick');

    const onClickInfo = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.includes('Экзамен')) {
          const fiberKey = Object.keys(btn).find(key => key.startsWith('__reactProps'));
          if (fiberKey) {
            const props = (btn as any)[fiberKey];
            if (props.onClick) {
              return {
                hasOnClick: true,
                onClickType: typeof props.onClick,
                onClickString: props.onClick.toString().substring(0, 200),
              };
            }
          }
          return { hasOnClick: false, reason: 'onClick not found in props' };
        }
      }
      return { hasOnClick: false, reason: 'Button not found' };
    });

    log(`   Has onClick: ${onClickInfo.hasOnClick}`);
    if (onClickInfo.hasOnClick) {
      log(`   onClick type: ${onClickInfo.onClickType}`);
      log(`   onClick code: ${onClickInfo.onClickString}`);
    } else {
      log(`   Причина: ${onClickInfo.reason}`);
    }

    // 6. Выполняем клик
    log('\n📍 ШАГ 6: Выполнение клика');
    await page.screenshot({ path: 'e2e/screenshots/deep-01-before-click.png' });

    // Очищаем логи перед кликом
    allConsoleLogs.length = 0;

    await examButton.click();
    log('   Клик выполнен');

    // Ждём
    await page.waitForTimeout(500);

    // 7. Проверяем логи после клика
    log('\n📍 ШАГ 7: Анализ логов после клика');
    log(`   Всего сообщений консоли после клика: ${allConsoleLogs.length}`);

    for (const msg of allConsoleLogs) {
      if (msg.text.includes('[DEBUG]')) {
        log(`   ${msg.type}: ${msg.text}`);
      }
    }

    // 8. Проверяем состояние после клика
    log('\n📍 ШАГ 8: Проверка DOM после клика');

    const domAfterClick = await page.evaluate(() => {
      return {
        hasDialog: !!document.querySelector('[role="dialog"]'),
        hasFixedOverlay: !!document.querySelector('.fixed.inset-0'),
        hasQuestion: document.body.innerText.includes('Вопрос'),
        hasExamTrainer: document.body.innerHTML.includes('Тренажёр экзамена'),
        activeModalElements: document.querySelectorAll('[class*="fixed"][class*="inset"]').length,
      };
    });

    log(`   role="dialog": ${domAfterClick.hasDialog}`);
    log(`   fixed.inset-0: ${domAfterClick.hasFixedOverlay}`);
    log(`   Текст "Вопрос": ${domAfterClick.hasQuestion}`);
    log(`   Текст "Тренажёр экзамена": ${domAfterClick.hasExamTrainer}`);
    log(`   Fixed inset элементы: ${domAfterClick.activeModalElements}`);

    await page.screenshot({ path: 'e2e/screenshots/deep-02-after-click.png' });

    // 9. Пробуем вызвать onClick напрямую через JS
    log('\n📍 ШАГ 9: Прямой вызов React onClick');

    const directCallResult = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.includes('Экзамен')) {
          const fiberKey = Object.keys(btn).find(key => key.startsWith('__reactProps'));
          if (fiberKey) {
            const props = (btn as any)[fiberKey];
            if (props.onClick) {
              try {
                // Создаём fake event
                const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {} };
                props.onClick(fakeEvent);
                return { success: true, message: 'onClick called successfully' };
              } catch (e) {
                return { success: false, message: `Error: ${e}` };
              }
            }
          }
          return { success: false, message: 'onClick not found' };
        }
      }
      return { success: false, message: 'Button not found' };
    });

    log(`   Результат: ${directCallResult.success}`);
    log(`   Сообщение: ${directCallResult.message}`);

    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e/screenshots/deep-03-after-direct-call.png' });

    // 10. Финальная проверка
    log('\n📍 ШАГ 10: Финальная проверка после прямого вызова');

    const finalCheck = await page.evaluate(() => {
      return {
        hasDialog: !!document.querySelector('[role="dialog"]'),
        hasExamTrainer: document.body.innerHTML.includes('Тренажёр экзамена'),
        hasQuestion: document.body.innerText.includes('Вопрос 1'),
      };
    });

    log(`   role="dialog": ${finalCheck.hasDialog}`);
    log(`   Тренажёр открыт: ${finalCheck.hasExamTrainer}`);
    log(`   Вопрос 1: ${finalCheck.hasQuestion}`);

    // Итог
    log('\n' + '='.repeat(70));
    log('📊 ИТОГОВЫЙ АНАЛИЗ');
    log('='.repeat(70));

    const trainerOpened = finalCheck.hasDialog || finalCheck.hasExamTrainer || finalCheck.hasQuestion;
    log(`\nТренажер открылся: ${trainerOpened ? '✅ ДА' : '❌ НЕТ'}`);

    if (!trainerOpened) {
      log('\n🔍 ВЕРОЯТНЫЕ ПРИЧИНЫ:');
      if (!reactCheck.hasFiber) {
        log('   1. React не гидратировался - компонент работает в SSR режиме');
      }
      if (!onClickInfo.hasOnClick) {
        log('   2. onClick обработчик не привязан к кнопке');
      }
      if (!directCallResult.success) {
        log('   3. onClick не удалось вызвать напрямую');
      }
      log('   4. Возможно, setState не работает (баг в компоненте)');
      log('   5. Возможно, ExamTrainer не рендерится (условие activeModal === "exam")');
    }

    log('\n📁 Скриншоты: e2e/screenshots/deep-*.png');
  });

  test('Проверка прямого рендеринга ExamTrainer', async ({ page }) => {
    const log = (msg: string) => console.log(msg);

    log('\n' + '='.repeat(70));
    log('🧪 ТЕСТ: Прямой рендеринг ExamTrainer');
    log('='.repeat(70));

    // Пробуем открыть страницу с принудительным показом ExamTrainer
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');

    // Инжектируем состояние напрямую
    const injectResult = await page.evaluate(() => {
      // Ищем React root и пробуем изменить state
      const root = document.getElementById('__next');
      if (!root) return { success: false, reason: 'No __next root' };

      // Попробуем найти React fiber и изменить состояние
      const fiberKey = Object.keys(root).find(key =>
        key.startsWith('__reactContainer')
      );

      if (!fiberKey) return { success: false, reason: 'No React container' };

      return { success: true, reason: 'Found React container' };
    });

    log(`   Inject result: ${injectResult.success} - ${injectResult.reason}`);

    // Делаем скриншот
    await page.screenshot({ path: 'e2e/screenshots/deep-04-inject-attempt.png' });
  });
});
