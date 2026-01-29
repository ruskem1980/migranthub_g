'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Scan, Check, AlertCircle, RotateCcw, X, Edit3, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { useTranslation } from '@/lib/i18n';
import { ocrApi } from '@/lib/api/client';
import { offlineQueue } from '@/lib/sync/offlineQueue';

export interface OcrDocumentData {
  documentType?: string;
  fullName?: string;
  fullNameLatin?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  citizenship?: string;
  // Additional fields for various document types
  registrationAddress?: string;
  hostName?: string;
  entryDate?: string;
  borderPoint?: string;
  purpose?: string;
  patentRegion?: string;
  employer?: string;
  // Raw OCR text for manual editing
  rawText?: string;
}

interface DocumentScannerProps {
  onScanComplete: (data: OcrDocumentData, imageUri: string) => void;
  onCancel: () => void;
  documentType?: string;
}

type ScanStep = 'capture' | 'processing' | 'review' | 'error';

interface OcrProgress {
  status: 'uploading' | 'processing' | 'extracting' | 'done';
  progress: number;
  message: string;
}

export function DocumentScanner({ onScanComplete, onCancel, documentType }: DocumentScannerProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<ScanStep>('capture');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [, setScannedData] = useState<OcrDocumentData | null>(null);
  const [editableData, setEditableData] = useState<OcrDocumentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<OcrProgress | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isOfflineQueued, setIsOfflineQueued] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if online
  const isOnline = useCallback(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }, []);

  const updateProgress = useCallback((update: Partial<OcrProgress>) => {
    setOcrProgress(prev => prev ? { ...prev, ...update } : {
      status: 'uploading',
      progress: 0,
      message: t('scanner.preparing'),
      ...update
    });
  }, [t]);

  const processImage = async (file: File) => {
    setStep('processing');
    setError(null);
    setOcrProgress(null);
    setIsOfflineQueued(false);

    try {
      updateProgress({
        status: 'uploading',
        progress: 10,
        message: t('scanner.compressing'),
      });

      // Compress image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 2048,
        useWebWorker: true,
      });

      updateProgress({
        status: 'uploading',
        progress: 30,
        message: t('scanner.uploading'),
      });

      // Create data URL for preview
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(compressedFile);
      });

      setImageUri(dataUrl);

      // Check if offline - queue the request
      if (!isOnline()) {
        await offlineQueue.enqueue({
          action: t('scanner.ocrRequest'),
          endpoint: '/ocr/process',
          method: 'POST',
          body: {
            image: dataUrl,
            documentType: documentType,
          },
        });

        setIsOfflineQueued(true);
        setError(t('scanner.offlineQueued'));
        setStep('error');
        return;
      }

      updateProgress({
        status: 'processing',
        progress: 50,
        message: t('scanner.recognizing'),
      });

      // Send to OCR API
      const result = await ocrApi.processDocument(compressedFile, documentType);

      updateProgress({
        status: 'extracting',
        progress: 80,
        message: t('scanner.extracting'),
      });

      // Check if we got meaningful data
      const hasData = result.data?.fullName ||
        result.data?.documentNumber ||
        result.data?.birthDate;

      if (!hasData && !result.rawText) {
        throw new Error(t('scanner.noDataExtracted'));
      }

      const ocrData: OcrDocumentData = {
        documentType: documentType,
        fullName: result.data?.fullName,
        fullNameLatin: result.data?.fullNameLatin,
        documentNumber: result.data?.documentNumber,
        issueDate: result.data?.issueDate,
        expiryDate: result.data?.expiryDate,
        birthDate: result.data?.birthDate,
        gender: result.data?.gender,
        citizenship: result.data?.citizenship,
        registrationAddress: result.data?.registrationAddress,
        hostName: result.data?.hostName,
        entryDate: result.data?.entryDate,
        borderPoint: result.data?.borderPoint,
        purpose: result.data?.purpose,
        patentRegion: result.data?.patentRegion,
        employer: result.data?.employer,
        rawText: result.rawText,
      };

      setScannedData(ocrData);
      setEditableData(ocrData);

      updateProgress({
        status: 'done',
        progress: 100,
        message: t('scanner.complete'),
      });

      setStep('review');
    } catch (err) {
      console.error('OCR error:', err);

      // Check for network error - queue for offline
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        try {
          await offlineQueue.enqueue({
            action: t('scanner.ocrRequest'),
            endpoint: '/ocr/process',
            method: 'POST',
            body: {
              image: imageUri,
              documentType: documentType,
            },
          });
          setIsOfflineQueued(true);
          setError(t('scanner.offlineQueued'));
        } catch {
          setError(t('scanner.networkError'));
        }
      } else {
        setError(
          err instanceof Error
            ? err.message
            : t('scanner.recognitionFailed')
        );
      }
      setStep('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
    // Reset input value to allow selecting same file again
    e.target.value = '';
  };

  const handleCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleRetry = () => {
    setStep('capture');
    setImageUri(null);
    setScannedData(null);
    setEditableData(null);
    setError(null);
    setOcrProgress(null);
    setIsEditing(false);
    setIsOfflineQueued(false);
  };

  const handleConfirm = () => {
    if (editableData && imageUri) {
      onScanComplete(editableData, imageUri);
    }
  };

  const handleFieldChange = (field: keyof OcrDocumentData, value: string) => {
    setEditableData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const getProgressMessage = (): string => {
    if (!ocrProgress) return t('scanner.preparing');
    return ocrProgress.message;
  };

  const getProgressPercent = (): number => {
    if (!ocrProgress) return 0;
    return Math.round(ocrProgress.progress);
  };

  // Document type label
  const getDocumentTypeLabel = (): string => {
    if (!documentType) return t('scanner.document');
    const typeKey = `documents.types.${documentType}`;
    return t(typeKey) || documentType;
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        <button
          onClick={onCancel}
          className="text-white font-medium flex items-center gap-1"
        >
          <X className="w-5 h-5" />
          {t('common.cancel')}
        </button>
        <h2 className="text-white font-bold">{t('scanner.title')}</h2>
        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center p-6">
        {step === 'capture' && (
          <>
            {/* Viewfinder */}
            <div className="relative w-full max-w-sm aspect-[3/4] border-2 border-white/50 rounded-2xl overflow-hidden mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/70">
                  <Camera className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-sm px-4">
                    {t('scanner.placeDocument')}
                  </p>
                  {documentType && (
                    <p className="text-xs mt-2 text-blue-400 font-medium">
                      {getDocumentTypeLabel()}
                    </p>
                  )}
                </div>
              </div>

              {/* Corner markers */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
            </div>

            {/* Instructions */}
            <div className="text-center text-white/80 mb-6 max-w-sm px-4">
              <p className="text-sm">
                {t('scanner.instructions')}
              </p>
              <p className="text-xs mt-2 text-white/60">
                {t('scanner.tip')}
              </p>
            </div>

            {/* Capture buttons */}
            <div className="flex gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={handleCapture}
                className="flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl active:scale-95 transition-transform"
              >
                <Camera className="w-5 h-5" />
                {t('scanner.takePhoto')}
              </button>

              <button
                onClick={handleUpload}
                className="flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-xl active:scale-95 transition-transform"
              >
                <Upload className="w-5 h-5" />
                {t('scanner.uploadPhoto')}
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center text-white">
            <div className="relative w-24 h-24 mx-auto mb-6">
              {/* Progress circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - getProgressPercent() / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{getProgressPercent()}%</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Scan className="w-6 h-6 animate-pulse" />
              <h3 className="text-xl font-bold">{t('scanner.processing')}</h3>
            </div>
            <p className="text-white/70">
              {getProgressMessage()}
            </p>
          </div>
        )}

        {step === 'review' && editableData && (
          <div className="w-full max-w-sm">
            {/* Preview image */}
            {imageUri && (
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUri}
                  alt={t('scanner.preview')}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {t('scanner.recognized')}
                </div>
              </div>
            )}

            {/* Recognized data */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">{t('scanner.recognizedData')}</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded ${
                    isEditing ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditing ? t('common.done') : t('common.edit')}
                </button>
              </div>

              <div className="space-y-3 text-sm">
                {editableData.fullName !== undefined && (
                  <DataField
                    label={t('scanner.fields.fullName')}
                    value={editableData.fullName || ''}
                    isEditing={isEditing}
                    onChange={(v) => handleFieldChange('fullName', v)}
                  />
                )}
                {editableData.documentNumber !== undefined && (
                  <DataField
                    label={t('scanner.fields.documentNumber')}
                    value={editableData.documentNumber || ''}
                    isEditing={isEditing}
                    onChange={(v) => handleFieldChange('documentNumber', v)}
                  />
                )}
                {editableData.birthDate !== undefined && (
                  <DataField
                    label={t('scanner.fields.birthDate')}
                    value={editableData.birthDate || ''}
                    isEditing={isEditing}
                    onChange={(v) => handleFieldChange('birthDate', v)}
                    type="date"
                  />
                )}
                {editableData.issueDate !== undefined && (
                  <DataField
                    label={t('scanner.fields.issueDate')}
                    value={editableData.issueDate || ''}
                    isEditing={isEditing}
                    onChange={(v) => handleFieldChange('issueDate', v)}
                    type="date"
                  />
                )}
                {editableData.expiryDate !== undefined && (
                  <DataField
                    label={t('scanner.fields.expiryDate')}
                    value={editableData.expiryDate || ''}
                    isEditing={isEditing}
                    onChange={(v) => handleFieldChange('expiryDate', v)}
                    type="date"
                  />
                )}
                {editableData.gender !== undefined && (
                  <DataField
                    label={t('scanner.fields.gender')}
                    value={editableData.gender === 'male' ? t('profile.genders.male') : t('profile.genders.female')}
                    isEditing={false}
                  />
                )}
                {editableData.citizenship !== undefined && (
                  <DataField
                    label={t('scanner.fields.citizenship')}
                    value={editableData.citizenship || ''}
                    isEditing={isEditing}
                    onChange={(v) => handleFieldChange('citizenship', v)}
                  />
                )}
                {editableData.registrationAddress !== undefined && (
                  <DataField
                    label={t('scanner.fields.registrationAddress')}
                    value={editableData.registrationAddress || ''}
                    isEditing={isEditing}
                    onChange={(v) => handleFieldChange('registrationAddress', v)}
                  />
                )}
                {editableData.entryDate !== undefined && (
                  <DataField
                    label={t('scanner.fields.entryDate')}
                    value={editableData.entryDate || ''}
                    isEditing={isEditing}
                    onChange={(v) => handleFieldChange('entryDate', v)}
                    type="date"
                  />
                )}
              </div>

              <p className="text-xs text-gray-400 mt-4">
                {t('scanner.verifyHint')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 flex items-center justify-center gap-2 bg-white/20 text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform"
              >
                <RotateCcw className="w-5 h-5" />
                {t('scanner.retake')}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform"
              >
                <Check className="w-5 h-5" />
                {t('scanner.confirm')}
              </button>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center text-white px-4">
            <div className={`w-20 h-20 ${isOfflineQueued ? 'bg-yellow-500/20' : 'bg-red-500/20'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              {isOfflineQueued ? (
                <Loader2 className="w-10 h-10 text-yellow-500" />
              ) : (
                <AlertCircle className="w-10 h-10 text-red-500" />
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">
              {isOfflineQueued ? t('scanner.offlineTitle') : t('scanner.errorTitle')}
            </h3>
            <p className="text-white/70 mb-6 max-w-sm">
              {error}
            </p>
            {!isOfflineQueued && (
              <div className="text-white/50 text-sm mb-6 max-w-sm">
                <p>{t('scanner.tipsTitle')}</p>
                <ul className="text-left mt-2 space-y-1">
                  <li>- {t('scanner.tips.lighting')}</li>
                  <li>- {t('scanner.tips.angle')}</li>
                  <li>- {t('scanner.tips.glare')}</li>
                  <li>- {t('scanner.tips.focus')}</li>
                </ul>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              {isOfflineQueued && (
                <button
                  onClick={onCancel}
                  className="flex items-center justify-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-xl"
                >
                  {t('common.close')}
                </button>
              )}
              <button
                onClick={handleRetry}
                className="flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl"
              >
                <RotateCcw className="w-5 h-5" />
                {t('scanner.tryAgain')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for editable data fields
interface DataFieldProps {
  label: string;
  value: string;
  isEditing?: boolean;
  onChange?: (value: string) => void;
  type?: 'text' | 'date';
}

function DataField({ label, value, isEditing = false, onChange, type = 'text' }: DataFieldProps) {
  if (isEditing && onChange) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-gray-500 text-xs">{label}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-medium text-gray-900 bg-gray-100 rounded px-2 py-1 border border-gray-200 focus:border-blue-500 focus:outline-none"
        />
      </div>
    );
  }

  return (
    <div className="flex justify-between items-start">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right max-w-[60%]">
        {value || '-'}
      </span>
    </div>
  );
}

export default DocumentScanner;
