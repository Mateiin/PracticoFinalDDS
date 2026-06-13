import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';
import { Product } from '../product.types';

@Entity('products') // aca llama a la tabla products en la base de datos
export class ProductEntity implements Product {
  @PrimaryGeneratedColumn()
  id!: number;

    @Column()
    name!: string;

    @Column('decimal')
    price!: number;

    @Column('int')
    stock!: number;

    @Column('int')
    categoryId!: number;
}