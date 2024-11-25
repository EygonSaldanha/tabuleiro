import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BatchController } from './batch/batch.controller';
import { BatchService } from './batch/batch.service';
import { Category } from './entities/category.entity';
import { JogoCategory } from './entities/jogo-category.entity';
import { JogoMechanic } from './entities/jogo-mechanic.entity';
import { Jogo } from './entities/jogo.entity'; // Entidade da tabela jogo
import { Mechanic } from './entities/mechanic.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'postgres',
      entities: [Jogo, Category, JogoCategory, JogoMechanic, Mechanic],
      migrations: ['dist/migrations/*.js'], // Local das migrações
    }),
    TypeOrmModule.forFeature([
      Jogo,
      Category,
      JogoCategory,
      JogoMechanic,
      Mechanic,
    ]),
  ],
  controllers: [AppController, BatchController],
  providers: [AppService, BatchService],
})
export class AppModule {}
