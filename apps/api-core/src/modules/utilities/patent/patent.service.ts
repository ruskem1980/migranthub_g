import { Injectable } from '@nestjs/common';
import { PatentRegionsResponseDto } from './dto';
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

@Injectable()
export class PatentService {
  private readonly data: RegionsJson = regionsData as RegionsJson;

  getRegions(): PatentRegionsResponseDto {
    return {
      regions: this.data.regions,
      updatedAt: this.data.updatedAt,
    };
  }

  getRegionByCode(code: string): RegionData | undefined {
    return this.data.regions.find((r) => r.code === code);
  }
}
