import { Injectable } from '@nestjs/common';
import { PatentRegionsResponseDto } from './dto';
import { CacheService } from '../../cache/cache.service';
import * as regionsData from './data/regions.json';

interface RegionData {
  code: string;
  name: string;
  price: number;
}

interface RegionsJson {
  updatedAt: string;
  regions: RegionData[];
}

// Константы кэширования
const CACHE_KEY_REGIONS = 'patent:regions';
const CACHE_TTL_REGIONS = 60 * 60 * 1000; // 1 час в миллисекундах

@Injectable()
export class PatentService {
  private readonly data: RegionsJson = regionsData as RegionsJson;

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Получение списка регионов с кэшированием (TTL: 1 час)
   */
  async getRegions(): Promise<PatentRegionsResponseDto> {
    return this.cacheService.wrap<PatentRegionsResponseDto>(
      CACHE_KEY_REGIONS,
      async () => ({
        regions: this.data.regions,
        updatedAt: this.data.updatedAt,
      }),
      CACHE_TTL_REGIONS,
    );
  }

  /**
   * Получение региона по коду
   */
  getRegionByCode(code: string): RegionData | undefined {
    return this.data.regions.find((r) => r.code === code);
  }
}
