import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Jogo } from './jogo.entity';
import { Mechanic } from './mechanic.entity';

@Entity()
export class JogoMechanic {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Jogo, (jogo) => jogo.jogoMechanics, { onDelete: 'CASCADE' })
  jogo: Jogo;

  @ManyToOne(() => Mechanic, (mechanic) => mechanic.jogoMechanics, {
    onDelete: 'CASCADE',
  })
  mechanic: Mechanic;
}
