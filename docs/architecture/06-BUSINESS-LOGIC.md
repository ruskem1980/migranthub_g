# Блок 6: Бизнес-логика и Монетизация

> Спецификация бизнес-логики MigrantHub

---

## Содержание

1. [Модель подписки](#1-модель-подписки)
2. [Система уведомлений](#2-система-уведомлений)
3. [Онбординг](#3-онбординг)
4. [Мониторинг законодательства](#4-мониторинг-законодательства)
5. [Партнёрства](#5-партнёрства)
6. [Roadmap развития](#6-roadmap-развития)

---

## 1. Модель подписки

### 1.1 Subscription Plans

```typescript
// config/subscription-plans.ts

export const subscriptionPlans = {
  free: {
    id: 'free',
    price: { monthly: 0, yearly: 0 },
    name: { ru: 'Базовый', uz: 'Asosiy', tg: 'Асосӣ', ky: 'Негизги', en: 'Basic' },

    features: {
      documents: 3,              // Max documents
      aiQuestions: 5,            // Per day
      backup: false,
      smartReminders: false,     // Basic reminders only
      legalUpdates: false,
      prioritySupport: false,
      familyMembers: 0
    },

    // Always free - critical for safety
    alwaysFree: [
      'deadlineCalculator',      // 90/180, registration, etc.
      'criticalAlerts',          // Urgent deadline warnings
      'legalReference',          // Basic law reference
      'emergencyContacts'        // УФМС, embassy contacts
    ]
  },

  plus: {
    id: 'plus',
    price: { monthly: 9900, yearly: 79000 }, // kopecks (99₽ / 790₽)
    name: { ru: 'Плюс', uz: 'Plus', tg: 'Плюс', ky: 'Плюс', en: 'Plus' },

    features: {
      documents: 'unlimited',
      aiQuestions: 30,
      backup: true,
      backupSizeMb: 500,
      smartReminders: true,
      legalUpdates: true,
      prioritySupport: false,
      familyMembers: 0
    }
  },

  pro: {
    id: 'pro',
    price: { monthly: 24900, yearly: 199000 }, // 249₽ / 1990₽
    name: { ru: 'Про', uz: 'Pro', tg: 'Про', ky: 'Про', en: 'Pro' },

    features: {
      documents: 'unlimited',
      aiQuestions: 'unlimited',
      backup: true,
      backupSizeMb: 1024,
      backupVersions: 5,
      smartReminders: true,
      legalUpdates: true,
      priorityLawAlerts: true,   // First to know about changes
      prioritySupport: true,
      familyMembers: 2
    },

    recommended: true
  }
};
```

### 1.2 Pay-per-Use Options

```typescript
// config/pay-per-use.ts

export const payPerUseProducts = {
  aiPacks: {
    small: {
      id: 'ai_pack_10',
      questions: 10,
      price: 4900,  // 49₽
      name: { ru: '10 вопросов AI' }
    },
    medium: {
      id: 'ai_pack_30',
      questions: 30,
      price: 9900,  // 99₽
      name: { ru: '30 вопросов AI' }
    },
    large: {
      id: 'ai_pack_100',
      questions: 100,
      price: 24900, // 249₽
      name: { ru: '100 вопросов AI' }
    }
  },

  backup: {
    id: 'cloud_safe',
    price: 9900,  // 99₽/month
    sizeMb: 500,
    name: { ru: 'Cloud Safe' }
  },

  oneTime: {
    documentCheck: {
      id: 'document_check',
      price: 14900, // 149₽
      name: { ru: 'Проверка документов AI' },
      description: 'AI проверит комплектность ваших документов'
    },
    legalConsultation: {
      id: 'legal_consultation',
      price: 99000, // 990₽
      name: { ru: 'Консультация юриста' },
      description: 'Запись к партнёру-юристу'
    }
  }
};
```

### 1.3 Special Discounts

```typescript
// config/discounts.ts

export const discountPrograms = {
  // Students - 50% off
  student: {
    discount: 50,
    verification: 'student_id',
    applicablePlans: ['plus', 'pro']
  },

  // Large families - 30% off
  largeFamily: {
    discount: 30,
    verification: 'self_declared',
    applicablePlans: ['plus', 'pro']
  },

  // First month free trial
  trial: {
    type: 'free_trial',
    days: 7,
    plan: 'pro'
  },

  // Yearly discount (built into pricing)
  yearly: {
    discount: 33
  },

  // Referral program
  referral: {
    referrer: { freeMonths: 1 },
    referee: { discount: 30, firstMonthOnly: true }
  },

  // Diaspora partnerships
  diasporaPartner: {
    discount: 20,
    codes: {
      'UZBEK20': 'Uzbek Diaspora',
      'TAJIK20': 'Tajik Diaspora',
      'KYRGYZ20': 'Kyrgyz Diaspora'
    }
  }
};
```

### 1.4 Regional Pricing

```typescript
// config/regional-pricing.ts

// Adjusted based on average incomes in origin countries
export const regionalPricing = {
  base: 'RU',

  adjustments: {
    'UZ': 0.8,   // 80% of base price
    'TJ': 0.7,   // 70% of base price
    'KG': 0.75   // 75% of base price
  },

  // Apply adjustment based on citizenship, not IP
  // (User might be in Russia but we want to keep it affordable)
  getPrice(planId: string, citizenship: string): number {
    const plan = subscriptionPlans[planId];
    const adjustment = this.adjustments[citizenship] || 1;
    return Math.round(plan.price.monthly * adjustment);
  }
};
```

### 1.5 Conversion Triggers

```typescript
// services/conversion.ts

export const conversionTriggers = {
  // When user tries to add 4th document
  documentLimit: {
    trigger: 'user_tries_to_add_document',
    condition: (user) => user.documentCount >= 3 && user.plan === 'free',
    offer: {
      plan: 'plus',
      message: 'Добавьте безлимитные документы за 99₽/мес',
      discount: 'FIRST50' // 50% off first month
    }
  },

  // When daily AI limit reached
  aiLimit: {
    trigger: 'ai_quota_exceeded',
    condition: (user) => user.aiQuestionsToday >= 5 && user.plan === 'free',
    offer: {
      product: 'ai_pack_10',
      message: 'Вопросы закончились. Купите пакет 10 вопросов за 49₽'
    }
  },

  // When user has 5+ documents (needs backup)
  backupNeed: {
    trigger: 'document_added',
    condition: (user) => user.documentCount >= 5 && !user.hasBackup,
    offer: {
      product: 'cloud_safe',
      message: 'Защитите документы — включите Cloud Safe'
    }
  },

  // After 7 days of active use
  engagedUser: {
    trigger: 'app_opened',
    condition: (user) => user.activeDays >= 7 && user.plan === 'free',
    offer: {
      type: 'trial',
      message: 'Попробуйте Pro бесплатно 7 дней'
    }
  }
};
```

---

## 2. Система уведомлений

### 2.1 Notification Types

```typescript
// config/notification-types.ts

export const notificationTypes = {
  deadline: {
    priority: 'high',
    channels: ['push', 'telegram', 'inapp'],
    escalation: true,

    subtypes: {
      registration: {
        reminderDays: [7, 3, 1, 0],
        criticality: 'critical'
      },
      patent_payment: {
        reminderDays: [30, 14, 7, 3, 1, 0],
        criticality: 'critical'
      },
      '90_180': {
        reminderDays: [14, 7, 3, 1, 0],
        criticality: 'critical'
      },
      document_expiry: {
        reminderDays: [30, 14, 7, 1],
        criticality: 'important'
      }
    }
  },

  legalUpdate: {
    priority: 'medium',
    channels: ['push', 'inapp'],

    subtypes: {
      critical: { immediate: true, channels: ['push', 'telegram', 'inapp'] },
      important: { channels: ['push', 'inapp'] },
      info: { channels: ['inapp'] }
    }
  },

  payment: {
    priority: 'normal',
    channels: ['push', 'inapp'],

    subtypes: {
      subscription_expiring: { reminderDays: [7, 3, 1] },
      payment_failed: { immediate: true },
      payment_success: { immediate: true }
    }
  },

  system: {
    priority: 'low',
    channels: ['inapp']
  }
};
```

### 2.2 Smart Notification Scheduler

```typescript
// services/smart-notifications.ts

export class SmartNotificationScheduler {
  // Find optimal send time based on user behavior
  async getOptimalSendTime(
    userId: string,
    priority: 'critical' | 'high' | 'normal' | 'low'
  ): Promise<Date> {
    const behavior = await this.getUserBehavior(userId);

    // For critical - send immediately (respecting quiet hours)
    if (priority === 'critical') {
      return this.respectQuietHours(new Date(), behavior);
    }

    // Find user's most active hours
    const activeHours = behavior.mostActiveHours; // e.g., [9, 10, 19, 20]

    // Find next active hour
    const now = new Date();
    const currentHour = now.getHours();

    const nextActiveHour = activeHours.find(h => h > currentHour) || activeHours[0];

    const sendTime = new Date();
    if (nextActiveHour <= currentHour) {
      sendTime.setDate(sendTime.getDate() + 1);
    }
    sendTime.setHours(nextActiveHour, 0, 0, 0);

    return this.respectQuietHours(sendTime, behavior);
  }

  // Escalation if not read
  async scheduleEscalation(notification: Notification): Promise<void> {
    const escalationPlan = [
      { delay: 4 * 60 * 60 * 1000, channel: 'telegram', condition: 'not_read' },
      { delay: 12 * 60 * 60 * 1000, channel: 'sms', condition: 'not_read' }
    ];

    for (const step of escalationPlan) {
      await this.scheduleJob({
        type: 'escalation',
        notificationId: notification.id,
        channel: step.channel,
        executeAt: new Date(Date.now() + step.delay),
        condition: step.condition
      });
    }
  }

  // Group nearby notifications
  async groupNotifications(userId: string): Promise<NotificationGroup[]> {
    const pending = await this.getPendingNotifications(userId);

    // Group notifications within 1 hour
    const groups: NotificationGroup[] = [];

    for (const notification of pending) {
      const existingGroup = groups.find(g =>
        Math.abs(g.scheduledFor.getTime() - notification.scheduledFor.getTime()) < 3600000
      );

      if (existingGroup) {
        existingGroup.notifications.push(notification);
      } else {
        groups.push({
          scheduledFor: notification.scheduledFor,
          notifications: [notification]
        });
      }
    }

    // Create summary for groups with multiple notifications
    return groups.map(g => {
      if (g.notifications.length > 1) {
        return {
          type: 'summary',
          title: `${g.notifications.length} напоминания`,
          body: g.notifications.map(n => n.title).join('\n'),
          notifications: g.notifications
        };
      }
      return g.notifications[0];
    });
  }
}
```

### 2.3 Contextual Message Templates

```typescript
// config/notification-templates.ts

export const notificationTemplates = {
  patent_payment: {
    30: {
      title: { ru: 'Оплата патента через месяц' },
      body: { ru: 'Следующий платёж {date}. Сумма: {amount}₽' },
      action: { screen: 'patent_payment_guide' }
    },
    7: {
      title: { ru: '⚠️ Патент: осталась неделя' },
      body: { ru: 'Оплатите до {date}, иначе патент аннулируется' },
      action: { screen: 'patent_payment', urgent: true }
    },
    1: {
      title: { ru: '🚨 Патент: оплата завтра!' },
      body: { ru: 'Завтра последний день оплаты. Не откладывайте!' },
      action: { screen: 'patent_payment', urgent: true }
    },
    0: {
      title: { ru: '❗ Патент: оплата сегодня!' },
      body: { ru: 'Сегодня последний день. Срочно оплатите патент!' },
      action: { screen: 'patent_payment', urgent: true }
    }
  },

  registration: {
    5: {
      title: { ru: 'Регистрация через 5 дней' },
      body: { ru: 'Не забудьте встать на учёт по месту пребывания' },
      action: { screen: 'registration_guide' }
    },
    1: {
      title: { ru: '🚨 Регистрация завтра!' },
      body: { ru: 'Без регистрации — штраф до 7000₽ или выдворение' },
      action: { screen: 'registration_places' }
    }
  },

  stay_limit: {
    14: {
      title: { ru: 'До конца срока пребывания: 14 дней' },
      body: { ru: 'Вы в России {daysUsed} дней. Осталось {daysRemaining}' },
      action: { screen: 'stay_calculator' }
    },
    3: {
      title: { ru: '⚠️ Осталось 3 дня!' },
      body: { ru: 'Покиньте Россию или оформите продление' },
      action: { screen: 'overstay_options' }
    }
  }
};
```

---

## 3. Онбординг

### 3.1 Onboarding Flow

```typescript
// config/onboarding-flow.ts

export const onboardingFlow = {
  version: '2.0',

  // Phase 1: Build Trust (2 screens)
  phase1_trust: [
    {
      id: 'welcome',
      type: 'hero',
      content: {
        title: { ru: 'Все сроки под контролем' },
        subtitle: { ru: 'Не пропустите ни одного дедлайна' },
        animation: 'welcome.json'
      }
    },
    {
      id: 'privacy',
      type: 'trust_builder',
      content: {
        title: { ru: 'Ваша безопасность — приоритет' },
        points: [
          { icon: '🔒', text: { ru: 'Данные только на вашем телефоне' } },
          { icon: '🚫', text: { ru: 'Не передаём третьим лицам' } },
          { icon: '✈️', text: { ru: 'Работает без интернета' } }
        ],
        socialProof: { rating: 4.8, reviews: 12500 }
      }
    }
  ],

  // Phase 2: Quick Value (3 questions → immediate result)
  phase2_value: [
    {
      id: 'citizenship',
      type: 'select',
      required: true,
      content: {
        question: { ru: 'Откуда вы?' },
        options: [
          { value: 'UZ', label: 'Узбекистан', flag: '🇺🇿' },
          { value: 'TJ', label: 'Таджикистан', flag: '🇹🇯' },
          { value: 'KG', label: 'Кыргызстан', flag: '🇰🇬' },
          { value: 'other', label: 'Другое', flag: '🌍' }
        ]
      }
    },
    {
      id: 'entry_date',
      type: 'date',
      required: true,
      content: {
        question: { ru: 'Когда въехали в Россию?' },
        hint: { ru: 'Дата в миграционной карте' },
        quickOptions: [
          { label: 'Сегодня', value: 'today' },
          { label: 'На этой неделе', value: 'this_week' }
        ]
      }
    },
    {
      id: 'instant_result',
      type: 'value_reveal',
      content: (data) => ({
        title: getResultTitle(data),
        deadlines: calculateDeadlines(data).slice(0, 3),
        cta: { ru: 'Продолжить настройку' }
      })
    }
  ],

  // Phase 3: Complete Profile (optional, skippable)
  phase3_complete: [
    {
      id: 'purpose',
      type: 'select',
      skippable: true,
      content: {
        question: { ru: 'Зачем приехали?' },
        options: [
          { value: 'work', label: 'Работа', icon: '💼' },
          { value: 'study', label: 'Учёба', icon: '📚' },
          { value: 'family', label: 'К семье', icon: '👨‍👩‍👧' }
        ]
      }
    },
    {
      id: 'region',
      type: 'search_select',
      skippable: true,
      content: {
        question: { ru: 'В каком регионе живёте?' },
        popular: ['Москва', 'Санкт-Петербург', 'Московская область']
      }
    },
    {
      id: 'notifications',
      type: 'permission',
      content: {
        title: { ru: 'Включить напоминания?' },
        benefit: { ru: 'Напомним за 7 дней до каждого дедлайна' }
      }
    }
  ],

  // Completion
  completion: {
    id: 'done',
    type: 'celebration',
    content: {
      title: { ru: '🎉 Готово!' },
      subtitle: { ru: 'Вы защищены от просрочек' }
    }
  }
};
```

### 3.2 A/B Testing

```typescript
// services/onboarding-ab.ts

export class OnboardingABTest {
  private experiments = {
    'welcome_message': {
      control: { title: 'Все сроки под контролем' },
      variant_a: { title: 'Защитите себя от штрафов' },
      variant_b: { title: 'Ваш помощник в России' }
    },

    'flow_length': {
      control: 'full',           // All steps
      variant_a: 'minimal',      // 3 steps only
      variant_b: 'progressive'   // Start minimal, expand later
    }
  };

  getVariant(experimentId: string, userId: string): string {
    // Stable bucketing based on userId hash
    const hash = this.hashCode(userId + experimentId);
    const bucket = hash % 100;

    if (bucket < 33) return 'control';
    if (bucket < 66) return 'variant_a';
    return 'variant_b';
  }

  async trackCompletion(
    userId: string,
    experiments: Record<string, string>,
    completed: boolean
  ): Promise<void> {
    await analytics.track('onboarding_completion', {
      userId: hash(userId),
      experiments,
      completed,
      timestamp: new Date()
    });
  }
}
```

---

## 4. Мониторинг законодательства

### 4.1 Source Monitoring

```typescript
// services/legal-monitor.ts

export class LegalMonitor {
  private sources = [
    {
      name: 'Consultant+',
      type: 'rss',
      url: 'http://www.consultant.ru/rss/hotdocs.xml',
      filter: ['миграц', 'иностран', 'патент', 'РВП', 'ВНЖ']
    },
    {
      name: 'GARANT',
      type: 'rss',
      url: 'https://www.garant.ru/rss/',
      filter: ['115-ФЗ', '109-ФЗ', 'миграц']
    },
    {
      name: 'MVD',
      type: 'scrape',
      url: 'https://мвд.рф/mvd/structure1/Glavnie_upravlenija/guvm',
      selector: '.news-item'
    }
  ];

  @Cron('0 */2 * * *') // Every 2 hours
  async monitorSources(): Promise<void> {
    const changes: DetectedChange[] = [];

    for (const source of this.sources) {
      try {
        const updates = await this.fetchSource(source);
        const newUpdates = await this.filterNew(updates, source.lastCheck);
        changes.push(...newUpdates);
      } catch (error) {
        await this.reportSourceError(source, error);
      }
    }

    if (changes.length > 0) {
      await this.processChanges(changes);
    }
  }

  private async processChanges(changes: DetectedChange[]): Promise<void> {
    for (const change of changes) {
      // 1. AI analysis
      const analysis = await this.analyzeChange(change);

      // 2. Classification
      const impact = await this.classifyImpact(analysis);

      // 3. Create draft for review
      const draft = await this.createDraft({
        change,
        analysis,
        impact,
        status: impact.criticality === 'critical' ? 'urgent_review' : 'pending_review'
      });

      // 4. Notify team
      await this.notifyTeam(draft);

      // 5. Escalate critical
      if (impact.criticality === 'critical') {
        await this.escalateToCTO(draft);
      }
    }
  }
}
```

### 4.2 AI Analysis

```typescript
// services/legal-ai-analyzer.ts

export class LegalAIAnalyzer {
  async analyzeChange(document: LegalDocument): Promise<ChangeAnalysis> {
    const text = await this.extractText(document);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Ты — эксперт по миграционному законодательству России.
            Проанализируй изменение и определи:
            1. Тип изменения (новый закон, поправка, разъяснение)
            2. Затронутые категории мигрантов
            3. Критичность (critical/important/info)
            4. Краткое описание для пользователей
            5. Требуемые действия пользователей (если есть)
            6. Влияет ли на расчёты сроков

            Ответь в JSON формате.`
        },
        { role: 'user', content: text }
      ],
      temperature: 0.1
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async classifyImpact(analysis: ChangeAnalysis): Promise<ImpactClassification> {
    return {
      affectedUsers: {
        citizenships: analysis.affectedCitizenships || ['all'],
        purposes: analysis.affectedPurposes || ['all'],
        regions: analysis.affectedRegions || ['all']
      },
      criticality: this.assessCriticality(analysis),
      requiresImmediateNotification: analysis.affectsDeadlines,
      requiresAppUpdate: analysis.requiresCalculationChange
    };
  }

  private assessCriticality(analysis: ChangeAnalysis): Criticality {
    if (analysis.affectsDeadlines || analysis.affectsPenalties) {
      return 'critical';
    }
    if (analysis.newRequirements || analysis.formChanges) {
      return 'important';
    }
    return 'info';
  }
}
```

### 4.3 User Notification

```typescript
// services/legal-notifier.ts

export class LegalNotifier {
  async notifyAffectedUsers(
    draft: UpdateDraft,
    version: LawVersion
  ): Promise<void> {
    const { affectedUsers, criticality } = draft.impact;

    // Find affected users
    const users = await db.users.findMany({
      where: {
        OR: [
          { citizenship_code: { in: affectedUsers.citizenships } },
          { purpose: { in: affectedUsers.purposes } },
          { region_code: { in: affectedUsers.regions } }
        ]
      }
    });

    // Different strategy by criticality
    if (criticality === 'critical') {
      // Immediate: push + telegram + in-app
      await this.sendBulkNotification(users, {
        type: 'legal_update',
        criticality,
        title: draft.title,
        body: draft.summary,
        channels: ['push', 'telegram', 'inapp'],
        priority: 'high'
      });
    } else if (criticality === 'important') {
      // Smart timing: push + in-app
      await this.scheduleSmartNotification(users, {
        type: 'legal_update',
        criticality,
        title: draft.title,
        body: draft.summary,
        channels: ['push', 'inapp']
      });
    } else {
      // In-app only on next open
      await this.createInAppNotification(users, {
        type: 'legal_update',
        criticality,
        title: draft.title,
        body: draft.summary
      });
    }
  }
}
```

---

## 5. Партнёрства

### 5.1 B2B Platform

```typescript
// services/b2b-platform.ts

export class B2BPlatform {
  // Employer registration
  async createEmployerAccount(data: EmployerRegistration): Promise<Employer> {
    // Verify company
    const verified = await this.verifyCompany(data.inn, data.ogrn);

    return db.employers.create({
      data: {
        ...data,
        verified,
        plan: 'trial', // 14 days free
        apiKey: generateApiKey()
      }
    });
  }

  // Employee status check (with consent)
  async checkEmployeeStatus(
    apiKey: string,
    employeeConsent: ConsentToken
  ): Promise<EmployeeStatus> {
    const employer = await this.validateApiKey(apiKey);
    const consent = await this.validateConsent(employeeConsent);

    // Return only what consent allows
    // NO PII - only status
    return {
      workPermitValid: consent.includes('work_permit')
        ? await this.checkWorkPermit(consent.userId) : null,
      registrationValid: consent.includes('registration')
        ? await this.checkRegistration(consent.userId) : null,
      patentPaid: consent.includes('patent')
        ? await this.checkPatentPayment(consent.userId) : null,
      upcomingDeadlines: consent.includes('deadlines')
        ? await this.getUpcomingDeadlines(consent.userId) : null
    };
  }

  // Employer pricing
  employerPlans = {
    starter: { price: 99000, employees: 10 },     // 990₽/month
    business: { price: 499000, employees: 100 },  // 4990₽/month
    enterprise: { price: 'custom', employees: 'unlimited' }
  };
}
```

### 5.2 Diaspora Partnerships

```typescript
// services/diaspora-partnerships.ts

export class DiasporaPartnerships {
  async createPartnership(diaspora: DiasporaOrganization): Promise<Partnership> {
    return db.partnerships.create({
      data: {
        type: 'diaspora',
        organization: diaspora.name,
        country: diaspora.country,
        benefits: {
          memberDiscount: 20,
          promoCode: `${diaspora.code}20`,
          customBranding: diaspora.plan === 'premium'
        },
        revenueShare: 15 // % from subscriptions via promo
      }
    });
  }

  // Embeddable widget for diaspora websites
  generateWidget(partnerId: string): WidgetConfig {
    return {
      embedCode: `<iframe src="https://migranthub.ru/embed/${partnerId}" />`,
      features: ['deadline_calculator', 'document_checklist'],
      branding: {
        logo: partner.logo,
        colors: partner.colors
      }
    };
  }
}
```

### 5.3 White-Label for Banks

```typescript
// services/white-label.ts

export class WhiteLabelService {
  async createWhiteLabelApp(bank: BankPartner): Promise<WhiteLabelConfig> {
    return {
      appName: `${bank.name} Мигрант`,
      bundleId: `ru.${bank.code}.migrant`,

      branding: {
        logo: bank.logo,
        primaryColor: bank.color,
        splashScreen: bank.splash
      },

      features: {
        // Base MigrantHub features
        documents: true,
        deadlines: true,
        ai: true,

        // Bank integration
        bankAccount: true,
        bankTransfers: true,
        bankCards: true
      },

      revenueModel: {
        type: 'license',
        monthlyFee: 5000000,  // 50,000₽
        perUserFee: 1000      // 10₽
      }
    };
  }
}
```

---

## 6. Roadmap развития

### 6.1 Phase 1: Foundation (Months 0-12)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 1: FOUNDATION                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TIMELINE: 0-12 months                                                       │
│  FOCUS: Russia, labor migrants from CIS                                      │
│                                                                              │
│  GOALS:                                                                      │
│  ├── Users: 100,000                                                         │
│  ├── D30 Retention: 40%                                                     │
│  ├── NPS: 50+                                                               │
│  └── Revenue: Breakeven                                                     │
│                                                                              │
│  FEATURES:                                                                   │
│  ├── Documents management                                                   │
│  ├── Deadline calculator & reminders                                        │
│  ├── AI assistant                                                           │
│  ├── Multi-channel notifications                                            │
│  ├── Cloud Safe backup                                                      │
│  └── Legal reference                                                        │
│                                                                              │
│  PLATFORMS:                                                                  │
│  ├── iOS (App Store)                                                        │
│  ├── Android (Google Play + RuStore)                                        │
│  └── PWA                                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Phase 2: Expansion (Months 12-24)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 2: EXPANSION                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TIMELINE: 12-24 months                                                      │
│                                                                              │
│  GOALS:                                                                      │
│  ├── Users: 500,000                                                         │
│  ├── B2B clients: 100 employers                                             │
│  └── Revenue: 50M ₽/year                                                    │
│                                                                              │
│  NEW B2C FEATURES:                                                          │
│  ├── Money transfers comparison                                             │
│  ├── Migrant banking partnerships                                           │
│  ├── Insurance (DMC)                                                        │
│  ├── Job marketplace                                                        │
│  ├── Language courses                                                       │
│  ├── Community (regional chats)                                             │
│  └── Legal consultation booking                                             │
│                                                                              │
│  B2B FEATURES:                                                               │
│  ├── Employer dashboard                                                     │
│  ├── HR system integration                                                  │
│  ├── Compliance API                                                         │
│  └── White-label offering                                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Phase 3: Ecosystem (Months 24-36+)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 3: ECOSYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TIMELINE: 24-36 months                                                      │
│                                                                              │
│  GOALS:                                                                      │
│  ├── Users: 2,000,000                                                       │
│  ├── Countries: 5                                                           │
│  └── Revenue: 500M ₽/year                                                   │
│                                                                              │
│  FINTECH:                                                                    │
│  ├── Migrant card (card issuance)                                           │
│  ├── Salary advance                                                         │
│  ├── Micro-loans                                                            │
│  ├── Savings                                                                │
│  ├── Remittance wallet                                                      │
│  └── Cross-border payments                                                  │
│                                                                              │
│  GLOBAL EXPANSION:                                                           │
│  ├── CIS → Russia (scale)                                                   │
│  ├── CIS → Kazakhstan                                                       │
│  ├── CIS → Turkey                                                           │
│  ├── SEA → GCC                                                              │
│  └── Franchise model                                                        │
│                                                                              │
│  PLATFORM:                                                                   │
│  ├── API platform for third parties                                         │
│  └── Developer ecosystem                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.4 Key Metrics

```typescript
// config/metrics.ts

export const keyMetrics = {
  // North Star
  northStar: 'Количество мигрантов, избежавших проблем благодаря приложению',

  // Acquisition
  acquisition: {
    downloads: 'App downloads',
    registrations: 'Completed registrations',
    cac: 'Customer acquisition cost'
  },

  // Activation
  activation: {
    onboardingCompletion: '% completed onboarding',
    firstDocumentAdded: '% added first document',
    timeToValue: 'Time to first deadline shown'
  },

  // Retention
  retention: {
    d1: 'Day 1 retention',
    d7: 'Day 7 retention',
    d30: 'Day 30 retention',
    mau: 'Monthly active users'
  },

  // Revenue
  revenue: {
    arpu: 'Average revenue per user',
    ltv: 'Lifetime value',
    mrr: 'Monthly recurring revenue',
    b2bRevenue: 'B2B revenue'
  },

  // Impact
  impact: {
    deadlinesSaved: 'Deadlines where users were warned',
    penaltiesAvoided: 'Estimated penalties avoided (₽)',
    nps: 'Net Promoter Score'
  }
};
```

### 6.5 Competitive Moat

```typescript
// strategy/competitive-moat.ts

export const competitiveMoat = {
  data: {
    description: 'Крупнейшая база знаний по миграционному праву РФ',
    defensibility: 'high',
    buildTime: '2+ years'
  },

  network: {
    description: 'Сообщество мигрантов + партнёры (банки, работодатели)',
    defensibility: 'high',
    buildTime: '3+ years'
  },

  trust: {
    description: 'Репутация и отзывы в сообществе',
    defensibility: 'high',
    buildTime: '2+ years'
  },

  technology: {
    description: 'AI + Local-first архитектура',
    defensibility: 'medium',
    buildTime: '1 year'
  },

  regulatory: {
    description: 'Compliance с 152-ФЗ, partnerships с госорганами',
    defensibility: 'medium',
    buildTime: '1-2 years'
  }
};
```

---

*Документ: 06-BUSINESS-LOGIC.md*
*Блок 6 из 6 архитектурной документации MigrantHub*
