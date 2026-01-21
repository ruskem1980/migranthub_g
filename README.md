# MigrantHub - Immigration Ecosystem for Russia

## 🎯 Project Overview

**MigrantHub** is a high-load ecosystem designed for migrants in Russia, targeting 1.2M users from Uzbekistan, Tajikistan, and Kyrgyzstan. The platform provides comprehensive legal support, document management, and essential services through a mobile-first interface.

## 🏗 Architecture

### Monorepo Structure

```
migranthub_g/
├── apps/
│   ├── legal-core/          # Legislation monitoring microservice
│   └── frontend/            # Next.js mobile-first dashboard
├── libs/                    # Shared libraries (future)
└── .cursorrules            # Project guidelines
```

## 📦 Applications

### 1. Legal Core Microservice

**Purpose**: Monitor Russian legislation for changes affecting migrants

**Tech Stack**:
- NestJS (TypeScript)
- PostgreSQL + TypeORM
- RabbitMQ (AMQP)
- Axios + Cheerio (web scraping)

**Key Features**:
- ✅ Automated scraping (cron: daily at midnight)
- ✅ Diff engine (SHA-256 hash comparison)
- ✅ RabbitMQ alerting system
- ✅ AI analysis stub (LLM integration ready)
- ✅ RESTful API for law queries

**Monitored Sources**:
- pravo.gov.ru
- base.garant.ru

**Keywords**:
- "миграционный учет"
- "патент"
- "115-ФЗ"
- "КоАП 18.8"

[→ Full Documentation](./apps/legal-core/README.md)

### 2. Frontend Dashboard

**Purpose**: Zero-scroll mobile interface for migrants

**Tech Stack**:
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Lucide React (icons)

**Key Features**:
- ✅ Zero-scroll architecture (100vh viewport)
- ✅ 5-tab bottom navigation
- ✅ Russian localization
- ✅ Mobile-first design (one-thumb interaction)
- ✅ Telegram Mini App compatible

**Tabs**:
1. 🏠 **Главная** - Status dashboard
2. 🗂 **Документы** - Document registry
3. 🛠 **Сервисы** - Tools & marketplace
4. 🤖 **Ассистент** - AI chat
5. 🚨 **SOS** - Emergency actions

[→ Full Documentation](./apps/frontend/README.md)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- RabbitMQ 3+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd migranthub_g

# Install Legal Core
cd apps/legal-core
npm install
cp .env.example .env
# Configure .env with your database/RabbitMQ credentials
npm run start:dev

# Install Frontend (separate terminal)
cd apps/frontend
npm install
npm run dev
```

### Docker Compose (Recommended)

```bash
# Start Legal Core with dependencies
cd apps/legal-core
docker-compose up -d

# Start Frontend
cd apps/frontend
npm run dev
```

## 🔧 Configuration

### Legal Core Environment

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

# AI Service (Optional)
AI_SERVICE_ENABLED=false
AI_SERVICE_URL=http://localhost:3001/api/analyze
```

### Frontend Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_token
```

## 📊 System Requirements

### Production

- **CPU**: 4+ cores
- **RAM**: 8GB minimum
- **Storage**: 50GB SSD
- **Network**: 100Mbps+

### Target Load

- **Users**: 1.2M concurrent
- **Requests**: 10K req/sec
- **Database**: 100M+ records
- **Uptime**: 99.9% SLA

## 🏛 Microservices Roadmap

### Phase 1 (Current)
- ✅ Legal Core
- ✅ Frontend Dashboard

### Phase 2 (Q1 2024)
- [ ] Identity Service (Auth/Profile)
- [ ] Docflow Service (OCR/PDF)

### Phase 3 (Q2 2024)
- [ ] Fintech Service (Payments)
- [ ] Marketplace Service (Jobs/Housing)

### Phase 4 (Q3 2024)
- [ ] Intelligence Service (AI/Knowledge Base)

## 🔐 Security & Privacy

### Privacy by Design
- **Encrypted columns**: PostgreSQL `pgcrypto`
- **No clear text**: Sensitive JSON encrypted at rest
- **GDPR compliant**: Right to deletion, data portability

### Authentication
- JWT tokens (15min expiry)
- Refresh tokens (7 days)
- Biometric support (future)

### Data Retention
- **Logs**: 30 days
- **Documents**: User-controlled
- **Analytics**: Anonymized, 90 days

## 🌐 Internationalization

### Current
- **Russian** (primary)

### Planned
- Uzbek (Latin + Cyrillic)
- Tajik (Cyrillic)
- Kyrgyz (Cyrillic)

## 📱 Platform Support

### Web
- Chrome 90+
- Safari 14+
- Firefox 88+

### Mobile
- iOS 14+
- Android 10+

### Telegram
- Mini App SDK 6.0+

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Load tests (k6)
k6 run tests/load/scenario.js
```

## 📈 Monitoring

### Metrics
- Prometheus + Grafana
- Custom dashboards per microservice

### Logging
- Centralized: ELK Stack
- Structured JSON logs

### Alerts
- Slack notifications
- PagerDuty integration

## 🤝 Contributing

### Code Standards
- **TypeScript**: Strict mode, no `any`
- **Comments**: Minimal, only for complex logic
- **Naming**: Descriptive, no abbreviations
- **Architecture**: Module -> Service -> Controller

### Git Workflow
```bash
# Feature branch
git checkout -b feature/your-feature

# Commit with conventional commits
git commit -m "feat(legal-core): add legislation diff engine"

# Push and create PR
git push origin feature/your-feature
```

### Commit Convention
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

## 📞 Support

### Development Team
- **Email**: dev@migranthub.ru
- **Telegram**: @migranthub_dev
- **Issues**: GitHub Issues

### Documentation
- [Legal Core API](./apps/legal-core/README.md)
- [Frontend Guide](./apps/frontend/README.md)
- [Architecture Decisions](./docs/ADR.md) (future)

## 📝 License

**Proprietary** - MigrantHub Ecosystem

All rights reserved. This software is confidential and proprietary information.

## 🙏 Acknowledgments

Built with ❤️ for migrants in Russia.

Target audience: 1.2M users from 🇺🇿 🇹🇯 🇰🇬

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: Active Development
