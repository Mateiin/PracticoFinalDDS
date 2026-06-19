import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsController } from './controllers/products.controller';
import { ProductEntity } from './entities/product.entity';
import { PRODUCTS_REPOSITORY } from './repositories/products.repository';
import { TypeOrmProductsRepository } from './repositories/typeorm-products.repository';
import { ProductsService } from './services/products.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), CategoriesModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    { provide: PRODUCTS_REPOSITORY, useClass: TypeOrmProductsRepository },
  ],
  exports: [ProductsService, PRODUCTS_REPOSITORY],
})
export class ProductsModule {}
