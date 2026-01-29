// Auth Types
export interface DeviceAuthRequest {
  deviceId: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: ApiUser;
  tokens: AuthTokens;
}

// User Types
export interface UserSettings {
  locale: string;
  timezone: string;
  notifications: {
    push: boolean;
    telegram: boolean;
    deadlines: boolean;
    news: boolean;
  };
}

export interface ApiUser {
  id: string;
  citizenshipCode: string | null;
  regionCode: string | null;
  entryDate: string | null;
  subscriptionType: string;
  subscriptionExpiresAt: string | null;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  citizenshipCode?: string;
  regionCode?: string;
  entryDate?: string;
  settings?: Partial<UserSettings>;
}

// Utilities Types

// Ban Check Types
export type BanType = 'administrative' | 'criminal' | 'sanitary';
export type BanCheckSource = 'mvd' | 'fms' | 'cache' | 'fallback';

export interface BanCheckRequest {
  lastName: string;
  firstName: string;
  middleName?: string;
  birthDate: string;
  citizenship?: string;
  source?: 'mvd' | 'fms';
}

export interface BanCheckResponse {
  status: 'no_ban' | 'has_ban' | 'unknown' | 'check_failed';
  source?: BanCheckSource;
  banType?: BanType;
  reason?: string;
  expiresAt?: string;
  checkedAt: string;
  error?: string;
}

// Patent Check Types
export type PatentStatus = 'valid' | 'invalid' | 'expired' | 'not_found' | 'error';

export interface CheckPatentRequest {
  series: string;
  number: string;
  lastName?: string;
  firstName?: string;
}

export interface PatentCheckResponse {
  status: PatentStatus;
  isValid: boolean;
  message?: string;
  series: string;
  number: string;
  region?: string;
  issueDate?: string;
  expirationDate?: string;
  ownerName?: string;
  fromCache: boolean;
  checkedAt: string;
  source: 'mock' | 'real';
}

// INN Check Types
export type ForeignDocumentType = 'FOREIGN_PASSPORT' | 'RVP' | 'VNJ';
export type InnCheckSource = 'fns' | 'cache' | 'mock' | 'fallback';

export interface GetInnRequest {
  lastName: string;
  firstName: string;
  middleName?: string;
  birthDate: string;
  documentType: ForeignDocumentType;
  documentSeries: string;
  documentNumber: string;
  documentDate: string;
}

export interface InnCheckResponse {
  found: boolean;
  inn?: string;
  source: InnCheckSource;
  checkedAt: string;
  error?: string;
  message?: string;
}

// Permit Status Types
export type PermitType = 'RVP' | 'VNJ';
export type PermitStatusEnum =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'READY_FOR_PICKUP'
  | 'ADDITIONAL_DOCS_REQUIRED'
  | 'NOT_FOUND'
  | 'UNKNOWN';

export interface CheckPermitRequest {
  permitType: PermitType;
  region: string;
  applicationDate: string;
  applicationNumber?: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  birthDate: string;
}

export interface PermitStatusResponse {
  found: boolean;
  status: PermitStatusEnum;
  message: string;
  estimatedDate?: string;
  checkedAt: string;
  error?: string;
}

export interface PatentRegion {
  code: string;
  name: string;
  price: number;
}

export interface PatentRegionsResponse {
  regions: PatentRegion[];
  updatedAt: string;
}

// Passport Validity Check Types
export type PassportValidityStatus = 'VALID' | 'INVALID' | 'NOT_FOUND' | 'UNKNOWN';
export type PassportValiditySource = 'mvd' | 'cache' | 'fallback';

export interface CheckPassportValidityRequest {
  series: string;
  number: string;
}

export interface PassportValidityResponse {
  status: PassportValidityStatus;
  isValid: boolean;
  series: string;
  number: string;
  source: PassportValiditySource;
  checkedAt: string;
  message?: string;
  error?: string;
}

// FSSP Check Types
export type FsspCheckSource = 'fssp' | 'cache' | 'mock' | 'fallback';

export interface FsspDebt {
  id: string;
  type: string;
  amount: number;
  department: string;
  documentNumber?: string;
  documentDate?: string;
}

export interface CheckFsspRequest {
  lastName: string;
  firstName: string;
  middleName?: string;
  birthDate: string;
  regionCode: string;
}

export interface FsspCheckResponse {
  found: boolean;
  hasDebt: boolean;
  totalAmount?: number;
  debts?: FsspDebt[];
  source: FsspCheckSource;
  checkedAt: string;
  error?: string;
  message?: string;
}

// API Error
export interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
}

// Health
export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

// Legal Types
export interface CategoryDto {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  order: number;
}

export interface LawDto {
  id: string;
  categoryId: string;
  title: string;
  number: string;
  date: string;
  url: string;
  summary: string;
}

export interface FormDto {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  fileUrl: string;
  format: string;
  size?: string;
}

export interface FaqItemDto {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  order: number;
}

export interface LegalMetadataDto {
  lastUpdatedAt: string;
  source: string;
  version: string;
  lawsCount: number;
  formsCount: number;
  faqCount: number;
}

// Assistant Types
export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantChatRequest {
  message: string;
  history?: ChatHistoryMessage[];
}

export interface AssistantChatResponse {
  answer: string;
  sources?: string[];
}

export interface AssistantSearchRequest {
  query: string;
  limit?: number;
}

export interface AssistantSearchResult {
  id: string;
  question: string;
  answer: string;
  category: string;
  score: number;
}

export interface AssistantSearchResponse {
  results: AssistantSearchResult[];
}

// Payment Types
export type PaymentStatus = 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled' | 'refunded';
export type PaymentProvider = 'yookassa' | 'sbp';

export interface CreatePaymentRequest {
  amount: number;
  description: string;
  metadata?: {
    patentRegion?: string;
    patentMonth?: number;
    patentYear?: number;
    months?: number;
    [key: string]: unknown;
  };
}

export interface PaymentResponse {
  id: string;
  externalId: string | null;
  amount: string;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  description: string;
  paymentUrl?: string | null;
  createdAt: string;
  paidAt?: string | null;
}

export interface CreatePaymentResponse extends PaymentResponse {
  paymentUrl: string;
}

export interface PaymentStatusResponse {
  id: string;
  status: PaymentStatus;
  paidAt?: string | null;
  cancellationReason?: string | null;
}

export interface PaymentHistoryResponse {
  payments: PaymentResponse[];
  total: number;
}

// OCR Types
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
  registrationAddress?: string;
  hostName?: string;
  entryDate?: string;
  borderPoint?: string;
  purpose?: string;
  patentRegion?: string;
  employer?: string;
}

export interface OcrProcessResponse {
  success: boolean;
  data?: OcrDocumentData;
  rawText?: string;
  confidence?: number;
  error?: string;
}

// Push Notification Types
export type NotificationType = 'document_expiry' | 'patent_payment' | 'news' | 'system';
export type DevicePlatform = 'ios' | 'android' | 'web';

export interface NotificationPreferences {
  document_expiry: boolean;
  patent_payment: boolean;
  news: boolean;
}

export interface RegisterTokenRequest {
  token: string;
  platform: DevicePlatform;
}

export interface RegisterTokenResponse {
  success: boolean;
  message?: string;
}

export interface UnregisterTokenResponse {
  success: boolean;
  message?: string;
}

export interface GetPreferencesResponse {
  preferences: NotificationPreferences;
  enabled: boolean;
}

export interface UpdatePreferencesRequest {
  preferences: Partial<NotificationPreferences>;
}

export interface UpdatePreferencesResponse {
  preferences: NotificationPreferences;
  success: boolean;
}
