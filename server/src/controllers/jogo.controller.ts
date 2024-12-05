import { Controller, Post, Get, Query } from '@nestjs/common';
import { JogoRelationship } from 'src/entities/jogo-relationship.entity';
import { JogoService } from 'src/services/jogo.service';

@Controller('jogos')
export class JogoController {
  constructor(private readonly jogoService: JogoService) {}

  @Get('relationships')
  async getRelationships() {
    return await this.jogoService.getRelationships();
  }

  @Post('relationships')
  async calculateAndSaveRelationships() {
    await this.jogoService.saveRelationships();
    return { message: 'Relacionamentos calculados e salvos com sucesso!' };
  }
  @Get()
  async findAll() {
    return await this.jogoService.findAll();
  }
  @Get('relationships_by_jogos')
  async getRelationshipsByJogos(
    @Query('ids') ids: string,
  ): Promise<JogoRelationship[]> {
    // Converte a string de IDs para um array de números
    const jogosIds = ids.split(',').map((id) => parseInt(id.trim(), 10));
    console.log(jogosIds);

    // Chama o serviço para buscar os relacionamentos
    return this.jogoService.findRelationshipsByJogos(jogosIds);
  }
}
