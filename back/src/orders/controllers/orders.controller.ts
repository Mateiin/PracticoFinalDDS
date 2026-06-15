import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { VerifiedOnly } from '../../common/middlewares/guard.middleware';
import { OrdersService } from '../services/orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Solo usuarios verificados pueden ver sus pedidos
  @VerifiedOnly()
  @Get()
  async getOrders(@Req() req: any) {
    return this.ordersService.findByUser(req.user.id);
  }

  // Solo usuarios verificados pueden crear pedidos
  @VerifiedOnly()
  @Post()
  async createOrder(@Req() req: any, @Body() dto: any) {
    return this.ordersService.create(req.user.id, dto);
  }
}
