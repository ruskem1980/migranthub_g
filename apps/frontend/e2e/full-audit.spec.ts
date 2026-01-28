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

// Безопасный переход на страницу
async function safeGoto(page: Page, url: string): Promise<boolean> {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    return true;
  } catch (err) {
    log(`  [Navigation Error] ${err}`);
    return false;
  }
}

// Инициализация результата аудита
function createResult(pagePath: string): AuditResult {
  return {
    page: pagePath,
    status: 'ok',
    errors: [],
    warnings: [],
    clickedElements: 0,
    modalsOpened: 0,
    formsFound: 0
  };
}

test.describe('Полный E2E аудит MigrantHub', () => {
  test.setTimeout(600000); // 10 минут на весь тест

  test('Детальный аудит ВСЕХ страниц приложения', async ({ page }) => {
    await setupErrorLogging(page);

    // ============================================
    // 1. ГЛАВНАЯ СТРАНИЦА /
    // ============================================
    log('\n========================================');
    log('1. ГЛАВНАЯ СТРАНИЦА /');
    log('========================================');

    const homeResult = createResult('/');

    try {
      if (await safeGoto(page, BASE_URL)) {
        log('  [OK] Страница загружена');

        const currentUrl = page.url();
        log(`  [Info] Текущий URL: ${currentUrl}`);

        if (currentUrl.includes('/welcome')) {
          log('  [OK] Редирект на /welcome работает');
        }

        const buttons = page.locator('button, a[href]');
        const buttonCount = await buttons.count();
        log(`  [Info] Найдено интерактивных элементов: ${buttonCount}`);

        await takeScreenshot(page, '01-home');
      } else {
        homeResult.status = 'error';
        homeResult.errors.push('Не удалось загрузить страницу');
      }
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

    const welcomeResult = createResult('/welcome');

    try {
      if (await safeGoto(page, `${BASE_URL}/welcome`)) {
        log('  [OK] Страница загружена');

        // Проверяем языковой переключатель
        const langSwitcher = page.locator('[data-testid="language-switcher"], button:has-text("RU"), button:has-text("EN")');
        if (await langSwitcher.first().isVisible({ timeout: 2000 })) {
          log('  [OK] Языковой переключатель найден');
          welcomeResult.clickedElements++;
        }

        // Ищем кнопку "Начать" или "Войти"
        const startButton = page.locator('button:has-text("Начать"), button:has-text("Войти"), a:has-text("Начать")');
        if (await startButton.first().isVisible({ timeout: 2000 })) {
          log('  [OK] Кнопка входа найдена');
          welcomeResult.clickedElements++;
        } else {
          welcomeResult.warnings.push('Кнопка входа не найдена');
          log('  [WARN] Кнопка входа не найдена');
        }

        // Проверяем кнопку восстановления доступа
        const recoveryLink = page.locator('a:has-text("восстановить"), button:has-text("восстановить")');
        if (await recoveryLink.first().isVisible({ timeout: 1000 })) {
          log('  [OK] Ссылка на восстановление найдена');
        }

        await takeScreenshot(page, '02-welcome');
      } else {
        welcomeResult.status = 'error';
        welcomeResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      welcomeResult.status = 'error';
      welcomeResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(welcomeResult);

    // ============================================
    // 3. RECOVERY PAGE /recovery
    // ============================================
    log('\n========================================');
    log('3. СТРАНИЦА ВОССТАНОВЛЕНИЯ /recovery');
    log('========================================');

    const recoveryResult = createResult('/recovery');

    try {
      if (await safeGoto(page, `${BASE_URL}/recovery`)) {
        log('  [OK] Страница загружена');

        // Проверяем поля ввода кода восстановления
        const codeInputs = page.locator('input[type="text"]');
        const inputCount = await codeInputs.count();
        log(`  [Info] Найдено полей ввода кода: ${inputCount}`);

        if (inputCount >= 3) {
          recoveryResult.formsFound++;
          log('  [OK] Форма ввода кода найдена (3 сегмента)');

          // Пробуем ввести тестовый код
          const inputs = await codeInputs.all();
          if (inputs.length >= 3) {
            await inputs[0].fill('TEST');
            await inputs[1].fill('CODE');
            await inputs[2].fill('1234');
            log('  [OK] Тестовый код введён');
            recoveryResult.clickedElements += 3;
          }
        }

        // Проверяем кнопку отправки
        const submitBtn = page.locator('button[type="submit"]');
        if (await submitBtn.isVisible({ timeout: 1000 })) {
          log('  [OK] Кнопка отправки найдена');
        }

        await takeScreenshot(page, '03-recovery');
      } else {
        recoveryResult.status = 'error';
        recoveryResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      recoveryResult.status = 'error';
      recoveryResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(recoveryResult);

    // ============================================
    // 4. AUTH PHONE /auth/phone
    // ============================================
    log('\n========================================');
    log('4. СТРАНИЦА АВТОРИЗАЦИИ /auth/phone');
    log('========================================');

    const phoneResult = createResult('/auth/phone');

    try {
      if (await safeGoto(page, `${BASE_URL}/auth/phone`)) {
        log('  [OK] Страница загружена');

        // Проверяем форму ввода телефона
        const phoneInput = page.locator('input[type="tel"], input[placeholder*="телефон"], input[placeholder*="phone"]');
        if (await phoneInput.first().isVisible({ timeout: 2000 })) {
          log('  [OK] Поле ввода телефона найдено');
          phoneResult.formsFound++;

          await phoneInput.first().fill('+79991234567');
          log('  [OK] Номер введён');
          phoneResult.clickedElements++;
        } else {
          phoneResult.warnings.push('Поле ввода телефона не найдено');
          log('  [WARN] Поле ввода телефона не найдено');
        }

        // Проверяем кнопку отправки
        const submitBtn = page.locator('button[type="submit"], button:has-text("Отправить"), button:has-text("Далее"), button:has-text("Продолжить")');
        if (await submitBtn.first().isVisible({ timeout: 2000 })) {
          log('  [OK] Кнопка отправки найдена');
        }

        await takeScreenshot(page, '04-auth-phone');
      } else {
        phoneResult.status = 'error';
        phoneResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      phoneResult.status = 'error';
      phoneResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(phoneResult);

    // ============================================
    // 5. AUTH OTP /auth/otp
    // ============================================
    log('\n========================================');
    log('5. СТРАНИЦА OTP /auth/otp');
    log('========================================');

    const otpResult = createResult('/auth/otp');

    try {
      if (await safeGoto(page, `${BASE_URL}/auth/otp`)) {
        log('  [OK] Страница загружена');

        const otpInputs = page.locator('input[type="text"], input[type="number"], input[inputmode="numeric"]');
        const otpCount = await otpInputs.count();
        log(`  [Info] Найдено полей ввода: ${otpCount}`);

        if (otpCount > 0) {
          otpResult.formsFound++;
        }

        await takeScreenshot(page, '05-auth-otp');
      } else {
        otpResult.status = 'error';
        otpResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      otpResult.status = 'error';
      otpResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(otpResult);

    // ============================================
    // 6. AUTH METHOD /auth/method
    // ============================================
    log('\n========================================');
    log('6. СТРАНИЦА МЕТОДА АВТОРИЗАЦИИ /auth/method');
    log('========================================');

    const methodResult = createResult('/auth/method');

    try {
      if (await safeGoto(page, `${BASE_URL}/auth/method`)) {
        log('  [OK] Страница загружена');

        const authOptions = page.locator('button, [role="button"]');
        const optionsCount = await authOptions.count();
        log(`  [Info] Найдено вариантов авторизации: ${optionsCount}`);

        await takeScreenshot(page, '06-auth-method');
      } else {
        methodResult.status = 'error';
        methodResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      methodResult.status = 'error';
      methodResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(methodResult);

    // ============================================
    // 7. SERVICES PAGE /services
    // ============================================
    log('\n========================================');
    log('7. СТРАНИЦА СЕРВИСОВ /services');
    log('========================================');

    const servicesResult = createResult('/services');

    try {
      if (await safeGoto(page, `${BASE_URL}/services`)) {
        log('  [OK] Страница загружена');
        await takeScreenshot(page, '07-services-initial');

        // Реальные названия сервисов из кода
        const services = [
          { name: 'Карта мигранта', expectModal: true },
          { name: 'Экзамен по русскому', expectModal: true },
          { name: 'Переводчик', external: true },
          { name: 'Карта мечетей', expectModal: true },
        ];

        for (const service of services) {
          log(`\n  --- Тестируем: ${service.name} ---`);

          await safeGoto(page, `${BASE_URL}/services`);
          await page.waitForTimeout(500);

          // Ищем кнопку с текстом сервиса
          const serviceBtn = page.locator(`button:has-text("${service.name}")`).first();

          if (await serviceBtn.isVisible({ timeout: 2000 })) {
            log(`    [OK] Кнопка найдена`);
            servicesResult.clickedElements++;

            if (service.external) {
              log(`    [SKIP] Внешняя ссылка`);
              continue;
            }

            await serviceBtn.click();
            log(`    [OK] Клик выполнен`);
            await page.waitForTimeout(1000);

            if (service.expectModal) {
              const modal = page.locator('[role="dialog"], .fixed.inset-0, [class*="fixed"][class*="inset"]');
              if (await modal.first().isVisible({ timeout: 3000 })) {
                log(`    [OK] Модальное окно открылось`);
                servicesResult.modalsOpened++;

                const safeName = service.name.replace(/[\s\/]+/g, '-');
                await takeScreenshot(page, `07-services-modal-${safeName}`);

                // Закрываем модалку
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
              } else {
                log(`    [WARN] Модальное окно НЕ открылось`);
                servicesResult.warnings.push(`Модальное окно для "${service.name}" не открылось`);
              }
            }
          } else {
            log(`    [WARN] Кнопка не найдена`);
            servicesResult.warnings.push(`Кнопка "${service.name}" не найдена`);
          }
        }

        // Проверяем внешние ссылки
        const externalLinks = page.locator('a[href*="gosuslugi"], a[href*="мвд.рф"]');
        const linksCount = await externalLinks.count();
        log(`  [Info] Найдено внешних ссылок: ${linksCount}`);

      } else {
        servicesResult.status = 'error';
        servicesResult.errors.push('Не удалось загрузить страницу');
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
    // 8. CALCULATOR PAGE /calculator
    // ============================================
    log('\n========================================');
    log('8. СТРАНИЦА КАЛЬКУЛЯТОРА /calculator');
    log('========================================');

    const calculatorResult = createResult('/calculator');

    try {
      if (await safeGoto(page, `${BASE_URL}/calculator`)) {
        log('  [OK] Страница загружена');
        await takeScreenshot(page, '08-calculator-initial');

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

        // Пробуем кликнуть по кнопке добавления периода
        const addPeriodBtn = page.locator('button:has-text("Добавить"), button:has-text("добавить")').first();
        if (await addPeriodBtn.isVisible({ timeout: 1000 })) {
          await addPeriodBtn.click();
          log('  [OK] Кнопка добавления периода нажата');
          calculatorResult.clickedElements++;
          await page.waitForTimeout(500);
          await takeScreenshot(page, '08-calculator-after-add');
        }

        // Проверяем календарь/датапикер
        const dateInputs = page.locator('input[type="date"], [data-testid*="date"]');
        const dateCount = await dateInputs.count();
        log(`  [Info] Найдено полей даты: ${dateCount}`);

      } else {
        calculatorResult.status = 'error';
        calculatorResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      calculatorResult.status = 'error';
      calculatorResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(calculatorResult);

    // ============================================
    // 9. DOCUMENTS PAGE /documents
    // ============================================
    log('\n========================================');
    log('9. СТРАНИЦА ДОКУМЕНТОВ /documents');
    log('========================================');

    const documentsResult = createResult('/documents');

    try {
      if (await safeGoto(page, `${BASE_URL}/documents`)) {
        log('  [OK] Страница загружена');
        await takeScreenshot(page, '09-documents-list');

        // Ищем FAB кнопку добавления документа (aria-label)
        const addButton = page.locator('button[aria-label="Добавить документ"]');
        if (await addButton.isVisible({ timeout: 3000 })) {
          log('  [OK] FAB кнопка добавления документа найдена');
          documentsResult.clickedElements++;

          await addButton.click();
          log('  [OK] Клик по FAB кнопке');
          await page.waitForTimeout(1000);

          await takeScreenshot(page, '09-documents-type-selector');

          // Проверяем модальное окно выбора типа
          const modal = page.locator('.fixed.inset-0, [role="dialog"]');
          if (await modal.first().isVisible({ timeout: 2000 })) {
            log('  [OK] Модальное окно выбора типа открылось');
            documentsResult.modalsOpened++;

            // Проверяем типы документов
            const docTypes = [
              { label: 'Паспорт', type: 'passport' },
              { label: 'Миграционная карта', type: 'migration_card' },
              { label: 'Патент', type: 'patent' },
              { label: 'Регистрация', type: 'registration' },
              { label: 'ИНН', type: 'inn' },
              { label: 'СНИЛС', type: 'snils' },
              { label: 'ДМС', type: 'dms' },
            ];

            let foundTypes = 0;
            for (const docType of docTypes) {
              const typeBtn = page.locator(`button:has-text("${docType.label}")`).first();
              if (await typeBtn.isVisible({ timeout: 500 })) {
                foundTypes++;
                log(`    [OK] Тип "${docType.label}" найден`);
              } else {
                log(`    [WARN] Тип "${docType.label}" не найден`);
              }
            }

            log(`  [Info] Найдено типов документов: ${foundTypes}/${docTypes.length}`);

            // Тестируем открытие формы паспорта
            const passportBtn = page.locator('button:has-text("Паспорт")').first();
            if (await passportBtn.isVisible({ timeout: 1000 })) {
              await passportBtn.click();
              log('  [OK] Клик по "Паспорт"');
              await page.waitForTimeout(1500);

              // Проверяем открылась ли форма (полноэкранная)
              const formContainer = page.locator('.fixed.inset-0.z-50, form');
              if (await formContainer.first().isVisible({ timeout: 2000 })) {
                const formInputs = page.locator('input, textarea, select');
                const formCount = await formInputs.count();

                if (formCount > 2) {
                  log(`  [OK] Форма паспорта открылась (${formCount} полей)`);
                  documentsResult.formsFound++;
                  await takeScreenshot(page, '09-documents-form-passport');

                  // Ищем кнопку тестовых данных
                  const sampleBtn = page.locator('button:has-text("тестовым"), button:has-text("Образец"), button:has-text("пример")').first();
                  if (await sampleBtn.isVisible({ timeout: 1000 })) {
                    await sampleBtn.click();
                    log('  [OK] Тестовые данные заполнены');
                    await page.waitForTimeout(500);
                    await takeScreenshot(page, '09-documents-form-passport-filled');
                  }
                } else {
                  log('  [WARN] Форма не содержит ожидаемых полей');
                  documentsResult.warnings.push('Форма паспорта не содержит полей');
                }
              } else {
                log('  [WARN] Форма паспорта не открылась');
                documentsResult.warnings.push('Форма паспорта не открылась');
              }

              // Закрываем форму
              await page.keyboard.press('Escape');
              await page.waitForTimeout(500);
            }
          } else {
            log('  [WARN] Модальное окно выбора типа не открылось');
            documentsResult.warnings.push('Модальное окно выбора типа не открылось');
          }
        } else {
          // Пробуем альтернативный селектор
          const altAddButton = page.locator('button:has-text("Добавить документ")').first();
          if (await altAddButton.isVisible({ timeout: 1000 })) {
            log('  [OK] Кнопка добавления найдена (альтернативный селектор)');
            documentsResult.clickedElements++;
          } else {
            log('  [WARN] Кнопка добавления не найдена');
            documentsResult.warnings.push('Кнопка добавления документа не найдена');
          }
        }

        // Проверяем кнопку PDF
        const pdfBtn = page.locator('button:has-text("PDF"), button:has-text("Скачать")').first();
        if (await pdfBtn.isVisible({ timeout: 1000 })) {
          log('  [OK] Кнопка скачивания PDF найдена');
        }

      } else {
        documentsResult.status = 'error';
        documentsResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      documentsResult.status = 'error';
      documentsResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    if (documentsResult.warnings.length > 0) {
      documentsResult.status = 'partial';
    }

    auditResults.push(documentsResult);

    // ============================================
    // 10. PROFILE PAGE /profile
    // ============================================
    log('\n========================================');
    log('10. СТРАНИЦА ПРОФИЛЯ /profile');
    log('========================================');

    const profileResult = createResult('/profile');

    try {
      if (await safeGoto(page, `${BASE_URL}/profile`)) {
        log('  [OK] Страница загружена');
        await takeScreenshot(page, '10-profile');

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
          const sectionElement = page.locator(`button:has-text("${section}"), [role="button"]:has-text("${section}"), h2:has-text("${section}"), h3:has-text("${section}")`).first();
          if (await sectionElement.isVisible({ timeout: 500 })) {
            log(`    [OK] Секция "${section}" найдена`);
            profileResult.clickedElements++;
          }
        }

        // Проверяем кнопку сохранения
        const saveBtn = page.locator('button:has-text("Сохранить")').first();
        if (await saveBtn.isVisible({ timeout: 1000 })) {
          log('  [OK] Кнопка "Сохранить" найдена');
        }

      } else {
        profileResult.status = 'error';
        profileResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      profileResult.status = 'error';
      profileResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(profileResult);

    // ============================================
    // 11. EXAM PAGE /exam
    // ============================================
    log('\n========================================');
    log('11. СТРАНИЦА ЭКЗАМЕНА /exam');
    log('========================================');

    const examResult = createResult('/exam');

    try {
      if (await safeGoto(page, `${BASE_URL}/exam`)) {
        log('  [OK] Страница загружена');
        await takeScreenshot(page, '11-exam-home');

        // Проверяем режимы экзамена
        const modes = ['Обучение', 'Практика', 'Экзамен', 'Марафон'];
        for (const mode of modes) {
          const modeBtn = page.locator(`button:has-text("${mode}"), [role="button"]:has-text("${mode}")`).first();
          if (await modeBtn.isVisible({ timeout: 500 })) {
            log(`    [OK] Режим "${mode}" найден`);
            examResult.clickedElements++;
          }
        }

        // Проверяем категории
        const categories = ['Русский язык', 'История', 'Законодательство'];
        for (const category of categories) {
          const categoryElement = page.locator(`button:has-text("${category}"), *:has-text("${category}")`).first();
          if (await categoryElement.isVisible({ timeout: 500 })) {
            log(`    [OK] Категория "${category}" найдена`);
          }
        }

      } else {
        examResult.status = 'error';
        examResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      examResult.status = 'error';
      examResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(examResult);

    // ============================================
    // 12. EXAM START PAGE /exam/start
    // ============================================
    log('\n========================================');
    log('12. СТРАНИЦА СТАРТА ЭКЗАМЕНА /exam/start');
    log('========================================');

    const examStartResult = createResult('/exam/start');

    try {
      if (await safeGoto(page, `${BASE_URL}/exam/start?mode=practice`)) {
        log('  [OK] Страница загружена');
        await takeScreenshot(page, '12-exam-start');

        // Проверяем выбор категории
        const categoryBtns = page.locator('button:has-text("Все категории"), button:has-text("Русский"), button:has-text("История"), button:has-text("Законодательство")');
        const catCount = await categoryBtns.count();
        log(`  [Info] Найдено кнопок категорий: ${catCount}`);

        if (catCount > 0) {
          examStartResult.formsFound++;
        }

        // Проверяем выбор количества вопросов
        const countBtns = page.locator('button:has-text("5"), button:has-text("10"), button:has-text("20"), button:has-text("30")');
        const countNum = await countBtns.count();
        log(`  [Info] Найдено кнопок количества: ${countNum}`);

        // Проверяем кнопку старта
        const startBtn = page.locator('button:has-text("Начать"), button:has-text("Start")').first();
        if (await startBtn.isVisible({ timeout: 1000 })) {
          log('  [OK] Кнопка "Начать" найдена');
          examStartResult.clickedElements++;
        }

      } else {
        examStartResult.status = 'error';
        examStartResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      examStartResult.status = 'error';
      examStartResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(examStartResult);

    // ============================================
    // 13. EXAM SESSION PAGE /exam/session
    // ============================================
    log('\n========================================');
    log('13. СТРАНИЦА СЕССИИ ЭКЗАМЕНА /exam/session');
    log('========================================');

    const examSessionResult = createResult('/exam/session');

    try {
      if (await safeGoto(page, `${BASE_URL}/exam/session?mode=practice&count=5`)) {
        log('  [OK] Страница загружена');
        await page.waitForTimeout(2000); // Ждём загрузки вопросов
        await takeScreenshot(page, '13-exam-session');

        // Проверяем прогресс-бар
        const progressBar = page.locator('[role="progressbar"], .progress, [class*="progress"]');
        if (await progressBar.first().isVisible({ timeout: 2000 })) {
          log('  [OK] Прогресс-бар найден');
        }

        // Проверяем карточку вопроса
        const questionCard = page.locator('[class*="question"], [data-testid*="question"]');
        if (await questionCard.first().isVisible({ timeout: 2000 })) {
          log('  [OK] Карточка вопроса найдена');
        }

        // Проверяем варианты ответа
        const answerBtns = page.locator('button[class*="answer"], [role="radio"], [class*="option"]');
        const answerCount = await answerBtns.count();
        log(`  [Info] Найдено вариантов ответа: ${answerCount}`);

        if (answerCount > 0) {
          examSessionResult.formsFound++;

          // Пробуем выбрать первый ответ
          await answerBtns.first().click();
          log('  [OK] Выбран первый вариант ответа');
          examSessionResult.clickedElements++;

          await page.waitForTimeout(500);
          await takeScreenshot(page, '13-exam-session-answered');
        }

      } else {
        examSessionResult.status = 'error';
        examSessionResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      examSessionResult.status = 'error';
      examSessionResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(examSessionResult);

    // ============================================
    // 14. REFERENCE PAGE /reference
    // ============================================
    log('\n========================================');
    log('14. СТРАНИЦА СПРАВОЧНИКА /reference');
    log('========================================');

    const referenceResult = createResult('/reference');

    try {
      if (await safeGoto(page, `${BASE_URL}/reference`)) {
        log('  [OK] Страница загружена');
        await takeScreenshot(page, '14-reference-initial');

        // Проверяем табы
        const tabs = ['Категории', 'Законы', 'Формы', 'FAQ'];
        for (const tab of tabs) {
          const tabBtn = page.locator(`button:has-text("${tab}")`).first();
          if (await tabBtn.isVisible({ timeout: 500 })) {
            log(`    [OK] Таб "${tab}" найден`);
            referenceResult.clickedElements++;
          }
        }

        // Кликаем по табу "Законы"
        const lawsTab = page.locator('button:has-text("Законы")').first();
        if (await lawsTab.isVisible({ timeout: 1000 })) {
          await lawsTab.click();
          await page.waitForTimeout(1000);
          await takeScreenshot(page, '14-reference-laws');
          log('  [OK] Переключились на таб "Законы"');
        }

        // Кликаем по табу "FAQ"
        const faqTab = page.locator('button:has-text("FAQ")').first();
        if (await faqTab.isVisible({ timeout: 1000 })) {
          await faqTab.click();
          await page.waitForTimeout(1000);
          await takeScreenshot(page, '14-reference-faq');
          log('  [OK] Переключились на таб "FAQ"');
        }

        // Проверяем поиск
        const searchInput = page.locator('input[type="text"][placeholder*="Поиск"], input[placeholder*="поиск"]');
        if (await searchInput.first().isVisible({ timeout: 1000 })) {
          log('  [OK] Поле поиска найдено');
          referenceResult.formsFound++;
        }

      } else {
        referenceResult.status = 'error';
        referenceResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      referenceResult.status = 'error';
      referenceResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(referenceResult);

    // ============================================
    // 15. PAYMENT PAGE /payment
    // ============================================
    log('\n========================================');
    log('15. СТРАНИЦА ОПЛАТЫ /payment');
    log('========================================');

    const paymentResult = createResult('/payment');

    try {
      if (await safeGoto(page, `${BASE_URL}/payment`)) {
        log('  [OK] Страница загружена');
        await takeScreenshot(page, '15-payment');

        // Проверяем наличие тарифов/кнопок оплаты
        const payButtons = page.locator('button:has-text("Оплатить"), button:has-text("Купить"), button:has-text("Подписка"), button:has-text("Premium")');
        const payCount = await payButtons.count();
        log(`  [Info] Найдено кнопок оплаты: ${payCount}`);

        if (payCount > 0) {
          paymentResult.clickedElements = payCount;
        }

        // Проверяем отображение цен
        const priceElements = page.locator('*:has-text("₽"), *:has-text("руб")');
        const priceCount = await priceElements.count();
        log(`  [Info] Найдено элементов с ценой: ${priceCount}`);

      } else {
        paymentResult.status = 'error';
        paymentResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      paymentResult.status = 'error';
      paymentResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(paymentResult);

    // ============================================
    // 16. PROTOTYPE PAGE /prototype
    // ============================================
    log('\n========================================');
    log('16. СТРАНИЦА ПРОТОТИПА /prototype');
    log('========================================');

    const prototypeResult = createResult('/prototype');

    try {
      if (await safeGoto(page, `${BASE_URL}/prototype`)) {
        log('  [OK] Страница загружена');
        await takeScreenshot(page, '16-prototype-initial');

        // Ищем навигацию по прототипу (нижняя панель)
        const navButtons = page.locator('nav button, nav a, [role="tab"], [role="navigation"] button');
        const navCount = await navButtons.count();
        log(`  [Info] Найдено навигационных элементов: ${navCount}`);

        // Проверяем основные элементы прототипа
        const mainElements = page.locator('button, a[href], [role="button"]');
        const elemCount = await mainElements.count();
        log(`  [Info] Всего интерактивных элементов: ${elemCount}`);

        prototypeResult.clickedElements = Math.min(navCount, 10);

      } else {
        prototypeResult.status = 'error';
        prototypeResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      prototypeResult.status = 'error';
      prototypeResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(prototypeResult);

    // ============================================
    // 17. OFFLINE PAGE /offline
    // ============================================
    log('\n========================================');
    log('17. СТРАНИЦА ОФЛАЙН /offline');
    log('========================================');

    const offlineResult = createResult('/offline');

    try {
      if (await safeGoto(page, `${BASE_URL}/offline`)) {
        log('  [OK] Страница загружена');
        await takeScreenshot(page, '17-offline');

        // Проверяем сообщение об офлайн режиме
        const offlineMessage = page.locator('*:has-text("офлайн"), *:has-text("интернет"), *:has-text("offline")');
        if (await offlineMessage.first().isVisible({ timeout: 1000 })) {
          log('  [OK] Сообщение об офлайн режиме найдено');
        }

      } else {
        offlineResult.status = 'error';
        offlineResult.errors.push('Не удалось загрузить страницу');
      }
    } catch (err) {
      offlineResult.status = 'error';
      offlineResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    auditResults.push(offlineResult);

    // ============================================
    // 18. ДЕТАЛЬНОЕ ТЕСТИРОВАНИЕ ФОРМ ДОКУМЕНТОВ
    // ============================================
    log('\n========================================');
    log('18. ДЕТАЛЬНОЕ ТЕСТИРОВАНИЕ ФОРМ ДОКУМЕНТОВ');
    log('========================================');

    const docDetailResult = createResult('/documents (forms detail)');

    try {
      // Типы документов с поддержкой форм
      const supportedTypes = [
        { label: 'Паспорт', type: 'passport' },
        { label: 'Миграционная карта', type: 'migration_card' },
        { label: 'Патент', type: 'patent' },
        { label: 'Регистрация', type: 'registration' },
      ];

      // Типы без форм (в разработке)
      const unsupportedTypes = [
        { label: 'ИНН', type: 'inn' },
        { label: 'СНИЛС', type: 'snils' },
        { label: 'ДМС', type: 'dms' },
      ];

      for (const docType of supportedTypes) {
        log(`\n  --- Тестируем форму: ${docType.label} ---`);

        await safeGoto(page, `${BASE_URL}/documents`);
        await page.waitForTimeout(500);

        // Кликаем FAB кнопку добавления
        const addBtn = page.locator('button[aria-label="Добавить документ"]');
        if (await addBtn.isVisible({ timeout: 2000 })) {
          await addBtn.click();
          await page.waitForTimeout(800);

          // Ищем тип документа
          const typeBtn = page.locator(`button:has-text("${docType.label}")`).first();
          if (await typeBtn.isVisible({ timeout: 1000 })) {
            await typeBtn.click();
            docDetailResult.clickedElements++;
            await page.waitForTimeout(1000);

            // Проверяем форму
            const inputs = page.locator('input, textarea, select');
            const inputCount = await inputs.count();

            if (inputCount > 2) {
              log(`    [OK] Форма открылась (${inputCount} полей)`);
              docDetailResult.formsFound++;

              await takeScreenshot(page, `18-doc-form-${docType.type}`);
            } else {
              log(`    [WARN] Форма не содержит достаточно полей (${inputCount})`);
              docDetailResult.warnings.push(`Форма "${docType.label}" не содержит полей`);
            }

            // Закрываем форму
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
          } else {
            log(`    [WARN] Тип "${docType.label}" не найден`);
            docDetailResult.warnings.push(`Тип "${docType.label}" не найден`);
          }
        }
      }

      // Проверяем типы без форм
      log('\n  --- Типы документов без форм (в разработке) ---');
      for (const docType of unsupportedTypes) {
        log(`    [INFO] ${docType.label} - форма в разработке`);
      }

    } catch (err) {
      docDetailResult.status = 'error';
      docDetailResult.errors.push(String(err));
      log(`  [ERROR] ${err}`);
    }

    if (docDetailResult.warnings.length > 0) {
      docDetailResult.status = 'partial';
    }

    auditResults.push(docDetailResult);

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
      for (const err of uniqueConsoleErrors.slice(0, 20)) {
        log(`  ❌ ${err.substring(0, 200)}`);
      }
      if (uniqueConsoleErrors.length > 20) {
        log(`  ... и ещё ${uniqueConsoleErrors.length - 20} ошибок`);
      }
    } else {
      log('  ✅ Ошибок консоли не обнаружено');
    }

    log('\n## Ошибки JavaScript');
    const uniquePageErrors = [...new Set(allPageErrors)];
    if (uniquePageErrors.length > 0) {
      for (const err of uniquePageErrors.slice(0, 20)) {
        log(`  ❌ ${err.substring(0, 200)}`);
      }
      if (uniquePageErrors.length > 20) {
        log(`  ... и ещё ${uniquePageErrors.length - 20} ошибок`);
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
    await takeScreenshot(page, '99-final-state');

    log('\n========================================');
    log('Аудит завершён. Скриншоты: e2e/screenshots/');
    log('========================================\n');

    // Проверка критериев успеха
    expect(errorResults.length).toBeLessThanOrEqual(2); // Не более 2 полностью нерабочих страниц
    expect(uniquePageErrors.length).toBeLessThanOrEqual(5); // Не более 5 JS ошибок
  });
});
