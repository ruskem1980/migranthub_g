'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Scan, Check, AlertCircle, RotateCcw } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface PassportData {
  fullName?: string;
  fullNameLatin?: string;
  passportNumber?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  citizenship?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
}

interface PassportScannerProps {
  onScanComplete: (data: PassportData, imageUri: string) => void;
  onCancel: () => void;
}

type ScanStep = 'capture' | 'processing' | 'review' | 'error';

export function PassportScanner({ onScanComplete, onCancel }: PassportScannerProps) {
  const [step, setStep] = useState<ScanStep>('capture');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<PassportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    setStep('processing');
    setError(null);

    try {
      // Compress image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      // Create data URL for preview
      const reader = new FileReader();
      reader.onload = () => {
        setImageUri(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

      // Simulate OCR processing (in production, use capacitor-cyrillic-ocr or server-side OCR)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Demo: Return mock data
      // In production, this would be real OCR result
      const mockData: PassportData = {
        fullName: 'УСМАНОВ АЛИШЕР БАХТИЯРОВИЧ',
        fullNameLatin: 'USMANOV ALISHER BAKHTIYAROVICH',
        passportNumber: 'AA 1234567',
        birthDate: '1990-05-15',
        gender: 'male',
        citizenship: 'UZB',
        passportIssueDate: '2020-01-10',
        passportExpiryDate: '2030-01-10',
      };

      setScannedData(mockData);
      setStep('review');
    } catch (err) {
      console.error('OCR error:', err);
      setError('Не удалось распознать документ. Попробуйте сделать фото лучшего качества.');
      setStep('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleRetry = () => {
    setStep('capture');
    setImageUri(null);
    setScannedData(null);
    setError(null);
  };

  const handleConfirm = () => {
    if (scannedData && imageUri) {
      onScanComplete(scannedData, imageUri);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-white font-medium"
        >
          Отмена
        </button>
        <h2 className="text-white font-bold">Сканирование паспорта</h2>
        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center p-6">
        {step === 'capture' && (
          <>
            {/* Viewfinder */}
            <div className="relative w-full max-w-sm aspect-[3/4] border-2 border-white/50 rounded-2xl overflow-hidden mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/70">
                  <Camera className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-sm">
                    Поместите паспорт в рамку
                  </p>
                </div>
              </div>

              {/* Corner markers */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
            </div>

            {/* Instructions */}
            <div className="text-center text-white/80 mb-8 max-w-sm">
              <p className="text-sm">
                Убедитесь, что фото чёткое и все данные видны.
                Лучше всего при хорошем освещении.
              </p>
            </div>

            {/* Capture buttons */}
            <div className="flex gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={handleCapture}
                className="flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl"
              >
                <Camera className="w-5 h-5" />
                Сделать фото
              </button>

              <button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }
                }}
                className="flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-xl"
              >
                <Upload className="w-5 h-5" />
                Загрузить
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center text-white">
            <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6" />
            <div className="flex items-center justify-center gap-2 mb-2">
              <Scan className="w-6 h-6" />
              <h3 className="text-xl font-bold">Распознаём данные...</h3>
            </div>
            <p className="text-white/70">
              Это займёт несколько секунд
            </p>
          </div>
        )}

        {step === 'review' && scannedData && (
          <div className="w-full max-w-sm">
            {/* Preview image */}
            {imageUri && (
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-6">
                <img
                  src={imageUri}
                  alt="Паспорт"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Распознано
                </div>
              </div>
            )}

            {/* Recognized data */}
            <div className="bg-white rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Распознанные данные:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ФИО:</span>
                  <span className="font-medium text-gray-900">{scannedData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Номер паспорта:</span>
                  <span className="font-medium text-gray-900">{scannedData.passportNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Дата рождения:</span>
                  <span className="font-medium text-gray-900">{scannedData.birthDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Гражданство:</span>
                  <span className="font-medium text-gray-900">{scannedData.citizenship}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 flex items-center justify-center gap-2 bg-white/20 text-white font-semibold py-3 rounded-xl"
              >
                <RotateCcw className="w-5 h-5" />
                Переснять
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-xl"
              >
                <Check className="w-5 h-5" />
                Подтвердить
              </button>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center text-white">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Ошибка распознавания</h3>
            <p className="text-white/70 mb-6 max-w-sm">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl mx-auto"
            >
              <RotateCcw className="w-5 h-5" />
              Попробовать снова
            </button>
          </div>
        )}
      </div>

      {/* Demo notice */}
      <div className="p-4">
        <div className="bg-yellow-500/20 text-yellow-200 text-xs text-center p-2 rounded-lg">
          Демо: При загрузке любого изображения будут показаны тестовые данные
        </div>
      </div>
    </div>
  );
}
