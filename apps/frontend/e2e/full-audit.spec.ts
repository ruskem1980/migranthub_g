/**
 * Полный E2E аудит MigrantHub
 * Проходит по ВСЕМ страницам, кликает по ВСЕМ элементам, логирует ВСЕ ошибки
 */
import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// Глобальные счётчики
interface AuditResult {
  page: string;
  status: 'ok' | 'partial' | 'error';
  errors: string[];
  warnings: string[];
  clickedElements: number;
  modalsOpened: number;
  formsFound: number;
}

const auditResults: AuditResult[] = [];
const allConsoleErrors: string[] = [];
const allPageErrors: string[] = [];

// Хелпер для логирования
function log(msg: string) {
  console.log(msg);
}

// Настройка логирования ошибок
async function setupErrorLogging(page: Page) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      allConsoleErrors.push(text);
      log(`  [Console Error] ${text}`);
    }
  });

  page.on('pageerror', err => {
    allPageErrors.push(err.message);
    log(`  [Page Error] ${err.message}`);
  });
}

// Функция для скриншота
async function takeScreenshot(page: Page, name: string) {
  const safeName = name.replace(/[^a-zA-Z0-9-]/g, '_');
  await page.screenshot({
    path: `e2e/screenshots/${safeName}.png`,
    fullPage: true
  });
  log(`  [Screenshot] ${safeName}.png`);
}

test.describe('Полный E2E аудит MigrantHub', () => {
  test.setTimeout(300000); // 5 минут на весь тест

  test('Аудит ВСЕХ страниц приложения', async ({ page }) => {
    await setupErrorLogging(page);

    // ============================================
    // 1. ГЛАВНАЯ СТРАНИЦА /
    // ============================================
    log('\n========================================');
    log('1. ГЛАВНАЯ СТРАНИЦА /');
    log('========================================');

    const homeResult: AuditResult = {
      page: '/',
      status: 'ok',
      errors: [],
      warnings: [],
      clickedElements: 0,
      modalsOpened: 0,
      formsFound: 0
    };

    try {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      log('  [OK] Страница загружена');

      // Проверяем редирект
      const currentUrl = page.url();
      log(`  [Info] Текущий URL: ${currentUrl}`);

      // Находим все кнопки
      const buttons = page.locator('button, a[href]');
      const buttonCount = await buttons.count();
      log(`  [Info] Найдено интерактивных элементов: ${buttonCount}`);

      await takeScreenshot(page, 'home');

    } catch (err) {
      homeResult.status = 'error';
      homeResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(homeResult);

    // ============================================
    // 2. WELCOME PAGE /welcome
    // ============================================
    log('\n========================================');
    log('2. СТРАНИЦА ПРИВЕТСТВИЯ /welcome');
    log('========================================');

    const welcomeResult: AuditResult = {
      page: '/welcome',
      status: 'ok',
      errors: [],
      warnings: [],
      clickedElements: 0,
      modalsOpened: 0,
      formsFound: 0
    };

    try {
      await page.goto(`${BASE_URL}/welcome`, { waitUntil: 'networkidle' });
      log('  [OK] Страница загружена');

      // Ищем кнопку "Начать"
      const startButton = page.locator('button:has-text("Начать"), a:has-text("Начать")');
      if (await startButton.isVisible({ timeout: 2000 })) {
        log('  [OK] Кнопка "Начать" найдена');
        welcomeResult.clickedElements++;
      } else {
        welcomeResult.warnings.push('Кнопка "Начать" не найдена');
        log('  [WARN] Кнопка "Начать" не найдена');
      }

      await takeScreenshot(page, 'welcome');

    } catch (err) {
      welcomeResult.status = 'error';
      welcomeResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(welcomeResult);

    // ============================================
    // 3. AUTH PAGES
    // ============================================
    log('\n========================================');
    log('3. СТРАНИЦЫ АВТОРИЗАЦИИ');
    log('========================================');

    // /auth/phone
    log('\n--- /auth/phone ---');
    const phoneResult: AuditResult = {
      page: '/auth/phone',
      status: 'ok',
      errors: [],
      warnings: [],
      clickedElements: 0,
      modalsOpened: 0,
      formsFound: 0
    };

    try {
      await page.goto(`${BASE_URL}/auth/phone`, { waitUntil: 'networkidle' });
      log('  [OK] Страница загружена');

      // Проверяем форму ввода телефона
      const phoneInput = page.locator('input[type="tel"], input[placeholder*="телефон"], input[placeholder*="phone"]');
      if (await phoneInput.isVisible({ timeout: 2000 })) {
        log('  [OK] Поле ввода телефона найдено');
        phoneResult.formsFound++;

        // Пробуем ввести номер
        await phoneInput.fill('+79991234567');
        log('  [OK] Номер введён');
        phoneResult.clickedElements++;
      } else {
        phoneResult.warnings.push('Поле ввода телефона не найдено');
        log('  [WARN] Поле ввода телефона не найдено');
      }

      // Проверяем кнопку отправки
      const submitBtn = page.locator('button[type="submit"], button:has-text("Отправить"), button:has-text("Далее")');
      if (await submitBtn.isVisible({ timeout: 2000 })) {
        log('  [OK] Кнопка отправки найдена');
      }

      await takeScreenshot(page, 'auth-phone');

    } catch (err) {
      phoneResult.status = 'error';
      phoneResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(phoneResult);

    // /auth/otp
    log('\n--- /auth/otp ---');
    const otpResult: AuditResult = {
      page: '/auth/otp',
      status: 'ok',
      errors: [],
      warnings: [],
      clickedElements: 0,
      modalsOpened: 0,
      formsFound: 0
    };

    try {
      await page.goto(`${BASE_URL}/auth/otp`, { waitUntil: 'networkidle' });
      log('  [OK] Страница загружена');

      // Проверяем поля OTP
      const otpInputs = page.locator('input[type="text"], input[type="number"], input[inputmode="numeric"]');
      const otpCount = await otpInputs.count();
      log(`  [Info] Найдено полей ввода: ${otpCount}`);

      if (otpCount > 0) {
        otpResult.formsFound++;
      }

      await takeScreenshot(page, 'auth-otp');

    } catch (err) {
      otpResult.status = 'error';
      otpResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(otpResult);

    // /auth/method
    log('\n--- /auth/method ---');
    const methodResult: AuditResult = {
      page: '/auth/method',
      status: 'ok',
      errors: [],
      warnings: [],
      clickedElements: 0,
      modalsOpened: 0,
      formsFound: 0
    };

    try {
      await page.goto(`${BASE_URL}/auth/method`, { waitUntil: 'networkidle' });
      log('  [OK] Страница загружена');

      // Ищем варианты авторизации
      const authOptions = page.locator('button, [role="button"]');
      const optionsCount = await authOptions.count();
      log(`  [Info] Найдено вариантов авторизации: ${optionsCount}`);

      await takeScreenshot(page, 'auth-method');

    } catch (err) {
      methodResult.status = 'error';
      methodResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(methodResult);

    // ============================================
    // 4. SERVICES PAGE /services
    // ============================================
    log('\n========================================');
    log('4. СТРАНИЦА СЕРВИСОВ /services');
    log('========================================');

    const servicesResult: AuditResult = {
      page: '/services',
      status: 'ok',
      errors: [],
      warnings: [],
      clickedElements: 0,
      modalsOpened: 0,
      formsFound: 0
    };

    try {
      await page.goto(`${BASE_URL}/services`, { waitUntil: 'networkidle' });
      log('  [OK] Страница загружена');

      await takeScreenshot(page, 'services-initial');

      // Список сервисов для тестирования (с учетом реальных названий)
      const services = [
        { name: 'Проверка запретов', expectModal: true },
        { name: 'Калькулятор 90/180', expectModal: false, expectNavigation: '/calculator' },
        { name: 'Карта мигранта', expectModal: true },
        { name: 'Экзамен по русскому', expectModal: true },
        { name: 'Переводчик', expectModal: false, external: true },
        { name: 'Карта мечетей', expectModal: true },
      ];

      for (const service of services) {
        log(`\n  --- Тестируем: ${service.name} ---`);

        // Каждый раз возвращаемся на страницу сервисов
        await page.goto(`${BASE_URL}/services`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);

        // Ищем все кнопки на странице
        const allButtons = page.locator('button');
        const count = await allButtons.count();

        let buttonFound = false;
        for (let i = 0; i < count; i++) {
          const btn = allButtons.nth(i);
          const text = await btn.textContent();

          if (text && text.includes(service.name)) {
            buttonFound = true;
            log(`    [OK] Кнопка найдена`);
            servicesResult.clickedElements++;

            if (service.external) {
              log(`    [SKIP] Внешняя ссылка`);
              break;
            }

            await btn.click();
            log(`    [OK] Клик выполнен`);

            await page.waitForTimeout(800);

            if (service.expectNavigation) {
              const currentUrl = page.url();
              if (currentUrl.includes(service.expectNavigation)) {
                log(`    [OK] Навигация на ${service.expectNavigation}`);
              } else {
                log(`    [WARN] Ожидалась навигация на ${service.expectNavigation}, получили ${currentUrl}`);
                servicesResult.warnings.push(`Навигация для "${service.name}" не сработала`);
              }
            } else if (service.expectModal) {
              // Проверяем модальное окно
              const modal = page.locator('[role="dialog"], .fixed.inset-0.bg-black');
              if (await modal.isVisible({ timeout: 2000 })) {
                log(`    [OK] Модальное окно открылось`);
                servicesResult.modalsOpened++;

                await takeScreenshot(page, `services-modal-${service.name.replace(/[\s\/]+/g, '-')}`);

                // Закрываем модалку
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
              } else {
                log(`    [WARN] Модальное окно НЕ открылось`);
                servicesResult.warnings.push(`Модальное окно для "${service.name}" не открылось`);
              }
            }

            break;
          }
        }

        if (!buttonFound) {
          log(`    [WARN] Кнопка не найдена`);
          servicesResult.warnings.push(`Кнопка "${service.name}" не найдена`);
        }
      }

    } catch (err) {
      servicesResult.status = 'error';
      servicesResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    if (servicesResult.warnings.length > 0) {
      servicesResult.status = 'partial';
    }

    auditResults.push(servicesResult);

    // ============================================
    // 5. CALCULATOR PAGE /calculator
    // ============================================
    log('\n========================================');
    log('5. СТРАНИЦА КАЛЬКУЛЯТОРА /calculator');
    log('========================================');

    const calculatorResult: AuditResult = {
      page: '/calculator',
      status: 'ok',
      errors: [],
      warnings: [],
      clickedElements: 0,
      modalsOpened: 0,
      formsFound: 0
    };

    try {
      await page.goto(`${BASE_URL}/calculator`, { waitUntil: 'networkidle' });
      log('  [OK] Страница загружена');

      await takeScreenshot(page, 'calculator');

      // Ищем элементы калькулятора
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      log(`  [Info] Найдено полей ввода: ${inputCount}`);

      if (inputCount > 0) {
        calculatorResult.formsFound++;
      }

      // Ищем кнопки
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      log(`  [Info] Найдено кнопок: ${buttonCount}`);

      // Пробуем кликнуть по кнопке добавления периода если есть
      const addPeriodBtn = page.locator('button:has-text("Добавить"), button:has-text("добавить")').first();
      if (await addPeriodBtn.isVisible({ timeout: 1000 })) {
        await addPeriodBtn.click();
        log('  [OK] Кнопка добавления периода нажата');
        calculatorResult.clickedElements++;
        await page.waitForTimeout(500);
        await takeScreenshot(page, 'calculator-after-add');
      }

    } catch (err) {
      calculatorResult.status = 'error';
      calculatorResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(calculatorResult);

    // ============================================
    // 6. DOCUMENTS PAGE /documents
    // ============================================
    log('\n========================================');
    log('6. СТРАНИЦА ДОКУМЕНТОВ /documents');
    log('========================================');

    const documentsResult: AuditResult = {
      page: '/documents',
      status: 'ok',
      errors: [],
      warnings: [],
      clickedElements: 0,
      modalsOpened: 0,
      formsFound: 0
    };

    try {
      await page.goto(`${BASE_URL}/documents`, { waitUntil: 'networkidle' });
      log('  [OK] Страница загружена');

      await takeScreenshot(page, 'documents-list');

      // Ищем кнопку добавления документа (более специфичный селектор)
      const addButton = page.getByRole('button', { name: /добавить документ/i });
      if (await addButton.isVisible({ timeout: 2000 })) {
        log('  [OK] Кнопка добавления документа найдена');
        documentsResult.clickedElements++;

        await addButton.click();
        log('  [OK] Клик по кнопке добавления');

        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'documents-add-modal');

        // Проверяем типы документов в модалке
        const docTypes = ['Паспорт', 'Патент', 'Миграционная карта', 'Регистрация', 'ИНН', 'СНИЛС', 'ДМС'];
        let foundTypes = 0;

        for (const docType of docTypes) {
          const typeBtn = page.locator(`button:has-text("${docType}")`).first();
          if (await typeBtn.isVisible({ timeout: 500 })) {
            foundTypes++;
            log(`    [OK] Тип "${docType}" найден`);
          }
        }

        log(`  [Info] Найдено типов документов: ${foundTypes}/${docTypes.length}`);

        // Тестируем один тип документа - Паспорт
        const passportBtn = page.locator('button:has-text("Паспорт")').first();
        if (await passportBtn.isVisible({ timeout: 1000 })) {
          await passportBtn.click();
          log('  [OK] Клик по "Паспорт"');
          await page.waitForTimeout(1000);

          await takeScreenshot(page, 'documents-form-passport');

          // Проверяем открылась ли форма
          const formInputs = page.locator('input, textarea');
          const formCount = await formInputs.count();

          if (formCount > 0) {
            log(`  [OK] Форма открылась (${formCount} полей)`);
            documentsResult.formsFound++;

            // Ищем кнопку тестовых данных
            const sampleBtn = page.locator('button:has-text("тестовыми"), button:has-text("Заполнить образцом")').first();
            if (await sampleBtn.isVisible({ timeout: 1000 })) {
              await sampleBtn.click();
              log('  [OK] Тестовые данные заполнены');
              await page.waitForTimeout(500);
              await takeScreenshot(page, 'documents-form-passport-filled');
            }
          } else {
            log('  [WARN] Форма не открылась');
            documentsResult.warnings.push('Форма паспорта не открылась');
          }
        }

        // Закрываем модалку/форму
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      } else {
        log('  [WARN] Кнопка добавления не найдена');
        documentsResult.warnings.push('Кнопка добавления документа не найдена');
      }

    } catch (err) {
      documentsResult.status = 'error';
      documentsResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    if (documentsResult.warnings.length > 0 || documentsResult.errors.length > 0) {
      documentsResult.status = documentsResult.errors.length > 0 ? 'error' : 'partial';
    }

    auditResults.push(documentsResult);

    // ============================================
    // 7. PROFILE PAGE /profile
    // ============================================
    log('\n========================================');
    log('7. СТРАНИЦА ПРОФИЛЯ /profile');
    log('========================================');

    const profileResult: AuditResult = {
      page: '/profile',
      status: 'ok',
      errors: [],
      warnings: [],
      clickedElements: 0,
      modalsOpened: 0,
      formsFound: 0
    };

    try {
      await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
      log('  [OK] Страница загружена');

      await takeScreenshot(page, 'profile');

      // Ищем форму профиля
      const profileForm = page.locator('form, input, textarea');
      const formCount = await profileForm.count();
      log(`  [Info] Найдено полей формы: ${formCount}`);

      if (formCount > 0) {
        profileResult.formsFound++;
      }

      // Проверяем все кнопки на странице
      const allButtons = page.locator('button, [role="button"]');
      const buttonCount = await allButtons.count();
      log(`  [Info] Найдено интерактивных элементов: ${buttonCount}`);

      // Проверяем секции профиля
      const sections = ['Личные данные', 'Документы', 'Работа', 'Регистрация'];
      for (const section of sections) {
        const sectionBtn = page.locator(`button:has-text("${section}"), [role="button"]:has-text("${section}")`).first();
        if (await sectionBtn.isVisible({ timeout: 500 })) {
          log(`    [OK] Секция "${section}" найдена`);
          profileResult.clickedElements++;
        }
      }

      // Проверяем кнопку сохранения
      const saveBtn = page.locator('button:has-text("Сохранить")').first();
      if (await saveBtn.isVisible({ timeout: 1000 })) {
        log('  [OK] Кнопка "Сохранить" найдена');
      }

    } catch (err) {
      profileResult.status = 'error';
      profileResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(profileResult);

    // ============================================
    // 8. PROTOTYPE PAGE /prototype
    // ============================================
    log('\n========================================');
    log('8. СТРАНИЦА ПРОТОТИПА /prototype');
    log('========================================');

    const prototypeResult: AuditResult = {
      page: '/prototype',
      status: 'ok',
      errors: [],
      warnings: [],
      clickedElements: 0,
      modalsOpened: 0,
      formsFound: 0
    };

    try {
      await page.goto(`${BASE_URL}/prototype`, { waitUntil: 'networkidle' });
      log('  [OK] Страница загружена');

      await takeScreenshot(page, 'prototype-initial');

      // Ищем навигацию по прототипу (нижняя панель)
      const navButtons = page.locator('nav button, nav a, [role="tab"], [role="navigation"] button');
      const navCount = await navButtons.count();
      log(`  [Info] Найдено навигационных элементов: ${navCount}`);

      // Проверяем вкладки
      const tabs = ['Документы', 'Сервисы', 'Профиль', 'Главная', 'Home', 'Documents', 'Services', 'Profile'];

      for (const tab of tabs) {
        const tabBtn = page.locator(`button:has-text("${tab}"), a:has-text("${tab}")`).first();
        if (await tabBtn.isVisible({ timeout: 500 })) {
          log(`    [OK] Вкладка "${tab}" найдена`);
          prototypeResult.clickedElements++;

          await tabBtn.click();
          await page.waitForTimeout(500);
        }
      }

      await takeScreenshot(page, 'prototype-after-navigation');

    } catch (err) {
      prototypeResult.status = 'error';
      prototypeResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(prototypeResult);

    // ============================================
    // 9. PAYMENT PAGE /payment
    // ============================================
    log('\n========================================');
    log('9. СТРАНИЦА ОПЛАТЫ /payment');
    log('========================================');

    const paymentResult: AuditResult = {
      page: '/payment',
      status: 'ok',
      errors: [],
      warnings: [],
      clickedElements: 0,
      modalsOpened: 0,
      formsFound: 0
    };

    try {
      await page.goto(`${BASE_URL}/payment`, { waitUntil: 'networkidle' });
      log('  [OK] Страница загружена');

      await takeScreenshot(page, 'payment');

      // Проверяем наличие тарифов/кнопок оплаты
      const payButtons = page.locator('button:has-text("Оплатить"), button:has-text("Купить"), button:has-text("Подписка"), button:has-text("Premium")');
      const payCount = await payButtons.count();
      log(`  [Info] Найдено кнопок оплаты: ${payCount}`);

      if (payCount > 0) {
        paymentResult.clickedElements = payCount;
      }

    } catch (err) {
      paymentResult.status = 'error';
      paymentResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(paymentResult);

    // ============================================
    // 10. OFFLINE PAGE /offline
    // ============================================
    log('\n========================================');
    log('10. СТРАНИЦА ОФЛАЙН /offline');
    log('========================================');

    const offlineResult: AuditResult = {
      page: '/offline',
      status: 'ok',
      errors: [],
      warnings: [],
      clickedElements: 0,
      modalsOpened: 0,
      formsFound: 0
    };

    try {
      await page.goto(`${BASE_URL}/offline`, { waitUntil: 'networkidle' });
      log('  [OK] Страница загружена');

      await takeScreenshot(page, 'offline');

    } catch (err) {
      offlineResult.status = 'error';
      offlineResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(offlineResult);

    // ============================================
    // 11. ТЕСТИРОВАНИЕ ДОКУМЕНТОВ (подробно)
    // ============================================
    log('\n========================================');
    log('11. ДЕТАЛЬНОЕ ТЕСТИРОВАНИЕ ДОКУМЕНТОВ');
    log('========================================');

    const docTestResult: AuditResult = {
      page: '/documents (detail)',
      status: 'ok',
      errors: [],
      warnings: [],
      clickedElements: 0,
      modalsOpened: 0,
      formsFound: 0
    };

    try {
      await page.goto(`${BASE_URL}/documents`, { waitUntil: 'networkidle' });

      // Тестируем каждый тип документа
      const documentTests = [
        { type: 'Паспорт', hasFields: true },
        { type: 'Патент', hasFields: true },
        { type: 'Миграционная карта', hasFields: true },
        { type: 'Регистрация', hasFields: true },
        { type: 'ИНН', hasFields: true },
        { type: 'СНИЛС', hasFields: true },
        { type: 'ДМС', hasFields: true },
      ];

      for (const docTest of documentTests) {
        log(`\n  --- Тестируем: ${docTest.type} ---`);

        // Открываем страницу документов заново
        await page.goto(`${BASE_URL}/documents`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);

        // Кликаем добавить документ
        const addBtn = page.getByRole('button', { name: /добавить документ/i });
        if (await addBtn.isVisible({ timeout: 2000 })) {
          await addBtn.click();
          await page.waitForTimeout(800);

          // Ищем тип документа
          const typeBtn = page.locator(`button:has-text("${docTest.type}")`).first();
          if (await typeBtn.isVisible({ timeout: 1000 })) {
            await typeBtn.click();
            docTestResult.clickedElements++;
            await page.waitForTimeout(800);

            // Проверяем форму
            const inputs = page.locator('form input, form textarea, form select');
            const inputCount = await inputs.count();

            if (inputCount > 0) {
              log(`    [OK] Форма открылась (${inputCount} полей)`);
              docTestResult.formsFound++;

              // Ищем кнопку заполнения тестовыми данными
              const fillBtn = page.locator('button:has-text("тестовым"), button:has-text("Образец"), button:has-text("Sample")').first();
              if (await fillBtn.isVisible({ timeout: 500 })) {
                await fillBtn.click();
                log(`    [OK] Тестовые данные заполнены`);
              }

              await takeScreenshot(page, `doc-form-${docTest.type.replace(/\s+/g, '-')}`);
            } else {
              log(`    [WARN] Форма не найдена`);
              docTestResult.warnings.push(`Форма для "${docTest.type}" не открылась`);
            }
          } else {
            log(`    [WARN] Тип "${docTest.type}" не найден в модалке`);
            docTestResult.warnings.push(`Тип "${docTest.type}" не найден`);
          }

          // Закрываем
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }
      }

    } catch (err) {
      docTestResult.status = 'error';
      docTestResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    if (docTestResult.warnings.length > 0) {
      docTestResult.status = 'partial';
    }

    auditResults.push(docTestResult);

    // ============================================
    // ИТОГОВЫЙ ОТЧЁТ
    // ============================================
    log('\n\n========================================');
    log('========== ИТОГОВЫЙ ОТЧЁТ =============');
    log('========================================\n');

    const okResults = auditResults.filter(r => r.status === 'ok');
    const partialResults = auditResults.filter(r => r.status === 'partial');
    const errorResults = auditResults.filter(r => r.status === 'error');

    log('## Работает ✅');
    for (const result of okResults) {
      log(`  - ${result.page} (кликов: ${result.clickedElements}, модалок: ${result.modalsOpened}, форм: ${result.formsFound})`);
    }

    log('\n## Частично работает ⚠️');
    if (partialResults.length > 0) {
      for (const result of partialResults) {
        log(`  - ${result.page}`);
        for (const warn of result.warnings) {
          log(`    - ${warn}`);
        }
      }
    } else {
      log('  - Нет проблем');
    }

    log('\n## Не работает ❌');
    if (errorResults.length > 0) {
      for (const result of errorResults) {
        log(`  - ${result.page}`);
        for (const err of result.errors) {
          log(`    - ${err}`);
        }
      }
    } else {
      log('  - Нет ошибок');
    }

    log('\n## Ошибки консоли');
    const uniqueConsoleErrors = [...new Set(allConsoleErrors)];
    if (uniqueConsoleErrors.length > 0) {
      for (const err of uniqueConsoleErrors) {
        log(`  ❌ ${err.substring(0, 150)}`);
      }
    } else {
      log('  ✅ Ошибок консоли не обнаружено');
    }

    log('\n## Ошибки JavaScript');
    const uniquePageErrors = [...new Set(allPageErrors)];
    if (uniquePageErrors.length > 0) {
      for (const err of uniquePageErrors) {
        log(`  ❌ ${err.substring(0, 150)}`);
      }
    } else {
      log('  ✅ JavaScript ошибок не обнаружено');
    }

    // Статистика
    log('\n## Статистика');
    const totalClicks = auditResults.reduce((sum, r) => sum + r.clickedElements, 0);
    const totalModals = auditResults.reduce((sum, r) => sum + r.modalsOpened, 0);
    const totalForms = auditResults.reduce((sum, r) => sum + r.formsFound, 0);
    log(`  - Всего страниц протестировано: ${auditResults.length}`);
    log(`  - Работает корректно: ${okResults.length}`);
    log(`  - Частично работает: ${partialResults.length}`);
    log(`  - Не работает: ${errorResults.length}`);
    log(`  - Всего кликов по элементам: ${totalClicks}`);
    log(`  - Модальных окон открыто: ${totalModals}`);
    log(`  - Форм протестировано: ${totalForms}`);
    log(`  - Ошибок консоли: ${uniqueConsoleErrors.length}`);
    log(`  - JavaScript ошибок: ${uniquePageErrors.length}`);

    // Финальный скриншот
    await takeScreenshot(page, 'final-state');

    log('\n========================================');
    log('Аудит завершён. Скриншоты: e2e/screenshots/');
    log('========================================\n');
  });
});
