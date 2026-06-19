import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => OrderEntity, (order) => order.items)
  order!: OrderEntity;

  @Column()
  productId!: number;

  @Column()
  productName!: string;

  @Column()
  quantity!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;
}
