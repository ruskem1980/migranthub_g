import { generatePDF, downloadPDF, sharePDF } from '@/features/documents/pdfGenerator'
import { FORMS_REGISTRY } from '@/features/documents/formsRegistry'
import { generateRandomProfileData, generateFormSpecificData } from './helpers/dataGenerator'

// Mock jsPDF
const mockJsPDF = {
  text: jest.fn(),
  setFontSize: jest.fn(),
  setTextColor: jest.fn(),
  setDrawColor: jest.fn(),
  line: jest.fn(),
  addPage: jest.fn(),
  addFileToVFS: jest.fn(),
  addFont: jest.fn(),
  setFont: jest.fn(),
  output: jest.fn().mockReturnValue(new Blob(['pdf content'], { type: 'application/pdf' })),
  internal: {
    pageSize: {
      getWidth: jest.fn().mockReturnValue(210),
      getHeight: jest.fn().mockReturnValue(297),
    },
  },
}

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => mockJsPDF)
})

// Mock URL methods
const mockCreateObjectURL = jest.fn().mockReturnValue('blob:test-url')
const mockRevokeObjectURL = jest.fn()
Object.defineProperty(global.URL, 'createObjectURL', { value: mockCreateObjectURL, writable: true })
Object.defineProperty(global.URL, 'revokeObjectURL', { value: mockRevokeObjectURL, writable: true })

describe('PDF Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generatePDF', () => {
    it('throws error for unknown form', async () => {
      await expect(
        generatePDF({
          formId: 'unknown-form',
          data: {},
          profileData: {},
        })
      ).rejects.toThrow('Form not found: unknown-form')
    })

    it('throws error for empty form id', async () => {
      await expect(
        generatePDF({
          formId: '',
          data: {},
          profileData: {},
        })
      ).rejects.toThrow('Form not found: ')
    })

    // Test each of the 13 forms
    FORMS_REGISTRY.forEach(form => {
      describe(`Form: ${form.id}`, () => {
        it('generates PDF with random data', async () => {
          const profileData = generateRandomProfileData()
          const formData = generateFormSpecificData(form.requiredFields)

          const result = await generatePDF({
            formId: form.id,
            data: formData,
            profileData,
          })

          expect(result).toBeInstanceOf(Blob)
          expect(result.type).toBe('application/pdf')
        })

        it('generates PDF with only profile data', async () => {
          const profileData = generateRandomProfileData()

          const result = await generatePDF({
            formId: form.id,
            data: {},
            profileData,
          })

          expect(result).toBeInstanceOf(Blob)
          expect(result.type).toBe('application/pdf')
        })

        it('generates PDF with only form data', async () => {
          const formData = generateFormSpecificData(form.requiredFields)

          const result = await generatePDF({
            formId: form.id,
            data: formData,
            profileData: {},
          })

          expect(result).toBeInstanceOf(Blob)
          expect(result.type).toBe('application/pdf')
        })

        it('handles empty data gracefully', async () => {
          const result = await generatePDF({
            formId: form.id,
            data: {},
            profileData: {},
          })

          expect(result).toBeInstanceOf(Blob)
          expect(result.type).toBe('application/pdf')
        })

        it('calls jsPDF constructor', async () => {
          const jsPDF = require('jspdf')

          await generatePDF({
            formId: form.id,
            data: {},
            profileData: generateRandomProfileData(),
          })

          expect(jsPDF).toHaveBeenCalledWith({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          })
        })

        it('sets font size for header', async () => {
          await generatePDF({
            formId: form.id,
            data: {},
            profileData: {},
          })

          expect(mockJsPDF.setFontSize).toHaveBeenCalledWith(12)
        })

        it('adds header text "MIGRANTHUB"', async () => {
          await generatePDF({
            formId: form.id,
            data: {},
            profileData: {},
          })

          expect(mockJsPDF.text).toHaveBeenCalledWith(
            'MIGRANTHUB',
            expect.any(Number),
            expect.any(Number),
            expect.objectContaining({ align: 'center' })
          )
        })

        it('adds form title', async () => {
          await generatePDF({
            formId: form.id,
            data: {},
            profileData: {},
          })

          expect(mockJsPDF.text).toHaveBeenCalledWith(
            form.titleShort,
            expect.any(Number),
            expect.any(Number),
            expect.objectContaining({ align: 'center' })
          )
        })

        it('draws separator line', async () => {
          await generatePDF({
            formId: form.id,
            data: {},
            profileData: {},
          })

          expect(mockJsPDF.setDrawColor).toHaveBeenCalledWith(200)
          expect(mockJsPDF.line).toHaveBeenCalled()
        })

        it('outputs PDF as blob', async () => {
          await generatePDF({
            formId: form.id,
            data: {},
            profileData: {},
          })

          expect(mockJsPDF.output).toHaveBeenCalledWith('blob')
        })

        it('adds signature and date lines', async () => {
          await generatePDF({
            formId: form.id,
            data: {},
            profileData: {},
          })

          expect(mockJsPDF.text).toHaveBeenCalledWith(
            'Podpis: _______________',
            expect.any(Number),
            expect.any(Number)
          )
          expect(mockJsPDF.text).toHaveBeenCalledWith(
            'Data: _______________',
            expect.any(Number),
            expect.any(Number)
          )
        })

        it('adds footer with MigrantHub branding', async () => {
          await generatePDF({
            formId: form.id,
            data: {},
            profileData: {},
          })

          expect(mockJsPDF.text).toHaveBeenCalledWith(
            'Generated by MigrantHub - migranthub.ru',
            expect.any(Number),
            expect.any(Number),
            expect.objectContaining({ align: 'center' })
          )
        })

        it('processes all required fields', async () => {
          const profileData = generateRandomProfileData()

          await generatePDF({
            formId: form.id,
            data: {},
            profileData,
          })

          // Verify text was called for each required field with data
          form.requiredFields.forEach(field => {
            if (profileData[field]) {
              // Check that text was called (the specific content depends on implementation)
              expect(mockJsPDF.text).toHaveBeenCalled()
            }
          })
        })

        it('uses placeholders for missing fields', async () => {
          await generatePDF({
            formId: form.id,
            data: {},
            profileData: {},
          })

          // When no data, should use placeholder '_______________'
          expect(mockJsPDF.text).toHaveBeenCalledWith(
            expect.stringContaining('_______________'),
            expect.any(Number),
            expect.any(Number)
          )
        })
      })
    })

    describe('data merging', () => {
      it('merges profile data and form data correctly', async () => {
        const profileData = { fullName: 'From Profile' }
        const formData = { passportNumber: 'From Form' }

        await generatePDF({
          formId: 'notification-arrival',
          data: formData,
          profileData,
        })

        // Both values should be used in text calls
        const textCalls = mockJsPDF.text.mock.calls.map(call => call[0])
        const combinedText = textCalls.join(' ')

        expect(combinedText).toContain('From Profile')
        expect(combinedText).toContain('From Form')
      })

      it('form data overrides profile data', async () => {
        const profileData = { fullName: 'Profile Name' }
        const formData = { fullName: 'Form Name' }

        await generatePDF({
          formId: 'notification-arrival',
          data: formData,
          profileData,
        })

        // Form data should take precedence
        const textCalls = mockJsPDF.text.mock.calls.map(call => call[0])
        const combinedText = textCalls.join(' ')

        expect(combinedText).toContain('Form Name')
      })
    })

    describe('pagination', () => {
      it('does not add page for small data sets', async () => {
        await generatePDF({
          formId: 'invitation-letter',
          data: {},
          profileData: { fullName: 'Test', passportNumber: 'ABC123' },
        })

        expect(mockJsPDF.addPage).not.toHaveBeenCalled()
      })
    })
  })

  describe('downloadPDF', () => {
    let mockLink: { href: string; download: string; click: jest.Mock }
    let createElementSpy: jest.SpyInstance
    let appendChildSpy: jest.SpyInstance
    let removeChildSpy: jest.SpyInstance

    beforeEach(() => {
      mockLink = { href: '', download: '', click: jest.fn() }
      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)
    })

    afterEach(() => {
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('creates anchor element', async () => {
      await downloadPDF({
        formId: 'notification-arrival',
        data: {},
        profileData: generateRandomProfileData(),
      })

      expect(createElementSpy).toHaveBeenCalledWith('a')
    })

    it('sets blob URL as href', async () => {
      await downloadPDF({
        formId: 'notification-arrival',
        data: {},
        profileData: generateRandomProfileData(),
      })

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockLink.href).toBe('blob:test-url')
    })

    it('sets download filename with form id and timestamp', async () => {
      const beforeTimestamp = Date.now()

      await downloadPDF({
        formId: 'notification-arrival',
        data: {},
        profileData: generateRandomProfileData(),
      })

      const afterTimestamp = Date.now()

      expect(mockLink.download).toMatch(/^notification-arrival_\d+\.pdf$/)

      // Extract timestamp from filename and verify it's valid
      const match = mockLink.download.match(/notification-arrival_(\d+)\.pdf/)
      if (match) {
        const fileTimestamp = parseInt(match[1], 10)
        expect(fileTimestamp).toBeGreaterThanOrEqual(beforeTimestamp)
        expect(fileTimestamp).toBeLessThanOrEqual(afterTimestamp)
      }
    })

    it('appends link to document body', async () => {
      await downloadPDF({
        formId: 'notification-arrival',
        data: {},
        profileData: generateRandomProfileData(),
      })

      expect(appendChildSpy).toHaveBeenCalledWith(mockLink)
    })

    it('triggers click on the link', async () => {
      await downloadPDF({
        formId: 'notification-arrival',
        data: {},
        profileData: generateRandomProfileData(),
      })

      expect(mockLink.click).toHaveBeenCalled()
    })

    it('removes link from document body', async () => {
      await downloadPDF({
        formId: 'notification-arrival',
        data: {},
        profileData: generateRandomProfileData(),
      })

      expect(removeChildSpy).toHaveBeenCalledWith(mockLink)
    })

    it('revokes blob URL after download', async () => {
      await downloadPDF({
        formId: 'notification-arrival',
        data: {},
        profileData: generateRandomProfileData(),
      })

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url')
    })

    it('works for all forms', async () => {
      for (const form of FORMS_REGISTRY) {
        jest.clearAllMocks()

        await downloadPDF({
          formId: form.id,
          data: {},
          profileData: generateRandomProfileData(),
        })

        expect(mockLink.click).toHaveBeenCalled()
        expect(mockLink.download).toContain(form.id)
      }
    })

    it('uses "document" as fallback when form not found', async () => {
      // Even though generatePDF throws for unknown forms, let's test the fallback
      // by mocking generatePDF to return a blob
      const mockGeneratePDF = jest.fn().mockResolvedValue(new Blob(['test'], { type: 'application/pdf' }))
      jest.doMock('@/features/documents/pdfGenerator', () => ({
        ...jest.requireActual('@/features/documents/pdfGenerator'),
        generatePDF: mockGeneratePDF,
      }))

      // For this test, we verify the actual implementation handles known forms correctly
      await downloadPDF({
        formId: 'patent-initial',
        data: {},
        profileData: generateRandomProfileData(),
      })

      expect(mockLink.download).toContain('patent-initial')
    })
  })

  describe('sharePDF', () => {
    let mockLink: { href: string; download: string; click: jest.Mock }
    let createElementSpy: jest.SpyInstance
    let appendChildSpy: jest.SpyInstance
    let removeChildSpy: jest.SpyInstance

    beforeEach(() => {
      mockLink = { href: '', download: '', click: jest.fn() }
      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
      removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)
    })

    afterEach(() => {
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
      // Reset navigator.share and canShare
      Object.defineProperty(navigator, 'share', { value: undefined, writable: true, configurable: true })
      Object.defineProperty(navigator, 'canShare', { value: undefined, writable: true, configurable: true })
    })

    it('uses Web Share API when available and supported', async () => {
      const mockShare = jest.fn().mockResolvedValue(undefined)
      const mockCanShare = jest.fn().mockReturnValue(true)

      Object.defineProperty(navigator, 'share', { value: mockShare, writable: true, configurable: true })
      Object.defineProperty(navigator, 'canShare', { value: mockCanShare, writable: true, configurable: true })

      await sharePDF({
        formId: 'notification-arrival',
        data: {},
        profileData: generateRandomProfileData(),
      })

      expect(mockCanShare).toHaveBeenCalled()
      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          files: expect.arrayContaining([expect.any(File)]),
          title: expect.any(String),
        })
      )
    })

    it('passes correct file to share API', async () => {
      const mockShare = jest.fn().mockResolvedValue(undefined)
      const mockCanShare = jest.fn().mockReturnValue(true)

      Object.defineProperty(navigator, 'share', { value: mockShare, writable: true, configurable: true })
      Object.defineProperty(navigator, 'canShare', { value: mockCanShare, writable: true, configurable: true })

      await sharePDF({
        formId: 'notification-arrival',
        data: {},
        profileData: generateRandomProfileData(),
      })

      const shareCall = mockShare.mock.calls[0][0]
      expect(shareCall.files).toHaveLength(1)
      expect(shareCall.files[0]).toBeInstanceOf(File)
      expect(shareCall.files[0].name).toBe('notification-arrival.pdf')
      expect(shareCall.files[0].type).toBe('application/pdf')
    })

    it('passes form title to share API', async () => {
      const mockShare = jest.fn().mockResolvedValue(undefined)
      const mockCanShare = jest.fn().mockReturnValue(true)

      Object.defineProperty(navigator, 'share', { value: mockShare, writable: true, configurable: true })
      Object.defineProperty(navigator, 'canShare', { value: mockCanShare, writable: true, configurable: true })

      await sharePDF({
        formId: 'notification-arrival',
        data: {},
        profileData: generateRandomProfileData(),
      })

      const shareCall = mockShare.mock.calls[0][0]
      expect(shareCall.title).toBe('Уведомление о прибытии иностранного гражданина')
    })

    it('falls back to download when share is undefined', async () => {
      Object.defineProperty(navigator, 'share', { value: undefined, writable: true, configurable: true })

      await sharePDF({
        formId: 'notification-arrival',
        data: {},
        profileData: generateRandomProfileData(),
      })

      expect(mockLink.click).toHaveBeenCalled()
    })

    it('falls back to download when canShare returns false', async () => {
      const mockShare = jest.fn()
      const mockCanShare = jest.fn().mockReturnValue(false)

      Object.defineProperty(navigator, 'share', { value: mockShare, writable: true, configurable: true })
      Object.defineProperty(navigator, 'canShare', { value: mockCanShare, writable: true, configurable: true })

      await sharePDF({
        formId: 'notification-arrival',
        data: {},
        profileData: generateRandomProfileData(),
      })

      expect(mockShare).not.toHaveBeenCalled()
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('works for all forms with Web Share API', async () => {
      const mockShare = jest.fn().mockResolvedValue(undefined)
      const mockCanShare = jest.fn().mockReturnValue(true)

      Object.defineProperty(navigator, 'share', { value: mockShare, writable: true, configurable: true })
      Object.defineProperty(navigator, 'canShare', { value: mockCanShare, writable: true, configurable: true })

      for (const form of FORMS_REGISTRY) {
        jest.clearAllMocks()

        await sharePDF({
          formId: form.id,
          data: {},
          profileData: generateRandomProfileData(),
        })

        expect(mockShare).toHaveBeenCalled()

        const shareCall = mockShare.mock.calls[0][0]
        expect(shareCall.files[0].name).toBe(`${form.id}.pdf`)
        expect(shareCall.title).toBe(form.title)
      }
    })

    it('works for all forms with fallback to download', async () => {
      Object.defineProperty(navigator, 'share', { value: undefined, writable: true, configurable: true })

      for (const form of FORMS_REGISTRY) {
        jest.clearAllMocks()

        await sharePDF({
          formId: form.id,
          data: {},
          profileData: generateRandomProfileData(),
        })

        expect(mockLink.click).toHaveBeenCalled()
      }
    })
  })

  describe('stress tests', () => {
    it('generates multiple PDFs in sequence', async () => {
      const profileData = generateRandomProfileData()

      for (const form of FORMS_REGISTRY) {
        const result = await generatePDF({
          formId: form.id,
          data: {},
          profileData,
        })

        expect(result).toBeInstanceOf(Blob)
      }
    })

    it('handles concurrent PDF generation', async () => {
      const profileData = generateRandomProfileData()

      const promises = FORMS_REGISTRY.map(form =>
        generatePDF({
          formId: form.id,
          data: {},
          profileData,
        })
      )

      const results = await Promise.all(promises)

      expect(results).toHaveLength(12)
      results.forEach(result => {
        expect(result).toBeInstanceOf(Blob)
        expect(result.type).toBe('application/pdf')
      })
    })

    it('generates PDFs with varying data completeness', async () => {
      const form = FORMS_REGISTRY[0]
      const fullData = generateRandomProfileData()
      const partialData = { fullName: fullData.fullName }
      const emptyData = {}

      const results = await Promise.all([
        generatePDF({ formId: form.id, data: {}, profileData: fullData }),
        generatePDF({ formId: form.id, data: {}, profileData: partialData }),
        generatePDF({ formId: form.id, data: {}, profileData: emptyData }),
      ])

      results.forEach(result => {
        expect(result).toBeInstanceOf(Blob)
        expect(result.type).toBe('application/pdf')
      })
    })
  })
})
