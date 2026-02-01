# Localization Audit Report: English (en)

**Date:** 2026-02-01
**File:** `apps/frontend/src/locales/en.json`
**Auditor:** Claude (Automated)

## Summary

| Metric | Value |
|--------|-------|
| Total keys reviewed | ~2456 |
| Issues identified | 58 |
| Issues fixed | 58 |
| JSON validity | Valid |

## Categories of Changes

### 1. Terminology (28 corrections)

Russian abbreviations and terms were replaced with proper English equivalents.

| Key Path | Before | After | Reason |
|----------|--------|-------|--------|
| `services.items.check.subtitle` | "MVD/FSSP databases" | "Entry ban databases" | Remove Russian abbreviations |
| `services.items.permitStatus.title` | "RVP/VNJ Status" | "Permit Status" | Use English terminology |
| `services.items.fsspCheck.subtitle` | "Bailiff debts" | "Court debts and fines" | Clearer English term |
| `services.items.passportValidity.subtitle` | "RF passport validity" | "Russian passport validity" | Expand abbreviation |
| `services.items.gibddCheck.subtitle` | "Check GIBDD fines" | "Check traffic violations" | Remove Russian abbreviation |
| `services.items.map.subtitle` | "MVD, MMC, Routes" | "Offices and centers nearby" | User-friendly English |
| `services.items.banCheck.subtitle` | "MVD/FSSP" | "Entry restrictions" | Remove Russian abbreviations |
| `services.items.insurance.title` | "VHI / Medical" | "Health Insurance" | Standard English term |
| `services.banCheck.subtitle` | "MVD / FSSP" | "Entry Restrictions" | Remove Russian abbreviations |
| `services.banCheck.checkMvd` | "Check MVD database" | "Check migration database" | Clearer English |
| `services.banCheck.checkFssp` | "Check debts (FSSP)" | "Check court debts" | Remove abbreviation |
| `services.map.subtitle` | "MVD, MMC, Medical centers" | "Migration offices and centers" | User-friendly English |
| `services.map.filters.mvd` | "MVD" | "Migration offices" | Proper English term |
| `services.map.filters.mmc` | "MMC" | "Migration centers" | Proper English term |
| `permitStatus.rvp` | "RVP" | "TRP" | Standard English abbreviation |
| `permitStatus.rvpFull` | "Temporary residence" | "Temporary Residence Permit" | Complete term |
| `permitStatus.vnj` | "VNJ" | "RP" | Standard English abbreviation |
| `permitStatus.vnjFull` | "Residence permit" | "Residence Permit" | Proper capitalization |
| `permitStatus.infoHint` | "MVD Russia database" | "official government databases" | Generic term |
| `sos.hotline` | "MVD hotline" | "Migration hotline" | Clear English |
| `poi.mvd` | "MVD departments" | "Migration departments" | Proper English |
| `poi.medCenters` | "Medical centers (MMC)" | "Medical centers" | Remove abbreviation |
| `poi.types.mvd` | "MVD department" | "Migration department" | Proper English |
| `services.patentCalculator.infoNote` | "Check with MVD" | "Check with migration authorities" | Clear English |
| `services.patentCheck.infoNote` | "using MVD databases" | "using official migration databases" | Clear English |
| `services.patentCheck.recommendation2` | "Contact MVD" | "Contact migration office" | Clear English |
| `profile.omsPolicy` | "OMS policy" | "Public health insurance" | English term |
| `knowledgeBase.categories.rvp` | "TRP" | "Temporary Residence" | Full term for clarity |
| `knowledgeBase.categories.vnj` | "Residence" | "Residence Permit" | Complete term |

### 2. Stylistic (15 corrections)

Title Case applied to headings, consistent abbreviation formats.

| Key Path | Before | After | Reason |
|----------|--------|-------|--------|
| `common.rublesShort` | "rub." | "RUB" | Standard currency abbreviation |
| `common.monthShort` | "mo." | "mo" | Remove unnecessary period |
| `payment.months` | "mo." | "mo" | Consistency |
| `welcome.whatCanDo` | "What the app can do" | "What This App Can Do" | Title Case |
| `welcome.features.legal.title` | "Legal processing" | "Legal Processing" | Title Case |
| `welcome.features.documents.title` | "Document storage" | "Document Storage" | Title Case |
| `welcome.features.map.title` | "Services map" | "Services Map" | Title Case |
| `services.calculator.currentlyInRussia` | "Currently in RF" | "Currently in Russia" | Expand abbreviation |
| `documents.forms.employerNotification.title` | "Employment contract notification" | "Employment Contract Notification" | Title Case |
| `documents.forms.employerTermination.title` | "Employment termination notification" | "Employment Termination Notification" | Title Case |
| `wizard.documents.insurance.title` | "VHI policy" | "Health Insurance Policy" | Standard term + Title Case |
| `wizard.quickSelect.docs.insurance` | "VHI policy" | "Health insurance policy" | Standard term |
| `audit.documents.insurance` | "VHI policy" | "Health insurance policy" | Standard term |
| `documents.types.insurance` | "VHI policy" | "Health insurance policy" | Standard term |
| `documents.types.dms` | "VHI policy" | "Health insurance policy" | Standard term |

### 3. Grammar and Phrasing (15 corrections)

Improved natural English flow and removed calques from Russian.

| Key Path | Before | After | Reason |
|----------|--------|-------|--------|
| `welcome.tagline` | "...avoid fines and control the legalization process." | "...avoid fines, and stay in control of your legalization journey." | More natural English |
| `welcome.benefits.safety.description` | "You no longer fear police, inspections, or sudden deportation." | "No more worrying about inspections or unexpected complications." | Less alarming tone |
| `welcome.benefits.language.description` | "we've translated them into simple language" | "we explain them in plain language" | More natural |
| `welcome.benefits.savings.description` | "you save on 'helpers'" | "save money on middlemen" | Natural English phrasing |
| `welcome.benefits.technology.description` | "People can forget or make mistakes, our algorithm - never." | "People forget; our system never does." | Better English structure |
| `welcome.benefits.honesty.description` | "We don't promise the impossible (fake registrations)." | "We never promise the impossible." | More professional |
| `legal.warning.description` | "We do not make fake registrations." | "We do not provide fake registrations." | Better verb choice |
| `welcome.features.documents.description` | "Secure encrypted storage of document copies" | "Secure encrypted storage for your document copies" | Added article |
| `welcome.features.notifications.description` | "Notifications about patent and registration renewal deadlines" | "Timely notifications about patent and registration deadlines" | More natural |
| `welcome.features.map.description` | "Ministry of Interior, medical centers, exams - all necessary addresses nearby" | "Migration offices, medical centers, exam locations, and more nearby" | Clearer English |
| `sos.detained.dontBeRude` | "Don't be rude or resist" | "Do not be rude or resist" | More formal |
| `sos.detained.noBribery` | "Don't give bribes" | "Do not offer bribes" | More formal |
| `sos.detained.rightToRecord` | "(Art. 29 of the Russian Constitution)" | "(Article 29, Russian Constitution)" | Better format |
| `sos.detained.rightToTranslator` | "(Art. 25.10 of the Administrative Code)" | "(Article 25.10, Administrative Code)" | Better format |
| `examTrainer.hints.hint` | "Hint: Think about..." (with emoji) | "Hint: Think about..." (no emoji) | Professional tone |

### 4. Abbreviation Expansions (5 corrections)

Expanded abbreviations for international users.

| Key Path | Before | After | Reason |
|----------|--------|-------|--------|
| `onboarding.profiling.purposeWarning` | "except for EAEU citizens" | "except for Eurasian Economic Union citizens" | Full term for clarity |
| `profile.eaeuNote` | "EAEU: Patent not required" | "Eurasian Economic Union: Patent not required" | Full term |
| `services.calculator.exemptions.items.eaeu` | "EAEU citizens with employment contract" | "Eurasian Economic Union citizens with employment contract" | Full term |
| `checklist.eaeu_info` | "EAEU citizens (Kazakhstan...)" | "Eurasian Economic Union citizens (Kazakhstan...)" | Full term |
| `audit.documents.contractSubtitle` | "Critical for EAEU citizens" | "Required for Eurasian Economic Union citizens" | Full term + better wording |

## Technical Notes

### JSON Validation
- File is valid JSON
- No duplicate keys at the same nesting level
- Nested objects properly use repeated key names (title, description, subtitle)

### Placeholder Formats
- Single braces `{variable}` - used in most places
- Double braces `{{variable}}` - used in checklist section (likely framework-specific)
- Both formats are valid and appear to be intentional

### Items NOT Changed
The following abbreviations were intentionally kept as they are commonly used:
- **TIN** (Taxpayer Identification Number) - widely understood
- **SNILS** - kept as this is the official Russian document name
- **TRP** (Temporary Residence Permit) - standard abbreviation with full form nearby
- **EAEU** - kept in some places where context is clear, expanded in user-facing descriptions

## Recommendations

1. **Create a terminology glossary** for consistent use across all language files
2. **Consider adding tooltips** for abbreviations that must remain (SNILS, TIN)
3. **Standardize placeholder format** - choose either `{var}` or `{{var}}` consistently
4. **Review mobile display** - some expanded terms may be long for small screens

## Quality Assurance

- [x] JSON syntax valid
- [x] No duplicate keys at same level
- [x] Placeholders intact
- [x] US English spelling used
- [x] Title Case for headings
- [x] Sentence case for descriptions
- [x] Professional terminology
- [x] Natural English phrasing
