import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Jogo } from './jogo.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoryName: string;

  // Relacionamento Many-to-Many com a tabela Jogo
  @ManyToMany(() => Jogo, (jogo) => jogo.categories)
  jogos: Jogo[];
}
