import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JogoRelationship } from 'src/entities/jogo-relationship.entity';
import { Jogo } from 'src/entities/jogo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JogoService {
  constructor(
    @InjectRepository(Jogo)
    private readonly jogoRepository: Repository<Jogo>,

    @InjectRepository(JogoRelationship)
    private readonly relationshipRepository: Repository<JogoRelationship>,
  ) {}

  async calculateRelationships(): Promise<any[]> {
    // 1. Buscar todos os jogos com suas categorias e mecânicas
    const jogos = await this.jogoRepository.find({
      relations: [
        'jogoCategories',
        'jogoCategories.category',
        'jogoMechanics',
        'jogoMechanics.mechanic',
      ],
    });

    const relationships = [];

    // 2. Comparar cada jogo com todos os outros
    for (let i = 0; i < jogos.length; i++) {
      for (let j = i + 1; j < jogos.length; j++) {
        const jogo1 = jogos[i];
        const jogo2 = jogos[j];
        console.log(jogo1);

        // 3. Categorias em comum
        const categoriesSet1 = new Set(
          jogo1.jogoCategories.map((jogoCategory) => jogoCategory.category.id),
        );
        const categoriesSet2 = new Set(
          jogo2.jogoCategories.map((jogoCategory) => jogoCategory.category.id),
        );
        const categoriasComum = [...categoriesSet1].filter((id) =>
          categoriesSet2.has(id),
        );

        // 4. Mecânicas em comum
        const mechanicsSet1 = new Set(
          jogo1.jogoMechanics.map((jogoMechanic) => jogoMechanic.mechanic.id),
        );
        const mechanicsSet2 = new Set(
          jogo2.jogoMechanics.map((jogoMechanic) => jogoMechanic.mechanic.id),
        );
        const mechanicComum = [...mechanicsSet1].filter((id) =>
          mechanicsSet2.has(id),
        );
        // console.log(categoriasComum, mechanicComum);

        // 5. Se não há categorias ou mecânicas em comum, ignore
        if (categoriasComum.length === 0 && mechanicComum.length === 0) {
          continue;
        }

        // 6. Calcular o peso
        const totalCategories = new Set([...categoriesSet1, ...categoriesSet2])
          .size;
        const totalMechanics = new Set([...mechanicsSet1, ...mechanicsSet2])
          .size;

        const categoryScore = (categoriasComum.length / totalCategories) * 70;
        const mechanicScore = (mechanicComum.length / totalMechanics) * 30;
        console.log(categoriasComum, totalCategories);

        let weight = Math.round(categoryScore + mechanicScore);
        // weight = Math.max(1, Math.min(weight, 100));

        // const existingRelationship = await this.relationshipRepository.findOne({
        //   where: [
        //     { jogo1: jogo1, jogo2: jogo2 },
        //     { jogo1: jogo2, jogo2: jogo1 },
        //   ],
        // });
        // console.log('AAAAAAAAAAAAAAAAAAAAAAA', existingRelationship);

        // 7. Adicionar ao array de relacionamentos
        if (weight == 0) {
          console.log(categoriasComum, mechanicComum);
        }
        relationships.push({
          jogo1: jogo1.id,
          jogo2: jogo2.id,
          weight,
        });
      }
    }

    return relationships;
  }

  async saveRelationships(): Promise<void> {
    const relationships = await this.calculateRelationships();
    console.log(relationships);
    // Mapear dados para salvar no banco
    const dataToSave = relationships.map((rel) => ({
      jogo1: rel.jogo1,
      jogo2: rel.jogo2,
      weight: rel.weight,
    }));

    // Salvar no banco
    await this.relationshipRepository.save(dataToSave);
  }
}
