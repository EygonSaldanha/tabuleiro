import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jogo } from './jogo.entity'; // Entidade da tabela jogo
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // Ou o IP do container
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'postgres',
      entities: [Jogo],
      synchronize: true, // Apenas para desenvolvimento (cria as tabelas automaticamente)
    }),
    TypeOrmModule.forFeature([Jogo]), // Registro da entidade
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
