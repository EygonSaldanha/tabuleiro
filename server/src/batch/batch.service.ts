import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Jogo } from 'src/entities/jogo.entity';
import { Category } from 'src/entities/category.entity';
import { JogoCategory } from 'src/entities/jogo-category.entity';
import { Mechanic } from 'src/entities/mechanic.entity';
import { JogoMechanic } from 'src/entities/jogo-mechanic.entity';
import { log } from 'console';

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(Jogo)
    private readonly jogoRepository: Repository<Jogo>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(JogoCategory)
    private readonly jogoCategoryRepository: Repository<JogoCategory>,

    @InjectRepository(Mechanic)
    private readonly mechanicRepository: Repository<Mechanic>,

    @InjectRepository(JogoMechanic)
    private readonly jogoMechanicRepository: Repository<JogoMechanic>,
  ) {}

  async processBatch(batchSize = 100) {
    let offset = 0;
    let jogos: Jogo[];

    do {
      // 1. Buscar jogos em lotes
      jogos = await this.jogoRepository.find({
        skip: offset,
        take: batchSize,
      });
      offset += batchSize;

      // 2. Processar cada jogo
      const updates = jogos.map(async (jogo) => {
        // Realiza a requisição para a API
        const { data } = await axios.get(
          `https://boardgamegeek.com/xmlapi2/thing?id=${jogo.id}`,
          {
            responseType: 'text',
          },
        );

        // Converte XML para JSON (você pode usar uma biblioteca como xml2js)
        const parsedData = await this.parseXML(data);
        // Atualiza informações do jogo
        await this.updateJogoWithAPIResponse(jogo, parsedData);
      });

      // 3. Controlar promessas
      await Promise.allSettled(updates);
    } while (jogos.length > 0);

    console.log('Processo concluído!');
  }

  private async parseXML(xml: string): Promise<any> {
    const { parseStringPromise } = await import('xml2js');
    return parseStringPromise(xml, { explicitArray: false });
  }

  private async updateJogoWithAPIResponse(jogo: Jogo, parsedData: any) {
    const item = parsedData.items.item;

    // Atualizar jogo com as informações básicas
    jogo.image_url = item.image;
    await this.jogoRepository.save(jogo);

    // Processar categorias
    if (item.link) {
      const categories = Array.isArray(item.link)
        ? item.link.filter((link) => link.$.type === 'boardgamecategory')
        : [item.link];

      for (const category of categories) {
        console.log(category);
        const categoryName = category.$.value;
        // Verificar se a categoria já existe no banco
        let dbCategory = await this.categoryRepository.findOne({
          where: { categoryName: categoryName },
        });
        console.log(dbCategory);

        // Caso não exista, criar uma nova
        console.log('-> ', categoryName, dbCategory);

        if (!dbCategory) {
          dbCategory = await this.categoryRepository.save({
            categoryName: categoryName,
          });
        }

        // Salvar relação entre jogo e categoria
        await this.jogoCategoryRepository.save({
          jogo: jogo,
          category: dbCategory,
        });
      }
    }

    // Processar mecânicas
    if (item.link) {
      const mechanics = Array.isArray(item.link)
        ? item.link.filter((link) => link.$.type === 'boardgamemechanic')
        : [item.link];

      for (const mechanic of mechanics) {
        const mechanicName = mechanic.$.value;

        // Verificar se a mecânica já existe no banco
        let dbMechanic = await this.mechanicRepository.findOne({
          where: { mechanic_name: mechanicName },
        });

        // Caso não exista, criar uma nova
        if (!dbMechanic) {
          dbMechanic = await this.mechanicRepository.save({
            mechanic_name: mechanicName,
          });
        }

        // Salvar relação entre jogo e mecânica
        await this.jogoMechanicRepository.save({
          jogo: jogo,
          mechanic: dbMechanic,
        });
      }
    }
  }
}
