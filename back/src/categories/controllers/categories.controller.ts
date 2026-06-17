import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/user-role.enum';
import { Controller, Get, Post, Put, Body, Param, Delete } from "@nestjs/common";
import { CategoriesService } from "../services/categories.service";
import { CreateCategoryInput, UpdateCategoryInput } from "../category.types";
import { ProductsService } from '../../products/services/products.service';

@Controller('categories') // esto hace que la URL base se localhost:3000/categories
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService,
        private readonly productsService: ProductsService,
    ) {}

    @Get() // esto hace que este método responda a GET /categories
    findAll() {
        return this.categoriesService.findAll();
    }

    @Get(':id') // esto hace que este método responda a GET /categories/1 , GET /categories/2 , etc
    findById(@Param('id') id: string) {
        // el decorador @Param('id') hace que el valor de la parte :id de la URL se pase como argumento al método
        // ojo: el valor que llega siempre es un string, aunque en realidad sea un numero. Por eso lo convertimos a numero con Number(id)
        return this.categoriesService.findById(Number(id));
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post() // esto hace que este método responda a POST /categories
    create(@Body() input: CreateCategoryInput) {
        // el decorador @Body() hace que el contenido del cuerpo de la petición (en formato JSON) se convierta en un objeto y se pase como argumento al método
        return this.categoriesService.create(input);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Put(':id')
    update(@Param('id') id: string, @Body() input: UpdateCategoryInput) {
        return this.categoriesService.update(Number(id), input);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id') // esto hace que este método responda a DELETE /categories/1 , DELETE /categories/2 , etc
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(Number(id));
    }

    @Get(':id/products') // este endpoit es para traer los productos de una categoria.
    getProductsByCategory(@Param('id') id: string) {
        //primero comprobamos que la categoria exista
        this.categoriesService.findById(Number(id)); // si no existe, esto lanzará un error 404 y se detendrá la ejecución

        //si existe, le pedimos a productos que nos filtre por esa categoria
        return this.productsService.findByCategory(Number(id));
    }
}