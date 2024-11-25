import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JogoCategory } from './jogo-category.entity';
import { JogoMechanic } from './jogo-mechanic.entity';
import { Category } from './category.entity';

@Entity('jogo') // Nome da tabela no banco
export class Jogo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  yearpublished: number;

  @Column()
  rank: number;

  @Column('numeric', { precision: 10, scale: 5 })
  bayesaverage: number;

  @Column('numeric', { precision: 10, scale: 5 })
  average: number;

  @Column()
  usersrated: number;

  @Column({ type: 'boolean' })
  is_expansion: boolean;

  @Column({ nullable: true })
  abstracts_rank: number;

  @Column({ nullable: true })
  cgs_rank: number;

  @Column({ nullable: true })
  childrensgames_rank: number;

  @Column({ nullable: true })
  familygames_rank: number;

  @Column({ nullable: true })
  partygames_rank: number;

  @Column({ nullable: true })
  strategygames_rank: number;

  @Column({ nullable: true })
  thematic_rank: number;

  @Column({ nullable: true })
  wargames_rank: number;

  @Column({ nullable: true })
  image_url: string;

  // Relacionamento Many-to-Many com a tabela Category
  @ManyToMany(() => Category, (category) => category.jogos)
  @JoinTable({
    name: 'jogo_category', // Nome da tabela intermediária
    joinColumn: {
      name: 'jogo_id', // Coluna referente ao jogo
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id', // Coluna referente à categoria
      referencedColumnName: 'id',
    },
  })
  categories: Category[];

  @OneToMany(() => JogoMechanic, (jogoMechanic) => jogoMechanic.jogo)
  mechanics: JogoMechanic[];
}
