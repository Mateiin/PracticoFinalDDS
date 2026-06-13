import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/user-role.enum';
import {
  Body,
  Controller,
  Delete,
  Patch,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from '../product.types';
import { ProductsService } from '../services/products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('name') name?: string, @Query('orderBy') orderBy?: string, @Query('order') order?: 'asc' | 'desc', 
   @Query('page') page?: string, @Query('limit') limit?: string) {
   // tranformo el texto a numer. si no envia nada, le asigno 1 y 5 por defecto
    const pageNumber = page ? Number(page) : 1;
    const limitNumber = limit ? Number(limit) : 5;
    // se lo paso al servicio para que se encargue de hacer el filtrado, ordenamiento y paginación
    return this.productsService.findAll(name, orderBy, order, pageNumber, limitNumber);
  }

  @Get(':id')
  async findOne(@Param('id') id: string){
    return await this.productsService.findById(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() body: CreateProductInput) {
    return await this.productsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateProductInput) {

    return await this.productsService.update(Number(id), body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/stock')
  async reduceStock(
    @Param('id') id: string, 
    @Body('quantity') quantity: number
  ){
    //convertimos el Id de la URL (que siempre llega como texto) a numero
    // y se lo pasamos al servicio junto con la cantidad que viene en el body
    return await this.productsService.reduceStock(Number(id), quantity);
  }
}

