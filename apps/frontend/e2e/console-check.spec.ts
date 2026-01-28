/**
 * Проверка ВСЕХ сообщений консоли при загрузке страницы
 */
import { test } from '@playwright/test';

test('Проверка консоли при загрузке /services', async ({ page }) => {
  const allLogs: { type: string; text: string; location?: string }[] = [];

  page.on('console', msg => {
    allLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()?.url,
    });
  });

  page.on('pageerror', err => {
    allLogs.push({
      type: 'pageerror',
      text: `${err.name}: ${err.message}`,
    });
  });

  page.on('requestfailed', req => {
    allLogs.push({
      type: 'requestfailed',
      text: `${req.url()} - ${req.failure()?.errorText}`,
    });
  });

  console.log('\n' + '='.repeat(70));
  console.log('📋 ПОЛНЫЙ ЛОГ КОНСОЛИ ПРИ ЗАГРУЗКЕ /services');
  console.log('='.repeat(70));

  await page.goto('http://localhost:3000/services');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Ждём полную загрузку

  console.log(`\nВсего сообщений: ${allLogs.length}\n`);

  // Группируем по типу
  const errors = allLogs.filter(l => l.type === 'error' || l.type === 'pageerror');
  const warnings = allLogs.filter(l => l.type === 'warning');
  const info = allLogs.filter(l => l.type === 'log' || l.type === 'info');
  const failed = allLogs.filter(l => l.type === 'requestfailed');

  console.log('🔴 ОШИБКИ (errors + pageerrors):');
  if (errors.length === 0) {
    console.log('   Нет ошибок');
  } else {
    errors.forEach(e => {
      const loc = e.location ? ` [${e.location}]` : '';
      console.log(`   ${e.text}${loc}`);
    });
  }

  console.log('\n🟡 ПРЕДУПРЕЖДЕНИЯ (warnings):');
  if (warnings.length === 0) {
    console.log('   Нет предупреждений');
  } else {
    warnings.forEach(w => {
      console.log(`   ${w.text.substring(0, 200)}`);
    });
  }

  console.log('\n🔵 ЛОГИ (log + info):');
  if (info.length === 0) {
    console.log('   Нет логов');
  } else {
    info.slice(0, 20).forEach(i => {
      console.log(`   ${i.text.substring(0, 150)}`);
    });
    if (info.length > 20) {
      console.log(`   ... и ещё ${info.length - 20} логов`);
    }
  }

  console.log('\n🔴 FAILED REQUESTS:');
  if (failed.length === 0) {
    console.log('   Нет failed requests');
  } else {
    failed.forEach(f => {
      console.log(`   ${f.text}`);
    });
  }

  // Проверяем критические ошибки
  console.log('\n' + '='.repeat(70));
  console.log('📊 АНАЛИЗ');
  console.log('='.repeat(70));

  const criticalErrors = errors.filter(e =>
    !e.text.includes('404') &&
    !e.text.includes('favicon')
  );

  if (criticalErrors.length > 0) {
    console.log('\n⚠️ НАЙДЕНЫ КРИТИЧЕСКИЕ ОШИБКИ:');
    criticalErrors.forEach(e => {
      console.log(`\n   ${e.type}: ${e.text}`);
      if (e.location) console.log(`   Файл: ${e.location}`);
    });
  } else {
    console.log('\n✅ Критических ошибок JavaScript не найдено');
    console.log('\n❓ Но React всё равно не гидратировался.');
    console.log('   Возможные причины:');
    console.log('   1. JavaScript бандл не загрузился');
    console.log('   2. Ошибка в инициализации Next.js');
    console.log('   3. Проблема с Webpack/Turbopack');
  }
});
