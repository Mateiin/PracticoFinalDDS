
import { Category, CreateCategoryInput, UpdateCategoryInput } from "../category.types";

//esto es un "token" que usa NestJS internamente para concetar las piezas despues
export const CATEGORIES_REPOSITORY = 'CATEGORIES_REPOSITORY';

// nuestro contrato: obliga a que el repositorio tenga estos métodos, con estas entradas y estas salidas
export interface CategoriesRepository {
    findAll(): Promise<Category[]>;
    findById(id: number): Promise<Category | undefined>;
    create(input: CreateCategoryInput): Promise<Category>;
    update(id: number, input: UpdateCategoryInput): Promise<Category | undefined>;
    remove(id: number): Promise<Category | undefined>;
}