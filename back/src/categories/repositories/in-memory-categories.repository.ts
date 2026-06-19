import { Injectable } from "@nestjs/common";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "../category.types";
import { CategoriesRepository } from "./categories.repository";

@Injectable() //esto es vital para que NestJS sepa que puede "inyectar" esta clase luego
export class InMemoryCategoriesRepository implements CategoriesRepository {
    //aqui guardaremos nuestras categorias temporalmente
  private categories: Category[] = [];
  // un contador para asignar IDs automaticamente (1, 2, 3 ...)
  private idCounter = 1;

    async findAll(): Promise<Category[]> {
        return this.categories;
    }

    async findById(id: number): Promise<Category | undefined> {
        return this.categories.find(category => category.id === id);
    }

    async create(input: CreateCategoryInput): Promise<Category> {
        const newCategory: Category = {
            id: this.idCounter++,
            name: input.name,
        };
        this.categories.push(newCategory);
        return newCategory;
    }

    async update(id: number, input: UpdateCategoryInput): Promise<Category | undefined> {
        const category = await this.findById(id);
        if (!category) return undefined;
        if (input.name !== undefined) category.name = input.name;
        return category;
    }

    async remove(id: number): Promise<Category | undefined> {
        const index = this.categories.findIndex(category => category.id === id);
        if (index === -1) return undefined;
        const removedCategory = this.categories[index];
        this.categories.splice(index, 1);
        return removedCategory;
    }
}