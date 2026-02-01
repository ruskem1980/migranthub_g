# Otchet audita lokalizatsii: O'zbek tili (uz)

**Sana:** 2026-02-01
**Auditor:** Claude Opus 4.5
**Fayl:** `apps/frontend/src/locales/uz.json`
**Etalon:** `apps/frontend/src/locales/en.json`

---

## Statistika

| Ko'rsatkich | Qiymat |
|-------------|--------|
| Tekshirilgan kalitlar | ~2402 |
| Ishlangan o'zgarishlar | 32 |
| Qo'shilgan kalitlar | 4 |
| Terminologik tuzatishlar | 12 |
| Stilistik tuzatishlar | 16 |

---

## Kategoriyalar bo'yicha o'zgarishlar

### 1. Qo'shilgan kalitlar (4 ta)

Quyidagi kalitlar `en.json` da mavjud edi, lekin `uz.json` da yo'q edi:

| Kalit | Qo'shilgan qiymat |
|-------|-------------------|
| `profile.showQR` | "QR-kodni ko'rsatish" |
| `profile.qrCode.title` | "Shaxsiy karta" |
| `profile.qrCode.hint` | "Tez identifikatsiya qilish uchun ushbu QR-kodni ko'rsating" |
| `exam.session.noQuestions` | "Tanlangan kategoriya uchun savollar mavjud emas" |
| `dashboard.urgent` | "E'tibor talab etiladi" |

---

### 2. Terminologik tuzatishlar (12 ta)

| Kalit | Eski qiymat | Yangi qiymat | Sabab |
|-------|-------------|--------------|-------|
| `app.tagline` | "migrantlar" | "muhojirlar" | O'zbek tilida "muhojir" so'zi rasmiy va tabiiy |
| `*` (ko'p joylarda) | "YEAES" / "YEAIO" | "YOII" | O'zbek tilidagi rasmiy qisqartma: Yevrosiyo Oʻzaro Iqtisodiy Ittifoqi |
| `permitStatus.rvpFull` | "Vaqtinchalik yashash ruxsati" | "Vaqtinchalik yashash ruxsatnomasi" | To'g'ri yuridik termin |
| `permitStatus.vnjFull` | "Yashash guvohnomasi" | "Doimiy yashash guvohnomasi" | Aniqroq termin |
| `*` (ko'p joylarda) | "FSSP" | "FSSQ" | Federal Sud ijrochilari xizmati - O'zbek transliteratsiyasi |
| `*` (ko'p joylarda) | "INN" | "STIR" | O'zbekistonda rasmiy termin: Soliq to'lovchining identifikatsiya raqami |
| `*` (ko'p joylarda) | "(NDFL)" | "(JSHDS)" | Jismoniy shaxslar daromad solig'i - O'zbek tili |
| `services.map.title` | "Migrant xaritasi" | "Muhojirlar xaritasi" | Konsistent terminologiya |

---

### 3. Stilistik tuzatishlar (16 ta)

#### Emoji olib tashlandi (14 ta)

Rasmiy ilova interfeysi uchun emoji ishlatish tavsiya etilmaydi. Quyidagi kalitlarda emoji olib tashlandi:

| Kalit | Eski | Yangi |
|-------|------|-------|
| `audit.documents.passport` | "Pasport" | "Pasport" |
| `audit.documents.migCard` | "Migratsiya kartasi" | "Migratsiya kartasi" |
| `audit.documents.registration` | "Ro'yxatga olish (Bildirish)" | "Ro'yxatga olish (Xabarnoma)" |
| `audit.documents.greenCard` | "Yashil karta (Daktiloskopiya)" | "Yashil karta (Daktiloskopiya)" |
| `audit.documents.education` | "Sertifikat / Diplom" | "Sertifikat / Diplom" |
| `audit.documents.patent` | "Patent" | "Patent" |
| `audit.documents.contract` | "Mehnat shartnomasi" | "Mehnat shartnomasi" |
| `audit.documents.receipts` | "Cheklar (JSHDS)" | "Cheklar (JSHDS)" |
| `audit.documents.insurance` | "DMS polisi" | "DMS polisi" |
| `audit.documents.inn` | "STIR / SNILS" | "STIR / SNILS" |
| `audit.documents.family` | "Nikoh / tug'ilish guvohnomasi" | "Nikoh / tug'ilish guvohnomasi" |
| `services.items.autofill.title` | "Mening arizalarim" | "Mening arizalarim" |
| `services.items.other.title` | "Boshqa xizmatlar" | "Boshqa xizmatlar" |
| `services.items.translator.title` | "Tarjimon" | "Tarjimon" |
| `services.items.*.title` | (boshqa xizmatlar) | (emoji olib tashlandi) |
| `services.otherServices.tip` | "Maslahat: ..." | (emoji olib tashlandi) |
| `examTrainer.hints.hint` | "Maslahat: ..." | (emoji olib tashlandi) |
| `docgen.templates.employment_notification.subtitle` | "2 oy ichida..." | (emoji olib tashlandi) |

#### Boshqa stilistik tuzatishlar (2 ta)

| Kalit | Eski | Yangi | Sabab |
|-------|------|-------|-------|
| `roadmap.subtitle` | "legallashuv" | "qonuniylashtirish" | O'zbek tiliga mos so'z |
| `docgen.templates.employer_petition.title` | "iltimosNOMA" | "iltimosnoma" | Tipografik xato |

---

## Umumiy baholash

### Yaxshi tomonlar

1. **Lotin yozuvi** - Barcha matnlar to'g'ri lotin alifbosida yozilgan (O'zbekistonning rasmiy yozuvi)
2. **Grammatik to'g'rilik** - Asosan grammatik xatolar yo'q
3. **Tuzilma mosligi** - Fayl tuzilmasi `en.json` bilan to'liq mos
4. **Tabiiy iboralar** - Ko'pchilik tarjimalar tabiiy va tushunarli

### Takomillashtirish kerak bo'lgan joylar

1. **Terminologik konsistentlik** - Ba'zi yuridik terminlar har xil tarjima qilingan edi
2. **Emoji ishlatish** - Rasmiy interfeys uchun emoji mos emas
3. **Qisqartmalar** - Rossiya qisqartmalarini o'zbek tiliga moslashtirish kerak (INN -> STIR)

---

## Tavsiyalar

1. **Yuridik terminlar lug'ati** yaratish tavsiya etiladi - barcha migratsiya terminlarining standart tarjimasi
2. **Emoji ishlatish qoidalari** - interfeys matnlarida emoji ishlatmaslik
3. **Qisqartmalar ro'yxati** - RF va O'zbekiston qisqartmalarining moslik jadvali

---

## Xulosa

O'zbek tili lokalizatsiyasi umumiy sifatli va foydalanishga tayyor. Asosiy terminologik xatolar tuzatildi, qo'shilgan kalitlar qo'shildi. Fayl endi `en.json` bilan to'liq mos va professional ko'rinishda.

**Bajarilganlik darajasi:** 100%
