/**
 * Random data generators for PDF form testing
 */

// Generate random string from charset
export const randomString = (length: number, charset = 'abcdefghijklmnopqrstuvwxyz'): string => {
  return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('')
}

// Generate random Cyrillic string
export const randomCyrillic = (length: number): string => {
  const chars = 'абвгдежзийклмнопрстуфхцчшщъыьэюя'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// Generate random date in format YYYY-MM-DD
export const randomDate = (startYear: number, endYear: number): string => {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear))
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Generate random passport number
export const randomPassportNumber = (): string =>
  randomString(9, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')

// Generate random INN (12 digits)
export const randomINN = (): string => randomString(12, '0123456789')

// Generate random migration card number
export const randomMigrationCardNumber = (): string => randomString(12, '0123456789')

// Generate random patent number
export const randomPatentNumber = (): string => randomString(12, '0123456789')

// Generate random phone number
export const randomPhone = (): string => `+7${randomString(10, '0123456789')}`

// List of CIS countries for citizenship
const CIS_COUNTRIES = ['Узбекистан', 'Таджикистан', 'Кыргызстан', 'Казахстан', 'Армения', 'Азербайджан']

// List of Russian regions for patent
const PATENT_REGIONS = ['Москва', 'Московская область', 'Санкт-Петербург', 'Краснодарский край', 'Свердловская область']

/**
 * Generate complete random profile data for all possible form fields
 */
export function generateRandomProfileData(): Record<string, any> {
  const birthDate = randomDate(1970, 2000)
  const entryDate = randomDate(2023, 2024)

  const lastName = randomCyrillic(8)
  const firstName = randomCyrillic(6)
  const middleName = randomCyrillic(10)

  const lastNameLatin = randomString(8).toUpperCase()
  const firstNameLatin = randomString(6).toUpperCase()

  return {
    // Personal info
    fullName: `${lastName} ${firstName} ${middleName}`,
    fullNameLatin: `${lastNameLatin} ${firstNameLatin}`,
    passportNumber: randomPassportNumber(),
    citizenship: CIS_COUNTRIES[Math.floor(Math.random() * CIS_COUNTRIES.length)],
    birthDate,
    gender: Math.random() > 0.5 ? 'male' : 'female',

    // Entry info
    entryDate,
    migrationCardNumber: randomMigrationCardNumber(),

    // Registration info
    registrationAddress: `г. Москва, ул. ${randomCyrillic(10)}, д. ${Math.floor(Math.random() * 100)}, кв. ${Math.floor(Math.random() * 200)}`,
    registrationExpiry: randomDate(2025, 2026),

    // Host info
    hostFullName: `${randomCyrillic(8)} ${randomCyrillic(6)} ${randomCyrillic(10)}`,
    hostAddress: `г. Москва, ул. ${randomCyrillic(8)}, д. ${Math.floor(Math.random() * 50)}, кв. ${Math.floor(Math.random() * 100)}`,

    // Patent info
    patentRegion: PATENT_REGIONS[Math.floor(Math.random() * PATENT_REGIONS.length)],
    patentExpiry: randomDate(2025, 2026),
    patentNumber: randomPatentNumber(),

    // Employer info
    employerName: `ООО "${randomCyrillic(10)}"`,
    employerINN: randomINN(),
    employerAddress: `г. Москва, ул. ${randomCyrillic(12)}, д. ${Math.floor(Math.random() * 100)}`,

    // Contact info
    phone: randomPhone(),
    email: `${randomString(8)}@test.com`,
  }
}

/**
 * Generate data only for specific required fields
 */
export function generateFormSpecificData(requiredFields: string[]): Record<string, any> {
  const allData = generateRandomProfileData()
  return Object.fromEntries(
    requiredFields.map(field => [field, allData[field] ?? `test_${field}`])
  )
}

/**
 * Generate partial data (for testing missing fields scenarios)
 */
export function generatePartialProfileData(fieldsToInclude: string[]): Record<string, any> {
  const allData = generateRandomProfileData()
  return Object.fromEntries(
    fieldsToInclude.filter(field => field in allData).map(field => [field, allData[field]])
  )
}
