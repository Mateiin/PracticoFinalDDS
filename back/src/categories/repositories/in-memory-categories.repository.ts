import { Injectable } from "@nestjs/common";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "../category.types";
import { CategoriesRepository } from "./categories.repository";

@Injectable() //esto es vital para que NestJS sepa que puede "inyectar" esta clase luego
export class InMemoryCategoriesRepository implements CategoriesRepository {
    //aqui guardaremos nuestras categorias temporalmente
  private categories: Category[] = [];
  // un contador para asignar IDs automaticamente (1, 2, 3 ...)
  private idCounter = 1;

    findAll(): Category[] {
        return this.categories;
    }

    findById(id: number): Category | undefined {
        return this.categories.find(category => category.id === id);
    }

    create(input: CreateCategoryInput): Category {
        const newCategory: Category = {
            id: this.idCounter++,
            name: input.name,
        };
        this.categories.push(newCategory);
        return newCategory;
    }

    update(id: number, input: UpdateCategoryInput): Category | undefined {
        const category = this.findById(id);
        if (!category) return undefined;
        if (input.name !== undefined) category.name = input.name;
        return category;
    }

    remove(id: number): Category | undefined {
        const index = this.categories.findIndex(category => category.id === id);
        if (index === -1) {
            return undefined; // no se encontró la categoría
        }
        // si lo encuntra, lo saca del array y devuelve la categoria eliminada
        const removedCategory = this.categories[index];
        this.categories.splice(index, 1);
        return removedCategory;
    }
}