import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Jogo } from './jogo.entity';
import { Mechanic } from './mechanic.entity';

@Entity()
export class JogoMechanic {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Jogo, (jogo) => jogo.mechanics, { onDelete: 'CASCADE' })
  jogo: Jogo;

  @ManyToOne(() => Mechanic, { onDelete: 'CASCADE' })
  mechanic: Mechanic;
}
