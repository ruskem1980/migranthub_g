# Legal Core Microservice

## Overview

Legal Core is a critical microservice in the MigrantHub ecosystem that monitors Russian legislation for changes affecting migrants from Uzbekistan, Tajikistan, and Kyrgyzstan.

## Features

### 🔍 Legislation Watcher Module

1. **Automated Scraping**
   - Cron job runs every 24 hours (midnight)
   - Parses official sources: `pravo.gov.ru`, `base.garant.ru`
   - Searches for keywords: "миграционный учет", "патент", "115-ФЗ", "КоАП 18.8"

2. **Diff Engine**
   - Compares SHA-256 hashes of legislation text
   - Detects significant changes (>5% threshold)
   - Generates human-readable diffs

3. **RabbitMQ Alerting**
   - Publishes `legislation.updated` events to RabbitMQ
   - Topic exchange: `legislation_events`
   - Durable queue with TTL: 24 hours

4. **AI Analysis (Stub)**
   - Prepares legislation diffs for LLM analysis
   - Generates impact summaries for migrants
   - Configurable via `AI_SERVICE_ENABLED` flag

## Architecture

```
┌─────────────────────────────────────────────┐
│         LegislationWatcherService           │
│  (Orchestrates entire monitoring process)   │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┼─────────┬─────────┬────────┐
        │         │         │         │        │
   ┌────▼───┐ ┌──▼──┐ ┌────▼────┐ ┌──▼──┐ ┌──▼──┐
   │Scraper │ │Diff │ │Alerting │ │ AI  │ │ DB  │
   │Service │ │Eng. │ │Service  │ │Stub │ │(PG) │
   └────────┘ └─────┘ └─────────┘ └─────┘ └─────┘
```

## Database Schema

### Table: `laws`

```sql
CREATE TABLE laws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  source_url VARCHAR(1000) UNIQUE NOT NULL,
  last_updated TIMESTAMP,
  content_hash VARCHAR(64) NOT NULL,
  raw_text TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_laws_source_url ON laws(source_url);
CREATE INDEX idx_laws_last_updated ON laws(last_updated);
```

## Installation

```bash
cd apps/legal-core
npm install
```

## Configuration

Create `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=migranthub
DB_PASSWORD=your_password
DB_DATABASE=legal_core

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=legislation_updates

# Scraper
SCRAPER_CRON=0 0 * * *
SCRAPER_TIMEOUT=30000

# AI Service (Optional)
AI_SERVICE_URL=http://localhost:3001/api/analyze
AI_SERVICE_ENABLED=false

# Application
PORT=3000
NODE_ENV=development
```

## Running the Service

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## API Endpoints

### GET `/legislation/laws`
Get all laws (optional filter by status)

**Query Parameters:**
- `status` (optional): `active` | `deprecated` | `pending_review` | `archived`

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "115-ФЗ О правовом положении иностранных граждан",
    "source_url": "http://pravo.gov.ru/...",
    "last_updated": "2024-01-15T10:30:00Z",
    "content_hash": "abc123...",
    "status": "active"
  }
]
```

### GET `/legislation/laws/:id`
Get specific law by ID

### GET `/legislation/recent-updates`
Get recently updated laws

**Query Parameters:**
- `limit` (optional, default: 10): Number of results

### POST `/legislation/check`
Manually trigger legislation check

**Response:**
```json
{
  "message": "Legislation check started. This may take several minutes."
}
```

### GET `/legislation/health`
Health check endpoint

## RabbitMQ Events

### Event: `legislation.updated`

Published to exchange: `legislation_events`
Routing key: `legislation.updated`

**Payload:**
```json
{
  "eventType": "legislation.updated",
  "lawId": "uuid",
  "title": "115-ФЗ О правовом положении иностранных граждан",
  "sourceUrl": "http://pravo.gov.ru/...",
  "changePercentage": 12.5,
  "diff": "=== ADDED ===\n+ New paragraph about...",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "oldHash": "abc123...",
    "newHash": "def456...",
    "keywords": ["патент", "миграционный учет"]
  }
}
```

## Cron Schedule

Default: Every day at midnight (00:00)

Configurable via `SCRAPER_CRON` environment variable using cron syntax:
- `0 0 * * *` - Daily at midnight
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 1` - Every Monday at midnight

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Monitoring

### Logs
The service logs all operations:
- Scraping progress
- Detected changes
- RabbitMQ events
- Errors and warnings

### Health Check
```bash
curl http://localhost:3000/legislation/health
```

## Privacy & Security

- **No sensitive data**: Only public legislation is stored
- **Rate limiting**: Built-in delays between requests (2s)
- **Error handling**: Graceful degradation if sources are unavailable
- **Idempotent**: Safe to run multiple times

## Future Enhancements

1. **AI Integration**: Connect to LLM service for automated analysis
2. **Webhook Support**: Allow external services to subscribe to updates
3. **Multi-language**: Translate legislation summaries to UZ/TJ/KG languages
4. **Historical Tracking**: Store full change history with diffs
5. **Admin Dashboard**: Web UI for monitoring and manual triggers

## Dependencies

- **NestJS**: Framework
- **TypeORM**: Database ORM
- **PostgreSQL**: Database
- **RabbitMQ**: Message broker
- **Axios**: HTTP client
- **Cheerio**: HTML parsing
- **@nestjs/schedule**: Cron jobs

## License

Proprietary - MigrantHub Ecosystem

## Support

For issues or questions, contact the MigrantHub development team.
