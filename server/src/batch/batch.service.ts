import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import csvParser from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';
import { Category } from 'src/entities/category.entity';
import { JogoCategory } from 'src/entities/jogo-category.entity';
import { JogoMechanic } from 'src/entities/jogo-mechanic.entity';
import { Jogo } from 'src/entities/jogo.entity';
import { Mechanic } from 'src/entities/mechanic.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(Jogo) private readonly jogoRepository: Repository<Jogo>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(JogoCategory)
    private readonly jogoCategoryRepository: Repository<JogoCategory>,
    @InjectRepository(Mechanic)
    private readonly mechanicRepository: Repository<Mechanic>,
    @InjectRepository(JogoMechanic)
    private readonly jogoMechanicRepository: Repository<JogoMechanic>,
  ) {}

  async processBatch(batchSize = 10) {
    let offset = 0;
    let jogos: Jogo[];

    do {
      // 1. Buscar jogos em lotes
      jogos = await this.jogoRepository.find({
        skip: offset,
        take: batchSize,
      });
      offset += batchSize;
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      // 2. Processar cada jogo
      const updates = jogos.map(async (jogo) => {
        await delay(10000); // Delay de 1 segundo
        try {
          const { data } = await axios.get(
            `https://boardgamegeek.com/xmlapi2/thing?id=${jogo.id}`,
            { responseType: 'text' },
          );
          const parsedData = await this.parseXML(data);
          await this.updateJogoWithAPIResponse(jogo, parsedData);

        } catch (error) {
          console.error(`Erro ao processar jogo ${jogo.id}:`, error);
        }
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

    jogo.image_url = item.image;
    await this.jogoRepository.save(jogo);

    await this.processCategories(jogo, item.link);

    await this.processMechanics(jogo, item.link);
  }

  private async processCategories(jogo: Jogo, links: any[]) {
    const categories = (Array.isArray(links) ? links : [links])
      .filter((link) => link.$.type === 'boardgamecategory')
      .map((link) => link.$.value);

    for (const categoryName of categories) {
      let foundCategory = await this.categoryRepository.findOne({
        where: { categoryName },
      });

      if (!foundCategory) {
        foundCategory = await this.categoryRepository.save({ categoryName });
      }

      const existingJogoCategory = await this.jogoCategoryRepository.findOne({
        where: { jogo, category: foundCategory },
      });

      if (!existingJogoCategory) {
        const jogoCategory = this.jogoCategoryRepository.create({
          jogo,
          category: foundCategory,
        });
        try {
          await this.jogoCategoryRepository.save(jogoCategory);
          console.log('Relacionamento jogo-category salvo com sucesso!');
        } catch (error) {
          console.error('Erro ao salvar relacionamento jogo-category:', error);
        }
      }
    }
  }

  private async processMechanics(jogo: Jogo, links: any[]) {
    const mechanics = (Array.isArray(links) ? links : [links])
      .filter((link) => link.$.type === 'boardgamemechanic')
      .map((link) => link.$.value);

    for (const mechanicName of mechanics) {
      let foundMechanic = await this.mechanicRepository.findOne({
        where: { mechanicName },
      });

      if (!foundMechanic) {
        foundMechanic = await this.mechanicRepository.save({ mechanicName });
      }

      const existingRelationship = await this.jogoMechanicRepository.findOne({
        where: { jogo: { id: jogo.id }, mechanic: { id: foundMechanic.id } },
      });

      if (!existingRelationship) {
        const jogoMechanic = this.jogoMechanicRepository.create({
          jogo,
          mechanic: foundMechanic,
        });
        try {
          await this.jogoMechanicRepository.save(jogoMechanic);
          console.log('Relacionamento jogo-mechanic salvo com sucesso!');
        } catch (error) {
          console.error('Erro ao salvar relacionamento jogo-mechanic:', error);
        }
      }
    }
  }

  async importarCsv(): Promise<void> {
    const jogos: Jogo[] = [];

    // Caminho fixo para o arquivo CSV
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'assets',
      'jogos.csv',
    );

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      console.error(
        'O arquivo CSV não foi encontrado no caminho especificado!',
      );
      return;
    }

    // Ler o arquivo CSV
    const csvStream = fs.createReadStream(filePath).pipe(csvParser());

    // Processar cada linha do CSV
    for await (const row of csvStream) {
      // Mapear os dados do CSV para a entidade Jogo
      const jogo: Jogo = this.jogoRepository.create({
        id: Number(row.id),
        name: row.name,
        yearpublished: Number(row.yearpublished),
        rank: Number(row.rank),
        bayesaverage: parseFloat(row.bayesaverage),
        average: parseFloat(row.average),
        usersrated: Number(row.usersrated),
        is_expansion: row.is_expansion === '1',
        abstracts_rank: row.abstracts_rank ? Number(row.abstracts_rank) : null,
        cgs_rank: row.cgs_rank ? Number(row.cgs_rank) : null,
        childrensgames_rank: row.childrensgames_rank
          ? Number(row.childrensgames_rank)
          : null,
        familygames_rank: row.familygames_rank
          ? Number(row.familygames_rank)
          : null,
        partygames_rank: row.partygames_rank
          ? Number(row.partygames_rank)
          : null,
        strategygames_rank: row.strategygames_rank
          ? Number(row.strategygames_rank)
          : null,
        thematic_rank: row.thematic_rank ? Number(row.thematic_rank) : null,
        wargames_rank: row.wargames_rank ? Number(row.wargames_rank) : null,
        image_url: null, // Caso necessário, adapte para adicionar o valor correto
        jogoCategories: [],
        jogoMechanics: [],
      });

      jogos.push(jogo);
    }

    // Salvar todos os jogos no banco de dados
    try {
      await this.jogoRepository.save(jogos);
      console.log(`${jogos.length} jogos foram importados com sucesso!`);
    } catch (error) {
      console.error('Erro ao salvar jogos:', error);
    }
  }
}
