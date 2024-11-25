import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Jogo } from './jogo.entity';
import { Category } from './category.entity';

@Entity()
export class JogoCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Jogo, (jogo) => jogo.categories, { onDelete: 'CASCADE' })
  jogo: Jogo;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  category: Category;
}
