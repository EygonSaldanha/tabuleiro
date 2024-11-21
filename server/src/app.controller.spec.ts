import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Jogo } from './jogo.entity';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const mockJogoRepository = {
      find: jest.fn(() => [
        {
          id: 224517,
          name: 'Brass: Birmingham',
          yearpublished: 2018,
          rank: 1,
          bayesaverage: 8.41046,
          average: 8.58956,
          usersrated: 48530,
          is_expansion: false,
        },
        {
          id: 161936,
          name: 'Pandemic Legacy: Season 1',
          yearpublished: 2015,
          rank: 2,
          bayesaverage: 8.37413,
          average: 8.52365,
          usersrated: 54364,
          is_expansion: false,
        },
      ]),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: getRepositoryToken(Jogo),
          useValue: mockJogoRepository,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getJogos', () => {
    it('should return a list of jogos', async () => {
      const result = await appController.getJogos();
      expect(result).toEqual([
        {
          id: 224517,
          name: 'Brass: Birmingham',
          yearpublished: 2018,
          rank: 1,
          bayesaverage: 8.41046,
          average: 8.58956,
          usersrated: 48530,
          is_expansion: false,
        },
      ]);
    });
  });
});
