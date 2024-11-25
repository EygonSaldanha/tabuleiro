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
          const existingJogoCategory = await this.jogoCategoryRepository.findOne({
            where: {
              jogo: jogo,
              category: foundCategory,
            },
          });
  
          if (existingJogoCategory) {
            console.log('Relacionamento entre jogo e categoria já existe');
            return; 
          }
        }

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
      
      const mechanics = Array.isArray(item.link)
        ? item.link.filter((link) => link.$.type === 'boardgamemechanic')
        : [item.link];
  
      for (const mechanic of mechanics) {
        const mechanicName = mechanic.$.value;
  
        // Verificar se a mecânica já existe no banco
        let dbMechanic = await this.mechanicRepository.findOne({
          where: { jogoMechanics: mechanicName },
        });
  
        // Caso não exista, criar uma nova
        if (!dbMechanic) {
          dbMechanic = await this.mechanicRepository.save({
            jogoMechanics: mechanicName,
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
