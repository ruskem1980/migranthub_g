# 📚 MigrantHub - Documentation Index

Welcome to MigrantHub! This index will help you navigate the project documentation.

---

## 🚀 Getting Started

**New to the project? Start here:**

1. **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup guide
   - Docker setup
   - Local development setup
   - Testing instructions

2. **[README.md](./README.md)** - Project overview
   - Architecture overview
   - Tech stack
   - System requirements
   - Microservices roadmap

---

## 📖 Core Documentation

### Legal Core Microservice

**[apps/legal-core/README.md](./apps/legal-core/README.md)**

Topics covered:
- LegislationWatcher module
- Database schema
- API endpoints
- RabbitMQ events
- Cron schedule
- Configuration

**Key Files**:
- `src/legislation-watcher/legislation-watcher.service.ts` - Main orchestrator
- `src/legislation-watcher/scraper.service.ts` - Web scraping
- `src/legislation-watcher/diff-engine.service.ts` - Change detection
- `src/legislation-watcher/alerting.service.ts` - RabbitMQ integration
- `src/legislation-watcher/ai-analysis.service.ts` - AI stub

### Frontend Dashboard

**[apps/frontend/README.md](./apps/frontend/README.md)**

Topics covered:
- Zero-scroll architecture
- Navigation structure
- Design system
- Mobile optimization
- Telegram Mini App support

**Key Files**:
- `src/components/Dashboard.tsx` - Main container
- `src/components/BottomNav.tsx` - Navigation bar
- `src/components/tabs/HomeTab.tsx` - Home screen
- `src/components/tabs/DocumentsTab.tsx` - Documents carousel
- `src/components/tabs/ServicesTab.tsx` - Services grid
- `src/components/tabs/AssistantTab.tsx` - AI chat
- `src/components/tabs/SOSTab.tsx` - Emergency screen

---

## 🛠 Development

**[DEVELOPMENT.md](./DEVELOPMENT.md)** - Complete development guide

Topics covered:
- Environment setup (macOS, Ubuntu)
- Database configuration
- RabbitMQ setup
- Testing strategy
- Debugging
- Code style & linting
- Git workflow
- Deployment

---

## 📊 Project Information

**[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - What has been built

Topics covered:
- Completed tasks checklist
- Project structure
- Key features delivered
- Technical specifications
- Performance targets
- Security features
- Next steps

---

## 🎯 Quick Reference

### API Endpoints (Legal Core)

```
GET  /legislation/laws              - Get all laws
GET  /legislation/laws/:id          - Get specific law
GET  /legislation/recent-updates    - Get recent updates
POST /legislation/check             - Trigger manual check
GET  /legislation/health            - Health check
```

### Frontend Tabs

1. **Главная (Home)** - Status dashboard
2. **Документы (Documents)** - Document registry
3. **Сервисы (Services)** - Tools & marketplace
4. **Ассистент (AI)** - AI chat interface
5. **SOS (Emergency)** - Emergency actions

### Tech Stack Summary

**Backend**:
- NestJS 10.3
- PostgreSQL 16
- RabbitMQ 3
- TypeORM
- Axios + Cheerio

**Frontend**:
- Next.js 14
- React 18
- TypeScript 5
- Tailwind CSS 3.4
- Lucide React

---

## 📁 Project Structure

```
migranthub_g/
├── apps/
│   ├── legal-core/          # NestJS microservice
│   │   ├── src/
│   │   │   ├── legislation-watcher/
│   │   │   ├── database/
│   │   │   ├── config/
│   │   │   └── main.ts
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── README.md
│   │
│   └── frontend/            # Next.js dashboard
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   └── lib/
│       ├── package.json
│       └── README.md
│
├── .cursorrules             # Project guidelines
├── README.md                # Main overview
├── QUICKSTART.md            # Quick setup
├── DEVELOPMENT.md           # Dev guide
├── PROJECT_SUMMARY.md       # What's built
└── INDEX.md                 # This file
```

---

## 🔍 Find Specific Information

### Architecture & Design
- **Microservices**: [README.md](./README.md#microservices-roadmap)
- **Database Schema**: [legal-core/README.md](./apps/legal-core/README.md#database-schema)
- **UI/UX Design**: [frontend/README.md](./apps/frontend/README.md#design-system)

### Setup & Configuration
- **Quick Setup**: [QUICKSTART.md](./QUICKSTART.md)
- **Environment Variables**: [DEVELOPMENT.md](./DEVELOPMENT.md#configuration)
- **Docker Setup**: [legal-core/README.md](./apps/legal-core/README.md#running-the-service)

### Development
- **Code Standards**: [DEVELOPMENT.md](./DEVELOPMENT.md#code-style--linting)
- **Testing**: [DEVELOPMENT.md](./DEVELOPMENT.md#testing-strategy)
- **Debugging**: [DEVELOPMENT.md](./DEVELOPMENT.md#debugging)
- **Git Workflow**: [DEVELOPMENT.md](./DEVELOPMENT.md#git-workflow)

### Features
- **Legislation Monitoring**: [legal-core/README.md](./apps/legal-core/README.md#features)
- **Zero-Scroll UI**: [frontend/README.md](./apps/frontend/README.md#zero-scroll-architecture)
- **Russian Localization**: [frontend/README.md](./apps/frontend/README.md#russian-localization)

---

## 🎓 Learning Path

### For Backend Developers

1. Read [legal-core/README.md](./apps/legal-core/README.md)
2. Review `legislation-watcher.service.ts`
3. Understand scraping logic in `scraper.service.ts`
4. Study RabbitMQ integration in `alerting.service.ts`
5. Follow [DEVELOPMENT.md](./DEVELOPMENT.md) for setup

### For Frontend Developers

1. Read [frontend/README.md](./apps/frontend/README.md)
2. Review `Dashboard.tsx` architecture
3. Study tab components in `components/tabs/`
4. Understand zero-scroll implementation
5. Test on mobile devices

### For DevOps Engineers

1. Review [QUICKSTART.md](./QUICKSTART.md) Docker setup
2. Study `docker-compose.yml` configuration
3. Read [DEVELOPMENT.md](./DEVELOPMENT.md) deployment section
4. Plan production infrastructure

---

## 📞 Support & Contact

**Documentation Issues**:
- Missing information? Create an issue
- Unclear instructions? Ask for clarification

**Development Team**:
- Email: dev@migranthub.ru
- Telegram: @migranthub_dev

**Resources**:
- NestJS: https://docs.nestjs.com/
- Next.js: https://nextjs.org/docs
- TypeORM: https://typeorm.io/
- RabbitMQ: https://www.rabbitmq.com/

---

## ✅ Documentation Checklist

Use this to track what you've read:

- [ ] INDEX.md (this file)
- [ ] QUICKSTART.md
- [ ] README.md
- [ ] apps/legal-core/README.md
- [ ] apps/frontend/README.md
- [ ] DEVELOPMENT.md
- [ ] PROJECT_SUMMARY.md

---

## 🔄 Documentation Updates

This documentation is maintained alongside the code. When making changes:

1. Update relevant README files
2. Update PROJECT_SUMMARY.md if features change
3. Update DEVELOPMENT.md if setup changes
4. Keep INDEX.md in sync

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Active Development

---

*Built with ❤️ for 1.2M migrants from 🇺🇿 🇹🇯 🇰🇬*
