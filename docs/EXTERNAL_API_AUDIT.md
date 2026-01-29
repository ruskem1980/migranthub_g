# External API Audit - MigrantHub Utilities Module

**Date:** 2026-01-30
**Auditor:** Claude Code
**Status:** Completed

## Overview

This document provides a comprehensive audit of all external API integrations in the MigrantHub utilities module, documenting the actual data sources, fallback mechanisms, and source indicators.

---

## 1. INN Check Service (inn-check)

### Purpose
Получение ИНН (Идентификационного Номера Налогоплательщика) иностранного гражданина по паспортным данным.

### External API
- **Target URL:** `https://service.nalog.ru/inn.do`
- **Organization:** ФНС России (Federal Tax Service)
- **Integration Type:** Playwright browser automation
- **Config Key:** `innCheck.enabled` (default: `false`)

### Data Flow
```
User Request -> Cache Check -> [Real API / Mock] -> Response
```

### Source Indicators
| Source | Description |
|--------|-------------|
| `fns` | Real data from Federal Tax Service |
| `cache` | Cached result (TTL: 30 days) |
| `mock` | Test data when `INN_CHECK_ENABLED=false` |
| `fallback` | Graceful degradation when service unavailable |

### Fallback Behavior
- When `enabled=false`: Returns deterministic mock data based on document number
- When circuit breaker open: Returns graceful degradation with link to official site
- Cache TTL: 30 days (ИНН не меняется)

### Circuit Breaker Configuration
- Threshold: 5 failures
- Reset time: 60 seconds
- Retry attempts: 3
- Retry delay: 2000ms (exponential backoff)

---

## 2. Ban Check Service (ban-check)

### Purpose
Проверка запрета на въезд в Российскую Федерацию.

### External APIs

#### 2.1 MVD HTTP API (Default)
- **Target URL:** `https://services.fms.gov.ru/info-service.htm?sid=2000`
- **Organization:** МВД России (Ministry of Internal Affairs)
- **Integration Type:** HTTP GET request with HTML parsing
- **Config Key:** `mvd.enabled` (default: `false`)

#### 2.2 FMS Playwright (Alternative)
- **Target URL:** `https://services.fms.gov.ru/info-service.htm?sid=3000`
- **Organization:** ФМС России (Federal Migration Service)
- **Integration Type:** Playwright browser automation
- **Config Key:** `entryBan.enabled` (default: `false`)

### Source Indicators
| Source | Description |
|--------|-------------|
| `mvd` | Real data from MVD HTTP API |
| `fms` | Real data from FMS via Playwright (sid=3000) |
| `cache` | Cached result (MVD: 1 hour, FMS: 24 hours) |
| `fallback` | Graceful degradation when service unavailable |

### Fallback Behavior
- Returns `UNKNOWN` status with link to official verification site
- Different URLs for MVD (sid=2000) and FMS (sid=3000) sources

### Circuit Breaker Configuration
- Threshold: 5 failures
- Reset time: 60 seconds
- Retry attempts: 3
- Retry delay: 1000ms (exponential backoff)

---

## 3. Permit Status Check (permit-status-check)

### Purpose
Проверка статуса заявления на РВП (Разрешение на Временное Проживание) или ВНЖ (Вид на Жительство).

### External API
- **Target URL (RVP):** `https://services.fms.gov.ru/info-service.htm?sid=2060`
- **Target URL (VNJ):** `https://services.fms.gov.ru/info-service.htm?sid=2070`
- **Organization:** ФМС России (Federal Migration Service)
- **Integration Type:** Playwright browser automation
- **Config Key:** `permitStatus.enabled` (default: `false`)

### Source Indicators
| Source | Description |
|--------|-------------|
| `fms` | Real data from FMS via Playwright |
| `cache` | Cached result (TTL: 6 hours) |
| `fallback` | Graceful degradation when service unavailable |

### Status Values
- `PENDING` - На рассмотрении
- `APPROVED` - Одобрено
- `REJECTED` - Отказано
- `READY_FOR_PICKUP` - Готово к выдаче
- `ADDITIONAL_DOCS_REQUIRED` - Требуются доп. документы
- `NOT_FOUND` - Заявление не найдено
- `UNKNOWN` - Не удалось определить

### Fallback Behavior
- Returns `UNKNOWN` status with link to official site for manual verification

### Circuit Breaker Configuration
- Threshold: 5 failures
- Reset time: 60 seconds
- Retry attempts: 3
- Retry delay: 2000ms (exponential backoff)

---

## 4. Patent Check Service (patent-check)

### Purpose
Проверка действительности патента на работу для иностранных граждан.

### External API
- **Target URL:** `https://services.fms.gov.ru/info-service.htm?sid=2000`
- **Organization:** ФМС России (Federal Migration Service)
- **Integration Type:** Playwright browser automation
- **Config Key:** `patentCheck.enabled` (default: `false`)

### Source Indicators
| Source | Description |
|--------|-------------|
| `fms` | Real data from FMS via Playwright |
| `cache` | Cached result (TTL: 6 hours) |
| `mock` | Test data when `PATENT_CHECK_ENABLED=false` |
| `fallback` | Graceful degradation when service unavailable |

### Status Values
- `valid` - Патент действителен
- `invalid` - Патент недействителен
- `expired` - Срок действия патента истек
- `not_found` - Патент не найден в базе данных
- `error` - Ошибка при проверке

### Fallback Behavior
- When `enabled=false`: Returns deterministic mock data based on patent number
- When circuit breaker open: Returns error status with link to official site

### Circuit Breaker Configuration
- Threshold: 5 failures
- Reset time: 60 seconds
- Retry attempts: 3
- Retry delay: 2000ms (exponential backoff)

---

## Frontend Mock Warnings

All frontend modals now display warnings when data comes from mock or fallback sources:

### Warning Triggers
1. **Mock Data Warning** (`source === 'mock'`)
   - Displayed when integration is disabled
   - Informs user that test data does not reflect real status
   - Provides link to official verification site

2. **Service Unavailable Warning** (`source === 'fallback'`)
   - Displayed when service is temporarily unavailable
   - Suggests retrying later or using official site

### Affected Components
- `InnCheckModal.tsx` - Mock/fallback warning
- `PatentCheckModal.tsx` - Mock/fallback warning
- `PermitStatusModal.tsx` - Fallback warning

---

## Environment Configuration

### Required Environment Variables
```bash
# INN Check
INN_CHECK_ENABLED=false           # Enable real FNS integration
INN_CHECK_SERVICE_URL=https://service.nalog.ru/inn.do

# Ban Check (MVD)
MVD_ENABLED=false                 # Enable real MVD integration
MVD_API_URL=https://services.fms.gov.ru/info-service.htm?sid=2000

# Ban Check (FMS)
ENTRY_BAN_ENABLED=false           # Enable real FMS integration (sid=3000)
ENTRY_BAN_SERVICE_URL=https://services.fms.gov.ru/info-service.htm?sid=3000

# Permit Status
PERMIT_STATUS_ENABLED=false       # Enable real FMS integration
PERMIT_STATUS_SERVICE_URL_RVP=https://services.fms.gov.ru/info-service.htm?sid=2060
PERMIT_STATUS_SERVICE_URL_VNJ=https://services.fms.gov.ru/info-service.htm?sid=2070

# Patent Check
PATENT_CHECK_ENABLED=false        # Enable real FMS integration
PATENT_CHECK_SERVICE_URL=https://services.fms.gov.ru/info-service.htm?sid=2000

# Captcha Solver (required for Playwright integrations)
CAPTCHA_SOLVER_ENABLED=false
CAPTCHA_SOLVER_API_KEY=your_2captcha_api_key
```

---

## Security Considerations

1. **No PII Storage** - All services follow local-first architecture, no personal data is stored on server
2. **Cache Keys** - Generated from input parameters, do not expose raw PII
3. **HTTPS Only** - All external API calls use HTTPS
4. **Rate Limiting** - All endpoints have throttle limits (5-10 requests/minute)
5. **Auth Required** - Most endpoints require JWT authentication (except patent regions)

---

## Summary Table

| Service | External URL | Source Types | Mock Available | Cache TTL |
|---------|--------------|--------------|----------------|-----------|
| INN Check | service.nalog.ru | fns, cache, mock, fallback | Yes | 30 days |
| Ban Check (MVD) | services.fms.gov.ru?sid=2000 | mvd, cache, fallback | No | 1 hour |
| Ban Check (FMS) | services.fms.gov.ru?sid=3000 | fms, cache, fallback | No | 24 hours |
| Permit Status | services.fms.gov.ru?sid=2060/2070 | fms, cache, fallback | No | 6 hours |
| Patent Check | services.fms.gov.ru?sid=2000 | fms, cache, mock, fallback | Yes | 6 hours |

---

## Recommendations

1. **Enable Real Integrations Gradually** - Start with less critical services first
2. **Monitor Circuit Breaker States** - Add metrics for circuit breaker trips
3. **Captcha Handling** - Ensure 2Captcha API key is configured for production
4. **Cache Warming** - Consider cache warming strategies for high-traffic services
5. **Offline Mode** - Document behavior when user is offline (PWA/mobile)
