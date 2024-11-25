import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Jogo } from './jogo.entity';
import { Mechanic } from './mechanic.entity';

@Entity('jogo_mechanic')
export class JogoMechanic {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Jogo, (jogo) => jogo.jogoMechanics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jogo_id' })
  jogo: Jogo;

  @ManyToOne(() => Mechanic, (mechanic) => mechanic.jogoMechanics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'mechanic_id' })
  mechanic: Mechanic;
}
