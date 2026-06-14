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

    findById(id: number) {
        const category = this.categoriesRepository.findById(id);
        if (!category) {
            throw new NotFoundException(`La categoria con ID ${id} no existe`);
        }
        return category;
    }

    create(input: CreateCategoryInput) {
        return this.categoriesRepository.create(input);
    }

    update(id: number, input: UpdateCategoryInput) {
        const category = this.categoriesRepository.update(id, input);
        if (!category) {
            throw new NotFoundException(`La categoria con ID ${id} no existe`);
        }
        return category;
    }

    async remove(id: number) { 
        //1. verificamos si la categoria existe
        this.findById(id); // si no existe, esto lanzará un error 404 y se detendrá la ejecución

        //2. se agrega await para esperar a que lleguen los productos
        const productsInside = await this.productsService.findByCategory(id);

        if (productsInside.length > 0) {
            throw new ConflictException(`No se puede eliminar la categoria tiene ${productsInside.length} productos asociados`);
        }

        //3. si paso las pruebas, la eliminamos 
        return this.categoriesRepository.remove(id);
    }
}