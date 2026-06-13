import { Global, Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { InMemoryProductsRepository } from './repositories/in-memory-products.repository';
import { PRODUCTS_REPOSITORY } from './repositories/products.repository';
import { ProductsService } from './services/products.service';
import { CategoriesModule } from '../categories/categories.module';


@Global()
@Module({
  imports: [CategoriesModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    { provide: PRODUCTS_REPOSITORY, useClass: InMemoryProductsRepository },
  ],
  exports: [ProductsService, PRODUCTS_REPOSITORY],
})

export class ProductsModule {}
