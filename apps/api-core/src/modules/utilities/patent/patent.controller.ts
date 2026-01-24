import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { PatentService } from './patent.service';
import { PatentRegionsResponseDto } from './dto';

@ApiTags('utilities')
@Controller({
  path: 'utilities/patent',
  version: '1',
})
export class PatentController {
  constructor(private readonly patentService: PatentService) {}

  @Get('regions')
  @Public()
  @ApiOperation({
    summary: 'Get patent prices by region',
    description: 'Returns list of Russian regions with monthly patent prices. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of regions with patent prices',
    type: PatentRegionsResponseDto,
  })
  getRegions(): PatentRegionsResponseDto {
    return this.patentService.getRegions();
  }
}
