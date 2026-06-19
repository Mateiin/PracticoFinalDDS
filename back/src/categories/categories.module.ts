import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './controllers/categories.controller';
import { CategoryEntity } from './entities/category.entity';
import { CATEGORIES_REPOSITORY } from './repositories/categories.repository';
import { TypeOrmCategoriesRepository } from './repositories/typeorm-categories.repository';
import { CategoriesService } from './services/categories.service';

@Module({
    imports: [TypeOrmModule.forFeature([CategoryEntity])],
    controllers: [CategoriesController],
    providers: [
        CategoriesService,
        { provide: CATEGORIES_REPOSITORY, useClass: TypeOrmCategoriesRepository },
    ],
    exports: [CategoriesService],
})
export class CategoriesModule {}

