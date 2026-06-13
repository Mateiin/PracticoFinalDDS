
import { Category, CreateCategoryInput } from "../category.types";

//esto es un "token" que usa NestJS internamente para concetar las piezas despues
export const CATEGORIES_REPOSITORY = 'CATEGORIES_REPOSITORY';

// nuestro contrato: obliga a que el repositorio tenga estos métodos, con estas entradas y estas salidas
export interface CategoriesRepository {
    findAll(): Category[];
    findById(id: number): Category | undefined;
    create(input: CreateCategoryInput): Category;
    remove(id: number): Category | undefined;
}