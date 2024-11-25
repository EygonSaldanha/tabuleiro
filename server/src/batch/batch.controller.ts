import { Controller, Get } from '@nestjs/common';
import { BatchService } from './batch.service';
@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get('update-jogos')
  async updateJogos() {
    return await this.batchService.processBatch();
  }
}
