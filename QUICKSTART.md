# 🚀 MigrantHub - Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js 20+
- Docker Desktop (recommended)

---

## Option 1: Docker (Recommended)

### Legal Core + Dependencies

```bash
# Navigate to legal-core
cd apps/legal-core

# Start PostgreSQL + RabbitMQ + Legal Core
docker-compose up -d

# View logs
docker-compose logs -f legal-core

# Stop services
docker-compose down
```

**Access Points**:
- API: http://localhost:3000
- Health Check: http://localhost:3000/legislation/health
- RabbitMQ UI: http://localhost:15672 (guest/guest)
- PostgreSQL: localhost:5432

### Frontend

```bash
# Navigate to frontend
cd apps/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Access**: http://localhost:3000

---

## Option 2: Local Development

### Step 1: Install Dependencies

```bash
# Legal Core
cd apps/legal-core
npm install

# Frontend
cd apps/frontend
npm install
```

### Step 2: Setup Database

```bash
# Install PostgreSQL (macOS)
brew install postgresql@16
brew services start postgresql@16

# Create database
psql postgres
CREATE USER migranthub WITH PASSWORD 'migranthub_pass';
CREATE DATABASE legal_core OWNER migranthub;
\q
```

### Step 3: Setup RabbitMQ

```bash
# Install RabbitMQ (macOS)
brew install rabbitmq
brew services start rabbitmq

# Enable management plugin
rabbitmq-plugins enable rabbitmq_management
```

### Step 4: Configure Environment

```bash
# Legal Core
cd apps/legal-core
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=migranthub
DB_PASSWORD=migranthub_pass
DB_DATABASE=legal_core
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=legislation_updates
AI_SERVICE_ENABLED=false
PORT=3000
NODE_ENV=development
EOF
```

### Step 5: Run Applications

```bash
# Terminal 1: Legal Core
cd apps/legal-core
npm run start:dev

# Terminal 2: Frontend
cd apps/frontend
npm run dev
```

---

## 🧪 Test the Setup

### 1. Check Legal Core Health

```bash
curl http://localhost:3000/legislation/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-22T..."
}
```

### 2. Trigger Manual Legislation Check

```bash
curl -X POST http://localhost:3000/legislation/check
```

Expected response:
```json
{
  "message": "Legislation check started. This may take several minutes."
}
```

### 3. View Laws

```bash
curl http://localhost:3000/legislation/laws
```

### 4. Check RabbitMQ

Open: http://localhost:15672
- Username: `guest`
- Password: `guest`

Navigate to **Queues** → Look for `legislation_updates`

### 5. Test Frontend

Open: http://localhost:3000

You should see:
- ✅ Bottom navigation with 5 tabs
- ✅ Home tab with status indicator
- ✅ All text in Russian
- ✅ Mobile-responsive layout

---

## 📱 Test on Mobile

### Using ngrok (expose localhost)

```bash
# Install ngrok
brew install ngrok

# Expose frontend
ngrok http 3000
```

Copy the HTTPS URL and open on your phone.

### Using Telegram Mini App

1. Create a Telegram Bot via @BotFather
2. Get bot token
3. Set webhook to your ngrok URL
4. Open bot in Telegram

---

## 🎯 Quick Feature Tests

### Legal Core

```bash
# Get all laws
curl http://localhost:3000/legislation/laws

# Get recent updates
curl http://localhost:3000/legislation/recent-updates?limit=5

# Get specific law
curl http://localhost:3000/legislation/laws/{law-id}
```

### Frontend

1. **Home Tab**: Check status indicator (should show "Риск")
2. **Documents Tab**: Swipe horizontally through document cards
3. **Services Tab**: Tap on any service button
4. **Assistant Tab**: Type a message and send
5. **SOS Tab**: View emergency button (don't press!)

---

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Error

```bash
# Check PostgreSQL
brew services list | grep postgresql

# Restart
brew services restart postgresql@16
```

### RabbitMQ Connection Error

```bash
# Check RabbitMQ
brew services list | grep rabbitmq

# Restart
brew services restart rabbitmq
```

### TypeScript Errors

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

1. **Read Documentation**
   - [Main README](./README.md)
   - [Legal Core Docs](./apps/legal-core/README.md)
   - [Frontend Docs](./apps/frontend/README.md)
   - [Development Guide](./DEVELOPMENT.md)

2. **Explore Code**
   - Legal Core: `/apps/legal-core/src/`
   - Frontend: `/apps/frontend/src/`

3. **Run Tests**
   ```bash
   npm run test
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

---

## 🎉 Success Checklist

- [ ] Legal Core running on port 3000
- [ ] Frontend running on port 3000 (or 3001)
- [ ] PostgreSQL connected
- [ ] RabbitMQ connected
- [ ] Can access health endpoint
- [ ] Can trigger manual check
- [ ] Frontend displays all 5 tabs
- [ ] All text is in Russian
- [ ] Mobile-responsive layout works

---

## 💡 Pro Tips

1. **Use Docker**: Simplest way to get started
2. **Check Logs**: Always check logs when debugging
3. **RabbitMQ UI**: Great for monitoring message queues
4. **Hot Reload**: Both apps support hot reload in dev mode
5. **Mobile Testing**: Use ngrok for real device testing

---

## 📞 Need Help?

- **Documentation**: Check README files in each app
- **Issues**: Create GitHub issue
- **Email**: dev@migranthub.ru
- **Telegram**: @migranthub_dev

---

**Happy Coding!** 🚀

*Built for 1.2M migrants from 🇺🇿 🇹🇯 🇰🇬*
