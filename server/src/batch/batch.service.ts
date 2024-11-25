import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Category } from 'src/entities/category.entity';
import { JogoCategory } from 'src/entities/jogo-category.entity';
import { JogoMechanic } from 'src/entities/jogo-mechanic.entity';
import { Jogo } from 'src/entities/jogo.entity';
import { Mechanic } from 'src/entities/mechanic.entity';
import { Repository } from 'typeorm';

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
        // console.log(category);
        const categoryName = category.$.value;

        let foundCategory = await this.categoryRepository.findOne({
          where: { categoryName },
        });

        if (!foundCategory) {
          foundCategory = await this.categoryRepository.save({ categoryName });
        } else {
          const existingJogoCategory =
            await this.jogoCategoryRepository.findOne({
              where: {
                jogo: jogo,
                category: foundCategory,
              },
            });

          if (!existingJogoCategory) {
            const jogoCategory = this.jogoCategoryRepository.create({
              jogo: jogo,
              category: foundCategory,
            });
            console.log(jogoCategory);

            try {
              await this.jogoCategoryRepository.save(jogoCategory);
              console.log('Relacionamento salvo com sucesso!');
            } catch (error) {
              console.error('Erro ao salvar o relacionamento:', error);
            }
          }
        }
      }

      const mechanics = Array.isArray(item.link)
        ? item.link.filter((link) => link.$.type === 'boardgamemechanic')
        : [item.link];

      for (const mechanic of mechanics) {
        const mechanicName = mechanic.$.value;
        let foundMechanic;

        // Verificar se a mecânica já existe no banco
        try {
          // Verifique se a mecânica já existe no banco de dados
          foundMechanic = await this.mechanicRepository.findOne({
            where: { mechanicName }, // Verifique pelo nome da mecânica
          });
          // Caso a mecânica não exista, crie uma nova
          if (!foundMechanic) {
            let mechanicCreated = await this.mechanicRepository.save({
              mechanicName,
            });
          }
        } catch (error) {
          // Lidar com o erro
          console.error('Erro ao salvar ou encontrar a mecânica:', error);
          throw new Error(
            'Ocorreu um erro ao tentar salvar ou encontrar a mecânica.',
          );
        }

        const jogoMechanic = this.jogoMechanicRepository.create({
          jogo: jogo,
          mechanic: foundMechanic,
        });

        try {
          await this.jogoMechanicRepository.save(jogoMechanic);
          console.log('Relacionamento salvo com sucesso!');
        } catch (error) {
          console.error('Erro ao salvar o relacionamento:', error);
        }
      }
    }
  }
}
