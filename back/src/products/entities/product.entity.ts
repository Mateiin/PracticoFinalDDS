import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../product.types';

@Entity('products')
export class ProductEntity implements Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column('int', { default: 0 })
  stock!: number;

  @Column('int', { nullable: true })
  categoryId!: number;
}