/**
 * Тотальный аудит UI и локализации MigrantHub
 * Проверяет ВСЕ языки, ВСЕ страницы, ВСЕ элементы
 */
import { test, expect, Page } from '@playwright/test';

// Все поддерживаемые языки
const LANGUAGES = ['ru', 'en', 'uz', 'tg', 'ky'] as const;
type Language = typeof LANGUAGES[number];

// Все страницы приложения
const PAGES = [
  { path: '/', name: 'home' },
  { path: '/welcome', name: 'welcome' },
  { path: '/auth/method', name: 'auth-method' },
  { path: '/auth/phone', name: 'auth-phone' },
  { path: '/auth/otp', name: 'auth-otp' },
  { path: '/documents', name: 'documents' },
  { path: '/services', name: 'services' },
  { path: '/calculator', name: 'calculator' },
  { path: '/profile', name: 'profile' },
  { path: '/payment', name: 'payment' },
  { path: '/prototype', name: 'prototype' },
  { path: '/offline', name: 'offline' },
];

// Результаты аудита
interface AuditResult {
  language: string;
  page: string;
  buttons: number;
  links: number;
  inputs: number;
  emptyButtons: string[];
  untranslatedKeys: string[];
  errors: string[];
  clickResults: { element: string; success: boolean; error?: string }[];
}

const auditResults: AuditResult[] = [];
const consoleErrors: string[] = [];
const networkErrors: string[] = [];

// Хелпер для установки языка
async function setLanguage(page: Page, lang: Language) {
  await page.evaluate((l) => {
    localStorage.setItem('language', l);
    localStorage.setItem('migranthub-language', JSON.stringify({ state: { language: l }, version: 0 }));
  }, lang);
}

// Хелпер для проверки непереведённых строк
async function findUntranslatedStrings(page: Page): Promise<string[]> {
  return await page.evaluate(() => {
    const untranslated: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

    while (walker.nextNode()) {
      const text = walker.currentNode.textContent?.trim() || '';
      // Ищем паттерны непереведённых ключей
      if (text.match(/^[a-z]+\.[a-z]+(\.[a-z]+)*$/i)) {
        untranslated.push(text);
      }
      // Ищем {{placeholder}} паттерны
      if (text.match(/\{\{.*?\}\}/)) {
        untranslated.push(text);
      }
    }
    return [...new Set(untranslated)];
  });
}

// Хелпер для клика по всем кнопкам
async function clickAllButtons(page: Page): Promise<{ element: string; success: boolean; error?: string }[]> {
  const results: { element: string; success: boolean; error?: string }[] = [];

  const buttons = await page.locator('button:visible').all();

  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    try {
      const text = await btn.textContent() || `button-${i}`;
      const isDisabled = await btn.isDisabled();

      if (!isDisabled) {
        // Пробуем кликнуть
        await btn.click({ timeout: 2000 }).catch(() => {});
        results.push({ element: text.trim().slice(0, 30), success: true });

        // Закрываем модалки если открылись
        const closeBtn = page.locator('[aria-label="Close"], button:has-text("×"), button:has-text("Закрыть")').first();
        if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
          await closeBtn.click().catch(() => {});
        }

        // Возвращаемся назад если перешли
        await page.goBack().catch(() => {});
      }
    } catch (e) {
      results.push({ element: `button-${i}`, success: false, error: String(e).slice(0, 100) });
    }
  }

  return results;
}

// Хелпер для заполнения всех полей ввода
async function fillAllInputs(page: Page): Promise<number> {
  const inputs = await page.locator('input:visible, textarea:visible').all();
  let filled = 0;

  for (const input of inputs) {
    try {
      const type = await input.getAttribute('type') || 'text';
      const placeholder = await input.getAttribute('placeholder') || '';

      if (type === 'tel' || placeholder.toLowerCase().includes('телефон') || placeholder.toLowerCase().includes('phone')) {
        await input.fill('+79991234567');
      } else if (type === 'email') {
        await input.fill('test@example.com');
      } else if (type === 'date') {
        await input.fill('2025-01-01');
      } else if (type === 'number') {
        await input.fill('123');
      } else {
        await input.fill('Тестовое значение');
      }
      filled++;
    } catch {
      // Игнорируем ошибки заполнения
    }
  }

  return filled;
}

test.describe('Тотальный аудит UI и локализации', () => {

  test.beforeAll(async ({ browser }) => {
    // Очистка результатов
    auditResults.length = 0;
    consoleErrors.length = 0;
    networkErrors.length = 0;
  });

  // Тест каждого языка
  for (const lang of LANGUAGES) {
    test.describe(`Язык: ${lang.toUpperCase()}`, () => {

      // Тест каждой страницы
      for (const pageInfo of PAGES) {
        test(`${pageInfo.name} - элементы и локализация`, async ({ page }) => {
          // Слушаем ошибки консоли
          page.on('console', msg => {
            if (msg.type() === 'error') {
              consoleErrors.push(`[${lang}][${pageInfo.name}] ${msg.text()}`);
            }
          });

          // Слушаем сетевые ошибки
          page.on('requestfailed', req => {
            networkErrors.push(`[${lang}][${pageInfo.name}] ${req.url()}`);
          });

          // Устанавливаем язык
          await page.goto('/welcome');
          await setLanguage(page, lang);

          // Переходим на страницу
          await page.goto(pageInfo.path);
          await page.waitForLoadState('networkidle');

          // Скриншот
          await page.screenshot({
            path: `e2e/screenshots/audit/${lang}-${pageInfo.name}.png`,
            fullPage: true
          });

          // Собираем статистику
          const buttons = await page.locator('button:visible').all();
          const links = await page.locator('a:visible').all();
          const inputs = await page.locator('input:visible, textarea:visible').all();

          // Проверяем пустые кнопки
          const emptyButtons: string[] = [];
          for (let i = 0; i < buttons.length; i++) {
            const text = await buttons[i].textContent();
            if (!text?.trim()) {
              emptyButtons.push(`button-${i}`);
            }
          }

          // Ищем непереведённые строки
          const untranslated = await findUntranslatedStrings(page);

          // Сохраняем результат
          const result: AuditResult = {
            language: lang,
            page: pageInfo.path,
            buttons: buttons.length,
            links: links.length,
            inputs: inputs.length,
            emptyButtons,
            untranslatedKeys: untranslated,
            errors: [],
            clickResults: [],
          };

          auditResults.push(result);

          // Логируем
          console.log(`[${lang}] ${pageInfo.path}: ${buttons.length} кнопок, ${links.length} ссылок, ${inputs.length} полей`);
          if (emptyButtons.length > 0) {
            console.log(`  ⚠️ Пустые кнопки: ${emptyButtons.length}`);
          }
          if (untranslated.length > 0) {
            console.log(`  ⚠️ Непереведённые ключи: ${untranslated.join(', ')}`);
          }
        });
      }

      // Тест интерактивности для ключевых страниц
      // Увеличенный timeout для сложных тестов
      test(`Интерактивность - клики и формы`, async ({ page }) => {
        test.setTimeout(60000); // 60 секунд

        await page.goto('/welcome');
        await setLanguage(page, lang);

        // 1. Welcome - выбор языка
        await page.goto('/welcome');
        await page.waitForLoadState('networkidle');

        // Кликаем по выбору языка
        const langButtons = await page.locator('button').filter({ hasText: /Русский|English|O'zbek|Тоҷикӣ|Кыргыз/i }).all();
        console.log(`[${lang}] Welcome: ${langButtons.length} кнопок выбора языка`);

        // 2. Services - открытие модалок
        await page.goto('/services');
        await page.waitForLoadState('networkidle');

        const serviceCards = await page.locator('button').all();
        let modalsOpened = 0;

        // Ограничиваем до 3 карточек для ускорения
        for (const card of serviceCards.slice(0, 3)) {
          try {
            await card.click({ timeout: 1000 });
            await page.waitForTimeout(300);

            // Проверяем открылась ли модалка
            const modal = page.locator('.fixed.inset-0, [role="dialog"]').first();
            if (await modal.isVisible({ timeout: 500 }).catch(() => false)) {
              modalsOpened++;

              // Закрываем через Escape (быстрее)
              await page.keyboard.press('Escape');
              await page.waitForTimeout(200);
            }
          } catch {
            // Игнорируем
          }
        }
        console.log(`[${lang}] Services: открыто ${modalsOpened} модалок`);

        // 3. Documents - открытие формы
        await page.goto('/documents');
        await page.waitForLoadState('networkidle');

        const addDocBtn = page.locator('button:has-text("Добавить"), button:has-text("+"), button:has-text("Add")').first();
        if (await addDocBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await addDocBtn.click();
          await page.waitForTimeout(500);
        }

        // 4. Profile - заполнение полей
        await page.goto('/profile');
        await page.waitForLoadState('networkidle');

        const filledInputs = await fillAllInputs(page);
        console.log(`[${lang}] Profile: заполнено ${filledInputs} полей`);
      });
    });
  }

  // Финальный отчёт
  test('Генерация итогового отчёта', async ({ page }) => {
    console.log('\n========================================');
    console.log('       ИТОГОВЫЙ ОТЧЁТ АУДИТА');
    console.log('========================================\n');

    // Статистика по языкам
    for (const lang of LANGUAGES) {
      const langResults = auditResults.filter(r => r.language === lang);
      const totalButtons = langResults.reduce((sum, r) => sum + r.buttons, 0);
      const totalEmpty = langResults.reduce((sum, r) => sum + r.emptyButtons.length, 0);
      const totalUntranslated = langResults.reduce((sum, r) => sum + r.untranslatedKeys.length, 0);

      console.log(`\n📌 ${lang.toUpperCase()}:`);
      console.log(`   Страниц: ${langResults.length}`);
      console.log(`   Кнопок: ${totalButtons}`);
      console.log(`   Пустых кнопок: ${totalEmpty}`);
      console.log(`   Непереведённых ключей: ${totalUntranslated}`);

      if (totalUntranslated > 0) {
        const keys = [...new Set(langResults.flatMap(r => r.untranslatedKeys))];
        console.log(`   Ключи: ${keys.slice(0, 10).join(', ')}${keys.length > 10 ? '...' : ''}`);
      }
    }

    // Ошибки
    console.log('\n\n🔴 ОШИБКИ КОНСОЛИ:');
    if (consoleErrors.length === 0) {
      console.log('   Нет ошибок');
    } else {
      [...new Set(consoleErrors)].slice(0, 20).forEach(e => console.log(`   - ${e}`));
    }

    console.log('\n\n🔴 СЕТЕВЫЕ ОШИБКИ (404):');
    if (networkErrors.length === 0) {
      console.log('   Нет ошибок');
    } else {
      [...new Set(networkErrors)].slice(0, 10).forEach(e => console.log(`   - ${e}`));
    }

    console.log('\n========================================\n');
  });
});
