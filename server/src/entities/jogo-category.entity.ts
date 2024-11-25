import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category.entity';
import { Jogo } from './jogo.entity';

@Entity('jogo_category')
export class JogoCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Jogo, (jogo) => jogo.jogoCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jogo_id' })
  jogo: Jogo;

  @ManyToOne(() => Category, (category) => category.jogoCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
