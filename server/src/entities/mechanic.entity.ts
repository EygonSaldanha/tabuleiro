import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Mechanic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mechanic_name: string;
}
