import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jogo } from './entities/jogo.entity'; // Entidade da tabela jogo
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BatchService } from './batch/batch.service';
import { Category } from './entities/category.entity';
import { Mechanic } from './entities/mechanic.entity';
import { JogoCategory } from './entities/jogo-category.entity';
import { JogoMechanic } from './entities/jogo-mechanic.entity';
import { BatchController } from './batch/batch.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // Ou o IP do container
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'postgres',
      entities: [Jogo, Category,JogoCategory,JogoMechanic , Mechanic],
      // synchronize: true, // Apenas para desenvolvimento (cria as tabelas automaticamente)
    }),
    TypeOrmModule.forFeature([Jogo, Category,JogoCategory,JogoMechanic, Mechanic]),
  ],
  controllers: [AppController, BatchController],
  providers: [AppService, BatchService],
})
export class AppModule {}
