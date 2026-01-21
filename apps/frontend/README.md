# MigrantHub Frontend - Zero-Scroll Dashboard

## Overview

Mobile-first Next.js application with a "Zero-Scroll" architecture designed for migrants in Russia. All content fits within a single viewport (100vh) with no body scrolling, optimized for one-thumb interaction.

## 🎯 Key Features

### Zero-Scroll Architecture
- **Single Viewport**: 100vh container with `overflow-hidden`
- **No Body Scroll**: All navigation via bottom tabs
- **Tab-Specific Scrolling**: Individual tabs manage their own scroll areas
- **Mobile-First**: Optimized for 375px-428px width devices

### Russian Localization
All UI text is in Russian, targeting migrants from:
- 🇺🇿 Uzbekistan
- 🇹🇯 Tajikistan
- 🇰🇬 Kyrgyzstan

## 📱 Navigation Structure

### Bottom Navigation Bar (5 Tabs)

1. **🏠 Главная (Home)**
   - Status indicator: 🟢 Легально / 🟡 Риск / 🔴 Нелегал
   - Smart feed with urgent actions
   - Quick stats dashboard

2. **🗂 Документы (Documents)**
   - Horizontal scrolling carousel
   - Document cards with status badges
   - Floating camera button for scanning

3. **🛠 Сервисы (Services)**
   - 2x3 grid menu
   - Popular services section
   - Quick access to tools

4. **🤖 Ассистент (AI Assistant)**
   - Chat interface with AI
   - Quick question chips
   - Voice input support

5. **🚨 SOS (Emergency)**
   - Large emergency button
   - Secondary action list
   - Emergency contacts
   - Legal rights information

## 🏗 Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page (renders Dashboard)
│   └── globals.css         # Global styles + Tailwind
├── components/
│   ├── Dashboard.tsx       # Parent component (tab state)
│   ├── BottomNav.tsx       # Bottom navigation bar
│   └── tabs/
│       ├── HomeTab.tsx
│       ├── DocumentsTab.tsx
│       ├── ServicesTab.tsx
│       ├── AssistantTab.tsx
│       └── SOSTab.tsx
└── lib/
    └── utils.ts            # Utility functions (cn)
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6) - Main actions
- **Success**: Green (#10B981) - Active status
- **Warning**: Yellow (#F59E0B) - Risk alerts
- **Danger**: Red (#EF4444) - Emergency/SOS
- **Purple**: Purple (#8B5CF6) - AI features

### Typography
- **Font**: Inter (Latin + Cyrillic)
- **Sizes**: 
  - Headings: 20-32px
  - Body: 14-16px
  - Small: 12px

### Spacing
- **Container Padding**: 16px (px-4)
- **Card Gaps**: 12-16px
- **Bottom Nav Height**: 64px (h-16)

## 🚀 Getting Started

### Installation

```bash
cd apps/frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## 📦 Dependencies

### Core
- **Next.js 14**: React framework
- **React 18**: UI library
- **TypeScript**: Type safety

### UI
- **Tailwind CSS**: Utility-first CSS
- **Lucide React**: Icon library
- **clsx + tailwind-merge**: Class name utilities

## 🎯 Mobile Optimization

### Touch Targets
- Minimum 44x44px for all interactive elements
- Bottom navigation optimized for thumb reach
- Large buttons for critical actions (SOS)

### Performance
- **No animations** on scroll (zero-scroll design)
- **Lazy loading** for tab content
- **Optimized images** (WebP format)

### Accessibility
- **ARIA labels** on all interactive elements
- **Focus states** for keyboard navigation
- **High contrast** text (WCAG AA compliant)

## 🔐 Privacy & Security

- **No sensitive data** stored in localStorage
- **Encrypted API calls** (HTTPS only)
- **Session management** via secure cookies
- **GDPR compliant** data handling

## 📱 Telegram Mini App Support

The dashboard is designed to work as a Telegram Mini App:

```javascript
// Telegram WebApp initialization
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}
```

## 🌐 Internationalization (Future)

Currently Russian-only, but structured for future expansion:

```typescript
// Future i18n structure
const translations = {
  ru: { home: 'Главная', ... },
  uz: { home: 'Bosh sahifa', ... },
  tj: { home: 'Асосӣ', ... },
  kg: { home: 'Башкы', ... },
}
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Lighthouse audit
npm run lighthouse
```

## 📊 Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.0s
- **Lighthouse Score**: > 90
- **Bundle Size**: < 200KB (gzipped)

## 🐛 Known Issues

1. **iOS Safari**: Bottom navigation may overlap with home indicator
   - Solution: Use `safe-area-inset-bottom` padding
2. **Android Chrome**: Pull-to-refresh may interfere
   - Solution: Disable with `overscroll-behavior: none`

## 🔮 Roadmap

- [ ] Offline mode (PWA)
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] Dark mode
- [ ] Multi-language support (UZ, TJ, KG)
- [ ] Voice commands (Russian)

## 📝 License

Proprietary - MigrantHub Ecosystem

## 🤝 Contributing

This is a closed-source project. For internal development guidelines, see CONTRIBUTING.md.

## 📞 Support

For technical issues:
- Email: dev@migranthub.ru
- Telegram: @migranthub_dev
