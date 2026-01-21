# Development Guide - MigrantHub

## 🛠 Development Environment Setup

### 1. Prerequisites Installation

#### macOS
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js 20
brew install node@20

# Install PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Install RabbitMQ
brew install rabbitmq
brew services start rabbitmq
```

#### Ubuntu/Debian
```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 16
sudo apt install postgresql-16 postgresql-contrib

# RabbitMQ
sudo apt install rabbitmq-server
sudo systemctl enable rabbitmq-server
sudo systemctl start rabbitmq-server
```

### 2. Database Setup

```bash
# Create database user
psql postgres
CREATE USER migranthub WITH PASSWORD 'your_password';
CREATE DATABASE legal_core OWNER migranthub;
GRANT ALL PRIVILEGES ON DATABASE legal_core TO migranthub;
\q

# Enable pgcrypto extension
psql -U migranthub -d legal_core
CREATE EXTENSION IF NOT EXISTS pgcrypto;
\q
```

### 3. RabbitMQ Configuration

```bash
# Enable management plugin
rabbitmq-plugins enable rabbitmq_management

# Access management UI
open http://localhost:15672
# Default credentials: guest/guest

# Create queue (automatic via Legal Core on first run)
```

## 🏃 Running the Applications

### Legal Core (Backend)

```bash
cd apps/legal-core

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations (auto via TypeORM sync in dev)
npm run start:dev

# Manual legislation check
curl -X POST http://localhost:3000/legislation/check

# View logs
tail -f logs/legal-core.log
```

### Frontend (Dashboard)

```bash
cd apps/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000

# Build for production
npm run build
npm start
```

## 🧪 Testing Strategy

### Unit Tests

```bash
# Legal Core
cd apps/legal-core
npm run test

# Frontend
cd apps/frontend
npm run test
```

### Integration Tests

```bash
# Legal Core API tests
cd apps/legal-core
npm run test:integration

# Test scraper
npm run test:scraper
```

### E2E Tests

```bash
# Frontend E2E
cd apps/frontend
npm run test:e2e

# Run specific test
npm run test:e2e -- --spec "dashboard.spec.ts"
```

## 📝 Code Style & Linting

### ESLint Configuration

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Prettier

```bash
# Format code
npm run format

# Check formatting
npm run format:check
```

### TypeScript

```bash
# Type check
npm run type-check
```

## 🔍 Debugging

### Legal Core

```bash
# Debug mode
npm run start:debug

# Attach debugger (VS Code)
# Press F5 or use "Attach to NestJS" configuration
```

### Frontend

```bash
# Debug in browser
npm run dev
# Open Chrome DevTools
# Add breakpoints in Sources tab

# React DevTools
# Install extension: https://react.dev/learn/react-developer-tools
```

### Database Queries

```bash
# Enable query logging
# In .env:
DB_LOGGING=true

# View slow queries
psql -U migranthub -d legal_core
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

## 📊 Performance Monitoring

### Legal Core Metrics

```bash
# Health check
curl http://localhost:3000/legislation/health

# RabbitMQ queue status
curl http://localhost:15672/api/queues

# Database connections
psql -U migranthub -d legal_core -c "SELECT count(*) FROM pg_stat_activity;"
```

### Frontend Performance

```bash
# Lighthouse audit
npm run lighthouse

# Bundle analysis
npm run analyze

# Check bundle size
npm run build
ls -lh .next/static/chunks/
```

## 🐛 Common Issues & Solutions

### Issue 1: Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Issue 2: Database Connection Failed

```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Restart PostgreSQL
brew services restart postgresql@16

# Check connection
psql -U migranthub -d legal_core -c "SELECT 1;"
```

### Issue 3: RabbitMQ Connection Timeout

```bash
# Check RabbitMQ status
brew services list | grep rabbitmq

# Restart RabbitMQ
brew services restart rabbitmq

# Check logs
tail -f /usr/local/var/log/rabbitmq/rabbit@localhost.log
```

### Issue 4: TypeScript Errors

```bash
# Clear cache
rm -rf node_modules .next dist
npm install

# Rebuild
npm run build
```

## 🔄 Git Workflow

### Branch Naming

```
feature/legislation-watcher
fix/scraper-timeout
docs/api-documentation
refactor/database-layer
```

### Commit Messages

```bash
# Good examples
git commit -m "feat(legal-core): add legislation diff engine"
git commit -m "fix(frontend): resolve mobile scroll issue"
git commit -m "docs(readme): update installation guide"

# Bad examples
git commit -m "update code"
git commit -m "fix bug"
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here
```

## 📦 Dependency Management

### Adding Dependencies

```bash
# Production dependency
npm install axios

# Dev dependency
npm install -D @types/node

# Update all dependencies
npm update

# Check for outdated packages
npm outdated
```

### Security Audits

```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (may break things)
npm audit fix --force
```

## 🚀 Deployment

### Legal Core

```bash
# Build Docker image
cd apps/legal-core
docker build -t migranthub/legal-core:latest .

# Run container
docker run -d \
  --name legal-core \
  -p 3000:3000 \
  --env-file .env \
  migranthub/legal-core:latest

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Frontend

```bash
# Build for production
cd apps/frontend
npm run build

# Test production build locally
npm start

# Deploy to Vercel
vercel --prod

# Or deploy to custom server
rsync -avz .next/ user@server:/var/www/migranthub/
```

## 📚 Additional Resources

### Documentation
- [NestJS Docs](https://docs.nestjs.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeORM Docs](https://typeorm.io/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/tutorials.html)

### Tools
- [Postman Collection](./docs/postman/migranthub.json) (future)
- [Database Schema](./docs/schema.sql) (future)
- [API Documentation](http://localhost:3000/api/docs) (future)

### Community
- Slack: #migranthub-dev
- Weekly Standups: Monday 10:00 AM MSK
- Code Reviews: GitHub PR comments

---

**Happy Coding!** 🚀

For questions, contact: dev@migranthub.ru
