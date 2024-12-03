import { Controller, Get } from '@nestjs/common';
import { BatchService } from './batch.service';
@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get('update-relacionamento')
  async updateJogos() {
    return await this.batchService.processBatch();
  }
  @Get('processar-jogos')
  async importarCsv() {
    console.log("teste");
    
    return await this.batchService.importarCsv();
  }
}
