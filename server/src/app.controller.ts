import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Jogo } from './jogo.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/jogos')
  async getJogos(): Promise<Jogo[]> {
    return this.appService.getJogos();
  }
}
