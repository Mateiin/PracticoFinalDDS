import { Inject, Injectable, NotFoundException, ConflictException,forwardRef } from "@nestjs/common";
import { CreateCategoryInput, UpdateCategoryInput } from "../category.types";
import { CATEGORIES_REPOSITORY, CategoriesRepository } from "../repositories/categories.repository";
import { ProductsService } from "../../products/services/products.service";

@Injectable()
export class CategoriesService {
    constructor(
        @Inject(CATEGORIES_REPOSITORY)
        private readonly categoriesRepository: CategoriesRepository,
        @Inject(forwardRef(() => ProductsService))
        private readonly productsService: ProductsService,
    ) {}

    findAll() {
        return this.categoriesRepository.findAll();
    }

    async findById(id: number) {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new NotFoundException(`La categoria con ID ${id} no existe`);
        }
        return category;
    }

    create(input: CreateCategoryInput) {
        return this.categoriesRepository.create(input);
    }

    async update(id: number, input: UpdateCategoryInput) {
        const category = await this.categoriesRepository.update(id, input);
        if (!category) {
            throw new NotFoundException(`La categoria con ID ${id} no existe`);
        }
        return category;
    }

    async remove(id: number) {
        await this.findById(id);

        const productsInside = await this.productsService.findByCategory(id);

        if (productsInside.length > 0) {
            throw new ConflictException(`No se puede eliminar la categoria tiene ${productsInside.length} productos asociados`);
        }

        return this.categoriesRepository.remove(id);
    }
}