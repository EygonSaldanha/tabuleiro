import { Controller, Post } from '@nestjs/common';
import { JogoService } from 'src/services/jogo.service';

@Controller('jogos')
export class JogoController {
  constructor(private readonly jogoService: JogoService) {}

  @Post('relationships')
  async calculateAndSaveRelationships() {
    await this.jogoService.saveRelationships();
    return { message: 'Relacionamentos calculados e salvos com sucesso!' };
  }
}
