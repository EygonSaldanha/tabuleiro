import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Jogo } from './jogo.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/api')
  getHello(): string {
    return 'Hello from NestJS!';
  }

  @Get('/jogos')
  getJogos() {
    return this.appService.getJogos();
  }
}
