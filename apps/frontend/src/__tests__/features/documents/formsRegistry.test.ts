import {
  FORMS_REGISTRY,
  getFormById,
  getMissingFields,
  FIELD_LABELS,
  FORMS_BY_CATEGORY,
  CATEGORY_LABELS,
  type FormCategory,
} from '@/features/documents/formsRegistry'
import { generateRandomProfileData } from './helpers/dataGenerator'

describe('FormsRegistry', () => {
  describe('FORMS_REGISTRY', () => {
    it('should contain 12 forms', () => {
      expect(FORMS_REGISTRY).toHaveLength(12)
    })

    it('each form should have all required properties', () => {
      FORMS_REGISTRY.forEach(form => {
        expect(form).toHaveProperty('id')
        expect(form).toHaveProperty('title')
        expect(form).toHaveProperty('titleShort')
        expect(form).toHaveProperty('description')
        expect(form).toHaveProperty('category')
        expect(form).toHaveProperty('requiredFields')
        expect(form).toHaveProperty('estimatedTime')
        expect(form).toHaveProperty('icon')
      })
    })

    it('each form should have non-empty id', () => {
      FORMS_REGISTRY.forEach(form => {
        expect(form.id).toBeTruthy()
        expect(typeof form.id).toBe('string')
        expect(form.id.length).toBeGreaterThan(0)
      })
    })

    it('each form should have at least one required field', () => {
      FORMS_REGISTRY.forEach(form => {
        expect(Array.isArray(form.requiredFields)).toBe(true)
        expect(form.requiredFields.length).toBeGreaterThan(0)
      })
    })

    it('all form IDs should be unique', () => {
      const ids = FORMS_REGISTRY.map(form => form.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('all required fields should have labels defined', () => {
      const allRequiredFields = new Set(
        FORMS_REGISTRY.flatMap(form => form.requiredFields)
      )
      allRequiredFields.forEach(field => {
        expect(FIELD_LABELS[field]).toBeDefined()
        expect(FIELD_LABELS[field].length).toBeGreaterThan(0)
      })
    })

    it('each form should have a valid category', () => {
      const validCategories: FormCategory[] = ['registration', 'patent', 'work', 'other']
      FORMS_REGISTRY.forEach(form => {
        expect(validCategories).toContain(form.category)
      })
    })
  })

  describe('getFormById', () => {
    it('returns form by valid id', () => {
      const form = getFormById('notification-arrival')
      expect(form).toBeDefined()
      expect(form?.id).toBe('notification-arrival')
      expect(form?.title).toBe('Уведомление о прибытии иностранного гражданина')
    })

    it('returns correct form for each existing id', () => {
      FORMS_REGISTRY.forEach(expectedForm => {
        const foundForm = getFormById(expectedForm.id)
        expect(foundForm).toBeDefined()
        expect(foundForm).toEqual(expectedForm)
      })
    })

    it('returns undefined for unknown id', () => {
      expect(getFormById('unknown-form-id')).toBeUndefined()
    })

    it('returns undefined for empty id', () => {
      expect(getFormById('')).toBeUndefined()
    })

    it('is case-sensitive', () => {
      expect(getFormById('NOTIFICATION-ARRIVAL')).toBeUndefined()
      expect(getFormById('Notification-Arrival')).toBeUndefined()
    })
  })

  describe('getMissingFields', () => {
    it('returns all fields when profile is empty', () => {
      const form = getFormById('notification-arrival')
      const missing = getMissingFields('notification-arrival', {})
      expect(missing).toEqual(form?.requiredFields)
    })

    it('returns empty array when all fields present', () => {
      const profile = {
        fullName: 'Иванов Иван Иванович',
        passportNumber: 'ABC123456',
        citizenship: 'Узбекистан',
        entryDate: '2024-01-01',
        hostFullName: 'Петров Петр Петрович',
        hostAddress: 'г. Москва, ул. Тестовая, д. 1',
      }
      const missing = getMissingFields('notification-arrival', profile)
      expect(missing).toEqual([])
    })

    it('returns only missing fields', () => {
      const profile = {
        fullName: 'Иванов Иван Иванович',
        passportNumber: 'ABC123456',
        // citizenship is missing
        entryDate: '2024-01-01',
        // hostFullName is missing
        hostAddress: 'г. Москва, ул. Тестовая, д. 1',
      }
      const missing = getMissingFields('notification-arrival', profile)
      expect(missing).toContain('citizenship')
      expect(missing).toContain('hostFullName')
      expect(missing).not.toContain('fullName')
      expect(missing).not.toContain('passportNumber')
    })

    it('returns empty array for unknown form', () => {
      expect(getMissingFields('unknown-form', {})).toEqual([])
    })

    it('handles null and undefined values as missing', () => {
      const profile = {
        fullName: 'Test',
        passportNumber: null,
        citizenship: undefined,
        entryDate: '2024-01-01',
        hostFullName: '',
        hostAddress: 'Address',
      }
      const missing = getMissingFields('notification-arrival', profile)
      expect(missing).toContain('passportNumber')
      expect(missing).toContain('citizenship')
      expect(missing).toContain('hostFullName')
    })

    it('works correctly for all forms with random data', () => {
      const profileData = generateRandomProfileData()

      FORMS_REGISTRY.forEach(form => {
        const missing = getMissingFields(form.id, profileData)
        // With full random data, most fields should be present
        // Only fields not in generateRandomProfileData would be missing
        expect(Array.isArray(missing)).toBe(true)
        missing.forEach(field => {
          expect(profileData[field]).toBeFalsy()
        })
      })
    })
  })

  describe('FORMS_BY_CATEGORY', () => {
    it('has exactly 4 categories', () => {
      expect(Object.keys(FORMS_BY_CATEGORY)).toHaveLength(4)
    })

    it('has all expected categories', () => {
      expect(FORMS_BY_CATEGORY).toHaveProperty('registration')
      expect(FORMS_BY_CATEGORY).toHaveProperty('patent')
      expect(FORMS_BY_CATEGORY).toHaveProperty('work')
      expect(FORMS_BY_CATEGORY).toHaveProperty('other')
    })

    it('registration category has 3 forms', () => {
      expect(FORMS_BY_CATEGORY.registration).toHaveLength(3)
    })

    it('patent category has 4 forms', () => {
      expect(FORMS_BY_CATEGORY.patent).toHaveLength(4)
    })

    it('work category has 2 forms', () => {
      expect(FORMS_BY_CATEGORY.work).toHaveLength(2)
    })

    it('other category has 3 forms', () => {
      expect(FORMS_BY_CATEGORY.other).toHaveLength(3)
    })

    it('total forms in categories equals FORMS_REGISTRY length', () => {
      const totalInCategories = Object.values(FORMS_BY_CATEGORY)
        .reduce((sum, forms) => sum + forms.length, 0)
      expect(totalInCategories).toBe(FORMS_REGISTRY.length)
    })

    it('each form in category has correct category property', () => {
      (Object.entries(FORMS_BY_CATEGORY) as [FormCategory, typeof FORMS_REGISTRY][]).forEach(
        ([category, forms]) => {
          forms.forEach(form => {
            expect(form.category).toBe(category)
          })
        }
      )
    })
  })

  describe('CATEGORY_LABELS', () => {
    it('has labels for all 4 categories', () => {
      expect(Object.keys(CATEGORY_LABELS)).toHaveLength(4)
    })

    it('has Russian labels for each category', () => {
      expect(CATEGORY_LABELS.registration).toBe('Регистрация')
      expect(CATEGORY_LABELS.patent).toBe('Патент')
      expect(CATEGORY_LABELS.work).toBe('Трудоустройство')
      expect(CATEGORY_LABELS.other).toBe('Другие документы')
    })

    it('all categories in FORMS_BY_CATEGORY have labels', () => {
      Object.keys(FORMS_BY_CATEGORY).forEach(category => {
        expect(CATEGORY_LABELS[category as FormCategory]).toBeDefined()
      })
    })
  })

  describe('FIELD_LABELS', () => {
    it('has labels for common personal fields', () => {
      expect(FIELD_LABELS.fullName).toBe('ФИО')
      expect(FIELD_LABELS.fullNameLatin).toBe('ФИО (латиницей)')
      expect(FIELD_LABELS.passportNumber).toBe('Номер паспорта')
      expect(FIELD_LABELS.citizenship).toBe('Гражданство')
      expect(FIELD_LABELS.birthDate).toBe('Дата рождения')
      expect(FIELD_LABELS.gender).toBe('Пол')
    })

    it('has labels for registration fields', () => {
      expect(FIELD_LABELS.entryDate).toBe('Дата въезда')
      expect(FIELD_LABELS.migrationCardNumber).toBe('Номер миграционной карты')
      expect(FIELD_LABELS.registrationAddress).toBe('Адрес регистрации')
      expect(FIELD_LABELS.registrationExpiry).toBe('Срок регистрации')
    })

    it('has labels for host fields', () => {
      expect(FIELD_LABELS.hostFullName).toBe('ФИО принимающей стороны')
      expect(FIELD_LABELS.hostAddress).toBe('Адрес принимающей стороны')
    })

    it('has labels for patent fields', () => {
      expect(FIELD_LABELS.patentRegion).toBe('Регион патента')
      expect(FIELD_LABELS.patentExpiry).toBe('Срок действия патента')
    })

    it('has labels for employer fields', () => {
      expect(FIELD_LABELS.employerName).toBe('Наименование работодателя')
      expect(FIELD_LABELS.employerINN).toBe('ИНН работодателя')
    })
  })

  describe('Form-specific tests', () => {
    describe('notification-arrival form', () => {
      it('has correct required fields for arrival notification', () => {
        const form = getFormById('notification-arrival')
        expect(form?.requiredFields).toContain('fullName')
        expect(form?.requiredFields).toContain('passportNumber')
        expect(form?.requiredFields).toContain('citizenship')
        expect(form?.requiredFields).toContain('entryDate')
        expect(form?.requiredFields).toContain('hostFullName')
        expect(form?.requiredFields).toContain('hostAddress')
      })
    })

    describe('patent-initial form', () => {
      it('has correct required fields for patent application', () => {
        const form = getFormById('patent-initial')
        expect(form?.requiredFields).toContain('fullName')
        expect(form?.requiredFields).toContain('passportNumber')
        expect(form?.requiredFields).toContain('citizenship')
        expect(form?.requiredFields).toContain('birthDate')
        expect(form?.requiredFields).toContain('migrationCardNumber')
      })
    })

    describe('employer-notification form', () => {
      it('has correct required fields for employer notification', () => {
        const form = getFormById('employer-notification')
        expect(form?.requiredFields).toContain('fullName')
        expect(form?.requiredFields).toContain('passportNumber')
        expect(form?.requiredFields).toContain('employerName')
        expect(form?.requiredFields).toContain('employerINN')
      })
    })

    describe('rvp-application form', () => {
      it('has correct required fields for RVP application', () => {
        const form = getFormById('rvp-application')
        expect(form?.requiredFields).toContain('fullName')
        expect(form?.requiredFields).toContain('fullNameLatin')
        expect(form?.requiredFields).toContain('passportNumber')
        expect(form?.requiredFields).toContain('birthDate')
        expect(form?.requiredFields).toContain('citizenship')
      })
    })
  })
})
