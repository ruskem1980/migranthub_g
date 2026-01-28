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
