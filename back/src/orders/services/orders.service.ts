import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../../products/services/products.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderEntity } from '../entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepo: Repository<OrderEntity>,
    private readonly productsService: ProductsService,
  ) {}

  async findByUser(userId: string): Promise<OrderEntity[]> {
    return this.ordersRepo.find({ where: { userId } });
  }

  async create(userId: string, dto: CreateOrderDto): Promise<OrderEntity> {
    let total = 0;
    const orderItems: OrderItemEntity[] = [];

    for (const item of dto.items) {
      const product = await this.productsService.reduceStock(item.productId, item.quantity);
      const itemTotal = Number(product.price) * item.quantity;
      total += itemTotal;

      const orderItem = new OrderItemEntity();
      orderItem.productId = item.productId;
      orderItem.productName = product.name;
      orderItem.quantity = item.quantity;
      orderItem.price = product.price;
      orderItems.push(orderItem);
    }

    const order = new OrderEntity();
    order.userId = userId;
    order.total = total;
    order.status = 'pending';
    order.items = orderItems;

    return this.ordersRepo.save(order);
  }
}
