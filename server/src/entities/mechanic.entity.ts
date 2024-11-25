import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { JogoMechanic } from './jogo-mechanic.entity';

@Entity('mechanic')
export class Mechanic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'mechanic_name' })
  mechanicName: string;

  @OneToMany(() => JogoMechanic, (jogoMechanic) => jogoMechanic.mechanic, {
    cascade: true,
  })
  jogoMechanics: JogoMechanic[];
}
