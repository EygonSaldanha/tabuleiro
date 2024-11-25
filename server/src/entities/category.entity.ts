import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { JogoCategory } from './jogo-category.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'category_name' })
  categoryName: string;

  @OneToMany(() => JogoCategory, (jogoCategory) => jogoCategory.category, {
    cascade: true,
  })
  jogoCategories: JogoCategory[];
}
