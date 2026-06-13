import {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from '../product.types';

import { PaginatedResult } from '../../common/pagination.types';


export const PRODUCTS_REPOSITORY = 'PRODUCTS_REPOSITORY';

export interface ProductsRepository {
  // actualizamos el método findAll para que acepte parámetros de ordenamiento
  findAll(name?: string, orderBy?: string, order?: 'asc' | 'desc', page?: number, limit?: number): Promise<PaginatedResult<Product>>;//ahora devuelve el objeto con la data y la meta data
  findById(id: number): Promise<Product | undefined>;
  findByCategory(categoryId: number): Promise<Product[]>;
  create(input: CreateProductInput): Promise<Product>;
  update(id: number, input: UpdateProductInput): Promise<Product | undefined>;
  remove(id: number): Promise<Product | undefined>;

  updateStock(id: number, newStock: number): Promise<Product | undefined>;
}

