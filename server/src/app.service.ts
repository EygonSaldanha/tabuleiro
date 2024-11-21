import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Jogo } from './jogo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Jogo)
    private jogoRepository: Repository<Jogo>,
  ) {}

  async getJogos(): Promise<Jogo[]> {
    return this.jogoRepository.find(); // Faz um SELECT * FROM jogo
  }
}