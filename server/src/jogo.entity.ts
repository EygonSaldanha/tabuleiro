import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('jogo') // Nome da tabela no banco
export class Jogo {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  yearpublished: number;

  @Column()
  rank: number;

  @Column('numeric', { precision: 10, scale: 5 })
  bayesaverage: number;

  @Column('numeric', { precision: 10, scale: 5 })
  average: number;

  @Column()
  usersrated: number;

  @Column({ type: 'boolean' })
  is_expansion: boolean;

  @Column({ nullable: true })
  abstracts_rank: number;

  @Column({ nullable: true })
  cgs_rank: number;

  @Column({ nullable: true })
  childrensgames_rank: number;

  @Column({ nullable: true })
  familygames_rank: number;

  @Column({ nullable: true })
  partygames_rank: number;

  @Column({ nullable: true })
  strategygames_rank: number;

  @Column({ nullable: true })
  thematic_rank: number;

  @Column({ nullable: true })
  wargames_rank: number;
}
