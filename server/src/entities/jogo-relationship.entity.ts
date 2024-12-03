import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Jogo } from './jogo.entity';

@Entity('jogo_relationship')
export class JogoRelationship {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Jogo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jogo_id_1' })
  jogo1: Jogo;

  @ManyToOne(() => Jogo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jogo_id_2' })
  jogo2: Jogo;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  weight: number;
}
