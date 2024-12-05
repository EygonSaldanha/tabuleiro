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

  async findAll(): Promise<Jogo[]> {
    return this.jogoRepository.find();
  }

  async findRelationshipsByJogos(
    jogosIds: number[],
  ): Promise<JogoRelationship[]> {
    return this.relationshipRepository
      .createQueryBuilder('relationship')
      .leftJoinAndSelect('relationship.jogo1', 'jogo1')
      .leftJoinAndSelect('relationship.jogo2', 'jogo2')
      .where('relationship.jogo1 IN (:...jogosIds)', { jogosIds })
      .orWhere('relationship.jogo2 IN (:...jogosIds)', { jogosIds })
      .getMany();
  }

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
        if (weight !== 0) {
          relationships.push({
            jogo1: jogo1.id,
            jogo2: jogo2.id,
            weight,
          });
        }
      }
    }

    return relationships;
  }

  async saveRelationships(): Promise<void> {
    const relationships = await this.calculateRelationships();

    const listaAtualizada = [];
    relationships.forEach((base) => {
      if (
        !listaAtualizada.find(
          (target) => target.jogo1 == base.jogo2 && target.jogo2 == base.jogo1,
        )
      ) {
        listaAtualizada.push(base);
      }
    });

    // Mapear dados para salvar no banco
    const dataToSave = listaAtualizada.map((rel) => ({
      jogo1: rel.jogo1,
      jogo2: rel.jogo2,
      weight: rel.weight,
    }));

    // Salvar no banco
    await this.relationshipRepository.save(dataToSave);
  }

  async getRelationships(): Promise<any[]> {
    // Buscar todos os relacionamentos no banco, incluindo as informações dos jogos relacionados
    const relationships = await this.relationshipRepository.find({
      relations: ['jogo1', 'jogo2'], // Adicione mais relacionamentos caso necessário
    });
    // console.log(relationships);

    // Mapear os dados para retornar apenas o necessário
    return relationships.map((relationship) => ({
      id: relationship.id,
      jogo1: {
        id: relationship.jogo1.id,
        name: relationship.jogo1.name, // Supondo que `name` seja uma propriedade de Jogo
      },
      jogo2: {
        id: relationship.jogo2.id,
        name: relationship.jogo2.name,
      },
      weight: relationship.weight,
    }));
  }
}
