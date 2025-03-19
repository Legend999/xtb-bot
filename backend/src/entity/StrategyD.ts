import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StrategyD {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar')
  fullTicker: string;

  @Column('float')
  percent: number;

  @Column('float')
  pricePerLevel: number;

  constructor(fullTicker: string, percent: number, pricePerLevel: number) {
    this.fullTicker = fullTicker;
    this.percent = percent;
    this.pricePerLevel = pricePerLevel;
  }
}
