# MigrantHub Frontend - Implemented Features Analysis

**Date**: 2026-01-27
**Stack**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + Capacitor 8
**Path**: `apps/frontend/`

---

## 1. Pages (App Router)

### 1.1 Root & Layouts

| ID | Route | File | Functionality | Status |
|----|-------|------|---------------|--------|
| IMP-FE-001 | `/` | `app/page.tsx` | Root redirect/landing page | Implemented |
| IMP-FE-002 | - | `app/layout.tsx` | Root layout with providers, ErrorBoundary, Sentry | Implemented |
| IMP-FE-003 | - | `app/(auth)/layout.tsx` | Auth routes layout group | Implemented |
| IMP-FE-004 | - | `app/(main)/layout.tsx` | Main app routes layout group | Implemented |

### 1.2 Authentication Flow

| ID | Route | File | Functionality | Status |
|----|-------|------|---------------|--------|
| IMP-FE-010 | `/welcome` | `app/(auth)/welcome/page.tsx` | Welcome screen with language selection, benefits | Implemented |
| IMP-FE-011 | `/auth/method` | `app/(auth)/auth/method/page.tsx` | Auth method selection (Phone/Telegram) | Implemented |
| IMP-FE-012 | `/auth/phone` | `app/(auth)/auth/phone/page.tsx` | Phone number input | Implemented |
| IMP-FE-013 | `/auth/otp` | `app/(auth)/auth/otp/page.tsx` | OTP verification | Implemented |

### 1.3 Main Application Pages

| ID | Route | File | Functionality | Status |
|----|-------|------|---------------|--------|
| IMP-FE-020 | `/profile` | `app/(main)/profile/page.tsx` | User profile management | Implemented |
| IMP-FE-021 | `/payment` | `app/(main)/payment/page.tsx` | Patent payment page | Implemented |
| IMP-FE-022 | `/services` | `app/(main)/services/page.tsx` | Services listing | Implemented |
| IMP-FE-023 | `/calculator` | `app/(main)/calculator/page.tsx` | Stay period calculator (90/180 days) | Implemented |
| IMP-FE-024 | `/documents` | `app/(main)/documents/page.tsx` | Documents list | Implemented |
| IMP-FE-025 | `/documents/[id]` | `app/(main)/documents/[id]/page.tsx` | Document detail view | Implemented |

### 1.4 Special Pages

| ID | Route | File | Functionality | Status |
|----|-------|------|---------------|--------|
| IMP-FE-030 | `/prototype` | `app/prototype/page.tsx` | Full prototype demo (all features) | Implemented |
| IMP-FE-031 | `/offline` | `app/offline/page.tsx` | Offline fallback page | Implemented |

---

## 2. Components

### 2.1 Prototype Components (Full-featured demo)

| ID | File | Component | Functionality | Status |
|----|------|-----------|---------------|--------|
| IMP-FE-100 | `components/prototype/AppPrototype.tsx` | AppPrototype | Main prototype coordinator, state machine | Implemented |
| IMP-FE-101 | `components/prototype/DashboardLayout.tsx` | DashboardLayout | Main app layout with bottom navigation | Implemented |

#### Dashboard Screens

| ID | File | Component | Functionality | Status |
|----|------|-----------|---------------|--------|
| IMP-FE-110 | `dashboard/HomeScreen.tsx` | HomeScreen | Home dashboard with status cards, attention items | Implemented |
| IMP-FE-111 | `dashboard/DocumentsScreen.tsx` | DocumentsScreen | Documents list and management | Implemented |
| IMP-FE-112 | `dashboard/ServicesScreen.tsx` | ServicesScreen | Services grid (calculator, ban check, map, etc.) | Implemented |
| IMP-FE-113 | `dashboard/AssistantScreen.tsx` | AssistantScreen | AI assistant chat interface | Implemented |
| IMP-FE-114 | `dashboard/SOSScreen.tsx` | SOSScreen | Emergency help, detention instructions, document recovery | Implemented |

#### Onboarding Screens

| ID | File | Component | Functionality | Status |
|----|------|-----------|---------------|--------|
| IMP-FE-120 | `onboarding/ProfilingScreen.tsx` | ProfilingScreen | User profiling (citizenship, entry date, purpose) | Implemented |
| IMP-FE-121 | `onboarding/AuditScreen.tsx` | AuditScreen | Document audit (11 document types checklist) | Implemented |
| IMP-FE-122 | `onboarding/RoadmapScreen.tsx` | RoadmapScreen | Legalization roadmap visualization | Implemented |

#### Wizard Components

| ID | File | Component | Functionality | Status |
|----|------|-----------|---------------|--------|
| IMP-FE-130 | `wizard/LegalizationWizard.tsx` | LegalizationWizard | Multi-step legalization wizard (~1560 lines) | Implemented |

Steps: `intro` -> `required-docs` -> `additional-docs` -> `document-scan` -> `scanning` -> `verification` -> `processing` -> `action-plan`

#### Services Components

| ID | File | Component | Functionality | Status |
|----|------|-----------|---------------|--------|
| IMP-FE-140 | `services/DocumentGenerator.tsx` | DocumentGenerator | Document template generator (~660 lines) | Implemented |

### 2.2 UI Components

| ID | File | Component | Functionality | Status |
|----|------|-----------|---------------|--------|
| IMP-FE-200 | `components/ui/LanguageSwitcher.tsx` | LanguageSwitcher | Language selection (dropdown, list, compact variants) | Implemented |
| IMP-FE-201 | `components/ErrorBoundary.tsx` | ErrorBoundary | React error boundary with Sentry integration | Implemented |

### 2.3 Feature Components

#### Documents Feature (`features/documents/components/`)

| ID | File | Component | Functionality | Status |
|----|------|-----------|---------------|--------|
| IMP-FE-300 | `DocumentWizard.tsx` | DocumentWizard | Document creation wizard | Implemented |
| IMP-FE-301 | `DocumentCard.tsx` | DocumentCard | Single document card display | Implemented |
| IMP-FE-302 | `DocumentsList.tsx` | DocumentsList | Documents list view | Implemented |
| IMP-FE-303 | `DocumentFormWrapper.tsx` | DocumentFormWrapper | Form wrapper for documents | Implemented |
| IMP-FE-304 | `DocumentTypeSelector.tsx` | DocumentTypeSelector | Document type selection | Implemented |
| IMP-FE-305 | `SampleDataButton.tsx` | SampleDataButton | Fill form with sample data | Implemented |
| IMP-FE-306 | `PassportForm.tsx` | PassportForm | Passport data form | Implemented |
| IMP-FE-307 | `MigrationCardForm.tsx` | MigrationCardForm | Migration card form | Implemented |
| IMP-FE-308 | `RegistrationForm.tsx` | RegistrationForm | Registration form | Implemented |
| IMP-FE-309 | `PatentForm.tsx` | PatentForm | Patent form | Implemented |
| IMP-FE-310 | `MissingFieldsForm.tsx` | MissingFieldsForm | Missing fields completion form | Implemented |

#### Services Feature (`features/services/components/`)

| ID | File | Component | Functionality | Status |
|----|------|-----------|---------------|--------|
| IMP-FE-320 | `StayCalculator.tsx` | StayCalculator | 90/180 days stay calculator | Implemented |
| IMP-FE-321 | `BanChecker.tsx` | BanChecker | Ban check service (MVD/FSSP) | Implemented |
| IMP-FE-322 | `MapScreen.tsx` | MapScreen | Migrant map (MVD, MMC, medical centers) | Implemented |
| IMP-FE-323 | `ExamTrainer.tsx` | ExamTrainer | Russian language exam trainer | Implemented |
| IMP-FE-324 | `DeportationModeWarning.tsx` | DeportationModeWarning | Deportation mode warning banner | Implemented |

#### Payments Feature (`features/payments/components/`)

| ID | File | Component | Functionality | Status |
|----|------|-----------|---------------|--------|
| IMP-FE-330 | `PatentPayment.tsx` | PatentPayment | Patent payment component | Implemented |

#### Profile Feature (`features/profile/components/`)

| ID | File | Component | Functionality | Status |
|----|------|-----------|---------------|--------|
| IMP-FE-340 | `ProfileForm.tsx` | ProfileForm | Profile editing form | Implemented |
| IMP-FE-341 | `PassportScanner.tsx` | PassportScanner | Passport OCR scanning | Implemented |

---

## 3. State Management (Zustand)

### 3.1 Stores

| ID | File | Store | State & Methods | Persistence |
|----|------|-------|-----------------|-------------|
| IMP-FE-400 | `lib/stores/authStore.ts` | useAuthStore | `user`, `isAuthenticated`, `isLoading`, `isInitialized`, `error`; `setUser()`, `logout()`, `reset()` | localStorage |
| IMP-FE-401 | `lib/stores/profileStore.ts` | useProfileStore | `profile` (UserProfile), `documents` (Document[]), `isLoading`, `error`; `setProfile()`, `updateProfile()`, `setDocuments()`, `addDocument()`, `updateDocument()`, `removeDocument()` | localStorage |
| IMP-FE-402 | `lib/stores/languageStore.ts` | useLanguageStore | `language` (ru/en/uz/tg/ky); `setLanguage()` | localStorage |
| IMP-FE-403 | `lib/stores/appStore.ts` | useAppStore | App-level state | localStorage |

### 3.2 Types

```typescript
// UserProfile (profileStore.ts)
interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  fullNameLatin?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  passportNumber: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  citizenship: string;
  entryDate?: string;
  migrationCardNumber?: string;
  migrationCardExpiry?: string;
  purpose?: 'work' | 'study' | 'tourist' | 'private' | 'business' | 'official' | 'transit';
  selectedDocuments?: string[];
  registrationAddress?: string;
  registrationExpiry?: string;
  hostFullName?: string;
  hostAddress?: string;
  hasPatent?: boolean;
  patentRegion?: string;
  patentExpiry?: string;
  employerName?: string;
  employerINN?: string;
  phone?: string;
  email?: string;
  language: 'ru' | 'uz' | 'tg' | 'ky';
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Document (profileStore.ts)
interface Document {
  id: string;
  userId: string;
  type: 'passport' | 'migration_card' | 'registration' | 'patent' | 'medical' | 'exam' | 'inn' | 'other';
  title: string;
  fileUri?: string;
  thumbnailUri?: string;
  ocrData?: Record<string, string>;
  expiryDate?: string;
  createdAt: string;
}
```

---

## 4. Hooks

### 4.1 Core Hooks (`lib/hooks/`)

| ID | File | Hook | Functionality | Status |
|----|------|------|---------------|--------|
| IMP-FE-500 | `useAuth.ts` | useAuth | Authentication logic, device auth | Implemented |
| IMP-FE-501 | `useOnlineStatus.ts` | useOnlineStatus | Network status detection | Implemented |
| IMP-FE-502 | `useServiceWorker.ts` | useServiceWorker | Service worker registration | Implemented |
| IMP-FE-503 | `usePushNotifications.ts` | usePushNotifications | Push notifications handling | Implemented |

### 4.2 Feature Hooks

| ID | File | Hook | Functionality | Status |
|----|------|------|---------------|--------|
| IMP-FE-510 | `features/documents/hooks/useExpiryTracker.ts` | useExpiryTracker | Document expiry tracking | Implemented |
| IMP-FE-511 | `features/documents/hooks/useDocumentStorage.ts` | useDocumentStorage | Document storage operations | Implemented |
| IMP-FE-512 | `features/services/hooks/useStayPeriods.ts` | useStayPeriods | Stay period calculations | Implemented |

### 4.3 i18n Hook (`lib/i18n/`)

| ID | File | Hook | Functionality | Status |
|----|------|------|---------------|--------|
| IMP-FE-520 | `useTranslation.ts` | useTranslation | Translation with `t()` function | Implemented |
| IMP-FE-521 | `useTranslation.ts` | useNamespacedTranslation | Namespaced translations | Implemented |

---

## 5. API Integration

### 5.1 API Client (`lib/api/`)

| ID | File | Module | Functionality | Status |
|----|------|--------|---------------|--------|
| IMP-FE-600 | `client.ts` | ApiClient | HTTP client with auth, token refresh | Implemented |
| IMP-FE-601 | `client.ts` | authApi | `deviceAuth()`, `refresh()` | Implemented |
| IMP-FE-602 | `client.ts` | usersApi | `getMe()`, `updateMe()` | Implemented |
| IMP-FE-603 | `client.ts` | utilitiesApi | `checkBan()`, `getPatentRegions()` | Implemented |
| IMP-FE-604 | `client.ts` | healthApi | `check()` | Implemented |
| IMP-FE-605 | `storage.ts` | tokenStorage | Token storage (localStorage/SecureStorage) | Implemented |
| IMP-FE-606 | `device.ts` | deviceApi | Device ID generation | Implemented |
| IMP-FE-607 | `types.ts` | - | API types (ApiError, AuthResponse, etc.) | Implemented |

### 5.2 API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/device` | POST | Device authentication |
| `/auth/refresh` | POST | Token refresh |
| `/users/me` | GET | Get current user |
| `/users/me` | PATCH | Update user |
| `/utilities/ban-check` | GET | Check ban status |
| `/utilities/patent/regions` | GET | Get patent regions |
| `/health` | GET | Health check |

---

## 6. Localization (i18n)

### 6.1 Supported Languages

| ID | Code | Name | Native Name | Flag | Status |
|----|------|------|-------------|------|--------|
| IMP-FE-700 | `ru` | Russian | Русский | Russian flag | Implemented |
| IMP-FE-701 | `en` | English | English | British flag | Implemented |
| IMP-FE-702 | `uz` | Uzbek | O'zbek | Uzbekistan flag | Implemented |
| IMP-FE-703 | `tg` | Tajik | Тоджики | Tajikistan flag | Implemented |
| IMP-FE-704 | `ky` | Kyrgyz | Кыргызча | Kyrgyzstan flag | Implemented |

### 6.2 Translation Files

| ID | File | Lines | Coverage |
|----|------|-------|----------|
| IMP-FE-710 | `locales/ru.json` | ~1670 | Complete (primary) |
| IMP-FE-711 | `locales/en.json` | - | Partial |
| IMP-FE-712 | `locales/uz.json` | - | Partial |
| IMP-FE-713 | `locales/tg.json` | - | Partial |
| IMP-FE-714 | `locales/ky.json` | - | Partial |

### 6.3 Translation Namespaces

- `app` - App info (name, tagline, mission)
- `common` - Common UI strings
- `auth` - Authentication flow
- `welcome` - Welcome screen
- `onboarding` - Onboarding flow
- `languages` - Language names
- `countries` - Country names (22 countries)
- `regions` - Russian regions (20 regions)
- `cities` - Russian cities (69 cities)
- `profile` - Profile management
- `documents` - Document management
- `services` - Services (calculator, ban check, map, exam)
- `payment` - Payment flow
- `sos` - SOS/Emergency help
- `dashboard` - Dashboard UI
- `assistant` - AI assistant
- `notifications` - Notification messages
- `errors` - Error messages
- `offline` - Offline messages
- `poi` - Points of Interest
- `wizard` - Legalization wizard
- `audit` - Document audit
- `roadmap` - Legalization roadmap
- `docgen` - Document generator

---

## 7. Document Schemas

| ID | File | Schema | Fields |
|----|------|--------|--------|
| IMP-FE-800 | `features/documents/schemas/passport.schema.ts` | PassportSchema | Passport fields with validation |
| IMP-FE-801 | `features/documents/schemas/migrationCard.schema.ts` | MigrationCardSchema | Migration card fields |
| IMP-FE-802 | `features/documents/schemas/registration.schema.ts` | RegistrationSchema | Registration fields |
| IMP-FE-803 | `features/documents/schemas/patent.schema.ts` | PatentSchema | Patent fields |
| IMP-FE-804 | `features/documents/schemas/inn.schema.ts` | INNSchema | INN fields |
| IMP-FE-805 | `features/documents/schemas/snils.schema.ts` | SNILSSchema | SNILS fields |
| IMP-FE-806 | `features/documents/schemas/dms.schema.ts` | DMSSchema | DMS insurance fields |

---

## 8. PDF Generation

| ID | File | Functionality | Status |
|----|------|---------------|--------|
| IMP-FE-850 | `features/documents/pdfGenerator.ts` | PDF document generation | Implemented |
| IMP-FE-851 | `features/documents/utils/generateDocumentPDF.ts` | Document PDF utility | Implemented |
| IMP-FE-852 | `features/documents/fonts/roboto-regular.ts` | Embedded Cyrillic font | Implemented |

---

## 9. Calculator & Utilities

### 9.1 Stay Calculator (`features/services/calculator/`)

| ID | File | Functionality | Status |
|----|------|---------------|--------|
| IMP-FE-900 | `stay-calculator.ts` | 90/180 days calculation logic | Implemented |
| IMP-FE-901 | `penalties.ts` | Penalty calculation | Implemented |
| IMP-FE-902 | `penalty-calculator.ts` | Advanced penalty calculator | Implemented |
| IMP-FE-903 | `types.ts` | Calculator types | Implemented |

### 9.2 Points of Interest

| ID | File | Functionality | Status |
|----|------|---------------|--------|
| IMP-FE-910 | `features/services/poi.ts` | POI data (MVD, MMC, medical, exam, mosque) | Implemented |

---

## 10. Local Storage & Encryption

| ID | File | Functionality | Status |
|----|------|---------------|--------|
| IMP-FE-950 | `lib/db/index.ts` | IndexedDB (Dexie.js) setup | Implemented |
| IMP-FE-951 | `lib/db/types.ts` | Database types | Implemented |
| IMP-FE-952 | `lib/crypto/encryption.ts` | AES-GCM encryption | Implemented |
| IMP-FE-953 | `lib/crypto/index.ts` | Crypto exports | Implemented |

---

## 11. Notifications

| ID | File | Functionality | Status |
|----|------|---------------|--------|
| IMP-FE-960 | `lib/notifications/local.ts` | Local notifications | Implemented |
| IMP-FE-961 | `lib/notifications/index.ts` | Notifications exports | Implemented |

---

## 12. Constants

| ID | File | Contents | Status |
|----|------|----------|--------|
| IMP-FE-970 | `lib/constants/forms.ts` | Form constants | Implemented |
| IMP-FE-971 | `lib/constants/locations.ts` | Location constants | Implemented |
| IMP-FE-972 | `lib/constants/documents.ts` | Document constants | Implemented |

---

## 13. Document Templates (DocGen)

Templates available in `DocumentGenerator.tsx`:

| Category | Template | Form Number | Status |
|----------|----------|-------------|--------|
| Work | Patent Application | 26.5-1 | Implemented |
| Work | Employment Contract | Typical template | Implemented |
| Work | Employment Notification | MVD Order #846 | Implemented |
| Work | Termination Notification | MVD Order #846 | Implemented |
| Housing | Arrival Notification | Form 21 | Implemented |
| Housing | Employer Petition | Free form | Implemented |
| Housing | Owner Consent | Typical form | Implemented |
| Long-term | RVP Application | RVP Form | Implemented |
| Long-term | VNZh Application | VNZh Form | Implemented |
| Long-term | Annual Notification | Notification Form | Implemented |
| Other | Lost Documents Statement | Free form | Implemented |
| Other | INN Application | Form 2-2-Uchet | Implemented |

---

## 14. Missing/Incomplete Features

### 14.1 Backend Integration Gaps

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| MISS-FE-001 | Real OCR | Currently mock OCR, needs real API integration | High |
| MISS-FE-002 | Payment Gateway | SBP/card payments not connected | High |
| MISS-FE-003 | Real Ban Check | MVD/FSSP API integration pending | Medium |
| MISS-FE-004 | AI Assistant | Chat backend not implemented | Medium |
| MISS-FE-005 | Push Notifications | Backend push not configured | Medium |

### 14.2 UI/UX Gaps

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| MISS-FE-010 | Localization Completion | uz, tg, ky, en translations incomplete | Medium |
| MISS-FE-011 | Dark Mode | No dark theme support | Low |
| MISS-FE-012 | Accessibility | Limited a11y support | Medium |

### 14.3 Mobile (Capacitor) Gaps

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| MISS-FE-020 | Camera Integration | Native camera for OCR | High |
| MISS-FE-021 | Biometric Auth | Face ID/Touch ID | Medium |
| MISS-FE-022 | Secure Storage | Full SecureStorage implementation | High |
| MISS-FE-023 | Deep Links | App deep linking | Low |

### 14.4 Testing Gaps

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| MISS-FE-030 | Unit Tests | No test files found | High |
| MISS-FE-031 | E2E Tests | No Playwright/Cypress tests | Medium |
| MISS-FE-032 | Component Tests | No Storybook/testing-library | Medium |

---

## 15. Architecture Summary

### 15.1 Route Groups

```
app/
├── (auth)/           # Unauthenticated routes
│   ├── welcome/
│   └── auth/
│       ├── method/
│       ├── phone/
│       └── otp/
├── (main)/           # Authenticated routes
│   ├── profile/
│   ├── payment/
│   ├── services/
│   ├── calculator/
│   └── documents/
│       └── [id]/
├── prototype/        # Full demo
└── offline/          # Offline fallback
```

### 15.2 Feature Module Structure

```
features/
├── documents/
│   ├── components/   # React components
│   ├── hooks/        # Feature hooks
│   ├── schemas/      # Validation schemas
│   ├── sampleData/   # Sample data for forms
│   ├── fonts/        # Embedded fonts for PDF
│   └── utils/        # Utilities
├── services/
│   ├── components/   # Service components
│   ├── hooks/        # Service hooks
│   ├── calculator/   # Stay calculator logic
│   └── poi.ts        # Points of interest
├── payments/
│   └── components/   # Payment components
└── profile/
    └── components/   # Profile components
```

### 15.3 Data Flow

```
User Input
    ↓
React Component (UI)
    ↓
Zustand Store (State)
    ↓
API Client (HTTP) ←→ Backend API
    ↓
localStorage / IndexedDB (Persistence)
```

---

## 16. Statistics

| Metric | Count |
|--------|-------|
| Pages | 14 |
| Components (Prototype) | 12 |
| Components (Features) | 19 |
| Components (UI) | 2 |
| Stores | 4 |
| Hooks | 9 |
| Document Schemas | 7 |
| Document Templates | 12 |
| Languages | 5 |
| Translation Keys | ~1670 (ru.json) |
| POI Categories | 5 |
| Countries | 22 |
| Russian Regions | 20 |
| Russian Cities | 69 |

---

## 17. Key Files Reference

| Purpose | File Path |
|---------|-----------|
| Main Prototype | `src/components/prototype/AppPrototype.tsx` |
| Legalization Wizard | `src/components/prototype/wizard/LegalizationWizard.tsx` |
| Document Generator | `src/components/prototype/services/DocumentGenerator.tsx` |
| Stay Calculator | `src/features/services/components/StayCalculator.tsx` |
| API Client | `src/lib/api/client.ts` |
| Auth Store | `src/lib/stores/authStore.ts` |
| Profile Store | `src/lib/stores/profileStore.ts` |
| Language Store | `src/lib/stores/languageStore.ts` |
| Russian Translations | `src/locales/ru.json` |
| PDF Generator | `src/features/documents/pdfGenerator.ts` |
