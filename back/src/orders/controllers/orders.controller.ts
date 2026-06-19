import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { VerifiedOnly } from '../../common/middlewares/guard.middleware';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrdersService } from '../services/orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @VerifiedOnly()
  @Get()
  async getOrders(@Req() req: any) {
    return this.ordersService.findByUser(req.user.id);
  }

  @VerifiedOnly()
  @Post()
  async createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, dto);
  }
}
