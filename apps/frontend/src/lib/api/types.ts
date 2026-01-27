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
export interface BanCheckRequest {
  lastName: string;
  firstName: string;
  birthDate: string;
}

export type BanStatus = 'no_ban' | 'ban_found' | 'check_failed';

export interface BanCheckResponse {
  status: BanStatus;
  reason?: string;
  expiresAt?: string;
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
