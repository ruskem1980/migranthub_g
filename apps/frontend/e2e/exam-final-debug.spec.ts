/**
 * Финальная диагностика - проверка React рендеринга и гидратации
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Финальная диагностика React', () => {
  test('Полная проверка React гидратации и onClick', async ({ page }) => {
    const logs: string[] = [];
    const log = (msg: string) => {
      console.log(msg);
      logs.push(msg);
    };

    const allConsoleLogs: string[] = [];

    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      allConsoleLogs.push(text);
      if (msg.type() === 'error' && !msg.text().includes('404')) {
        log(`🔴 ${text}`);
      }
    });

    page.on('pageerror', err => {
      log(`🔴 Page Error: ${err.message}\n${err.stack}`);
    });

    log('\n' + '='.repeat(70));
    log('🔬 ФИНАЛЬНАЯ ДИАГНОСТИКА REACT');
    log('='.repeat(70));

    // 1. Загрузка страницы с логированием всех событий
    log('\n📍 ШАГ 1: Загрузка страницы');
    const response = await page.goto(`${BASE_URL}/services`);
    log(`   HTTP статус: ${response?.status()}`);

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Даём время на гидратацию

    // 2. Проверяем что React загружен
    log('\n📍 ШАГ 2: Проверка загрузки React');

    const reactStatus = await page.evaluate(() => {
      // Проверяем глобальные React объекты
      const hasReact = typeof (window as any).React !== 'undefined';
      const hasReactDOM = typeof (window as any).ReactDOM !== 'undefined';

      // Проверяем любые элементы с React fiber
      const anyElement = document.querySelector('button');
      let hasFiber = false;
      let fiberKeys: string[] = [];

      if (anyElement) {
        const keys = Object.keys(anyElement);
        fiberKeys = keys.filter(k =>
          k.startsWith('__react') || k.startsWith('_reactProps')
        );
        hasFiber = fiberKeys.length > 0;
      }

      // Ищем React root по разным способам
      const rootById = document.getElementById('__next');
      const rootByBody = document.body.firstElementChild;

      let rootHasFiber = false;
      let rootFiberKeys: string[] = [];
      if (rootByBody) {
        const keys = Object.keys(rootByBody);
        rootFiberKeys = keys.filter(k =>
          k.startsWith('__react') || k.startsWith('_reactContainer')
        );
        rootHasFiber = rootFiberKeys.length > 0;
      }

      return {
        hasReact,
        hasReactDOM,
        hasFiber,
        fiberKeys,
        rootById: !!rootById,
        rootByBody: rootByBody?.tagName,
        rootHasFiber,
        rootFiberKeys,
      };
    });

    log(`   window.React: ${reactStatus.hasReact}`);
    log(`   window.ReactDOM: ${reactStatus.hasReactDOM}`);
    log(`   Button имеет fiber: ${reactStatus.hasFiber}`);
    log(`   Button fiber keys: ${reactStatus.fiberKeys.join(', ') || 'none'}`);
    log(`   #__next найден: ${reactStatus.rootById}`);
    log(`   Body first child: ${reactStatus.rootByBody}`);
    log(`   Root имеет fiber: ${reactStatus.rootHasFiber}`);
    log(`   Root fiber keys: ${reactStatus.rootFiberKeys.join(', ') || 'none'}`);

    // 3. Детальный анализ кнопки
    log('\n📍 ШАГ 3: Анализ кнопки "Экзамен по русскому"');

    const buttonAnalysis = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const results: any[] = [];

      buttons.forEach((btn, i) => {
        const text = btn.textContent?.trim() || '';
        if (!text.includes('Экзамен')) return;

        const keys = Object.keys(btn);
        const fiberKey = keys.find(k => k.startsWith('__reactFiber'));
        const propsKey = keys.find(k => k.startsWith('__reactProps'));

        let onClickInfo = null;
        if (propsKey) {
          const props = (btn as any)[propsKey];
          if (props) {
            onClickInfo = {
              hasOnClick: typeof props.onClick === 'function',
              propsKeys: Object.keys(props),
            };
          }
        }

        // Проверяем HTML структуру кнопки
        const htmlStructure = btn.innerHTML.substring(0, 200);

        // Проверяем все обработчики событий через getEventListeners (не работает в evaluate)
        // Вместо этого проверим через onclick атрибут
        const hasOnclickAttr = btn.hasAttribute('onclick');
        const onclickAttr = btn.getAttribute('onclick');

        results.push({
          index: i,
          textPreview: text.substring(0, 50),
          fiberKey: fiberKey ? 'present' : 'missing',
          propsKey: propsKey ? 'present' : 'missing',
          onClickInfo,
          hasOnclickAttr,
          onclickAttr,
          htmlStructure,
          classList: btn.className,
        });
      });

      return results;
    });

    for (const btn of buttonAnalysis) {
      log(`\n   Кнопка #${btn.index}: "${btn.textPreview}"`);
      log(`   - fiber: ${btn.fiberKey}`);
      log(`   - props: ${btn.propsKey}`);
      log(`   - onClick в props: ${btn.onClickInfo?.hasOnClick ?? 'N/A'}`);
      log(`   - Props keys: ${btn.onClickInfo?.propsKeys?.join(', ') ?? 'N/A'}`);
      log(`   - onclick attr: ${btn.hasOnclickAttr}`);
      log(`   - class: ${btn.classList.substring(0, 80)}`);
    }

    // 4. Пробуем разные способы клика
    log('\n📍 ШАГ 4: Тестирование разных способов клика');

    const examBtn = page.locator('button').filter({ hasText: 'Экзамен по русскому' }).first();

    // Способ 1: Обычный клик
    log('\n   Способ 1: Playwright click()');
    await examBtn.click();
    await page.waitForTimeout(500);

    let result1 = await page.evaluate(() => document.querySelector('[role="dialog"]') !== null);
    log(`   Результат: ${result1 ? '✅ Модал открылся' : '❌ Модал НЕ открылся'}`);

    // Способ 2: dispatchEvent
    log('\n   Способ 2: dispatchEvent MouseEvent');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.includes('Экзамен'));
      if (btn) {
        const event = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        btn.dispatchEvent(event);
      }
    });
    await page.waitForTimeout(500);

    let result2 = await page.evaluate(() => document.querySelector('[role="dialog"]') !== null);
    log(`   Результат: ${result2 ? '✅ Модал открылся' : '❌ Модал НЕ открылся'}`);

    // Способ 3: Прямой вызов через fiber
    log('\n   Способ 3: Прямой вызов через React fiber');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.includes('Экзамен'));
      if (btn) {
        const propsKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
        if (propsKey) {
          const props = (btn as any)[propsKey];
          if (props?.onClick) {
            console.log('[DEBUG] Calling onClick directly');
            props.onClick({ preventDefault: () => {}, stopPropagation: () => {} });
          } else {
            console.log('[DEBUG] onClick not found in fiber props');
          }
        } else {
          console.log('[DEBUG] React props key not found');
        }
      }
    });
    await page.waitForTimeout(500);

    let result3 = await page.evaluate(() => document.querySelector('[role="dialog"]') !== null);
    log(`   Результат: ${result3 ? '✅ Модал открылся' : '❌ Модал НЕ открылся'}`);

    // 5. Проверяем консоль на ошибки гидратации
    log('\n📍 ШАГ 5: Анализ консоли');

    const hydrationErrors = allConsoleLogs.filter(l =>
      l.includes('hydrat') || l.includes('Hydrat') ||
      l.includes('mismatch') || l.includes('Text content')
    );

    if (hydrationErrors.length > 0) {
      log('   ⚠️ Найдены ошибки гидратации:');
      hydrationErrors.forEach(e => log(`   - ${e}`));
    } else {
      log('   ✅ Ошибок гидратации не обнаружено');
    }

    // Скриншот
    await page.screenshot({ path: 'e2e/screenshots/final-debug.png', fullPage: true });

    // ФИНАЛЬНЫЙ ОТЧЕТ
    log('\n' + '='.repeat(70));
    log('📊 ФИНАЛЬНЫЙ ОТЧЕТ');
    log('='.repeat(70));

    const anySuccess = result1 || result2 || result3;

    if (!anySuccess) {
      log('\n❌ ПРОБЛЕМА: Тренажер не открывается никаким способом!\n');
      log('🔍 АНАЛИЗ ПРИЧИН:\n');

      if (!reactStatus.hasFiber) {
        log('   1. ❌ React fiber НЕ найден на элементах');
        log('      → React не гидратировал компоненты');
        log('      → Возможная причина: ошибка при гидратации или SSR-only рендер');
      } else {
        log('   1. ✅ React fiber найден');
      }

      if (buttonAnalysis.length > 0 && !buttonAnalysis[0].onClickInfo?.hasOnClick) {
        log('   2. ❌ onClick НЕ найден в React props');
        log('      → Обработчик события не привязан к кнопке');
        log('      → Возможная причина: компонент не перерендерился после гидратации');
      }

      log('\n💡 РЕКОМЕНДАЦИИ:');
      log('   1. Проверить консоль браузера на ошибки JavaScript');
      log('   2. Проверить что "use client" есть на всех нужных компонентах');
      log('   3. Проверить нет ли ошибок в импортах ExamTrainer');
      log('   4. Попробовать упростить компонент ServicesPage');
      log('   5. Проверить версию Next.js и React на совместимость');
    } else {
      log('\n✅ Один из способов сработал!');
    }

    log('\n📁 Скриншот: e2e/screenshots/final-debug.png');
  });
});
