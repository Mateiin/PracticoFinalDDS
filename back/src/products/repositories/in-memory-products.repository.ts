import {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from '../product.types';
import { ProductsRepository } from './products.repository';
import { PaginatedResult } from '../../common/pagination.types';

export class InMemoryProductsRepository implements ProductsRepository {
  private products: Product[] = [];
  private nextId = 1;

  async findAll(name?: string, orderBy?: string, order?: 'asc' | 'desc', page: number = 1, limit: number = 5): Promise<PaginatedResult<Product>> {
    let result = [...this.products]; // hacemos una copia para no alterar el array original
    
    // 1. Filtrado por nombre
    if (name) {
      const busquedaEnMinuscula = name.toLocaleLowerCase();
      result = result.filter((p) => p.name.toLocaleLowerCase().includes(busquedaEnMinuscula));
    }

    // 2. Ordenamiento
    if (orderBy) {
      result = result.sort((a, b) => {
        const valueA = a[orderBy];
        const valueB = b[orderBy];

        if (valueA < valueB) {
          return order === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    //3. Paginación
    
    //1. Page minimo 1
    const validPage = page > 0? page : 1;

    //2. limit maximo 50
    const validLimit = limit > 50 ? 50 : limit;

    // calcular el total de elementos y páginas
    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / validLimit);

    // cortar el array (el "offset")
    const startIndex = (validPage - 1) * validLimit;
    const endIndex = startIndex + validLimit;
    const paginatedData = result.slice(startIndex, endIndex);

    // devolver el resultado con la data y la meta data
    return {
      data: paginatedData,
      meta: {
        page: validPage,
        limit: validLimit,
        total: totalItems,
        totalPages: totalPages,
      }
    };
    
  }

  async findById(id: number): Promise<Product | undefined> {
    return this.products.find((p) => p.id === id);
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
   //se filtra y se devuelve solo los productos que coincidan con esa categoria
    return this.products.filter(product=> product.categoryId === categoryId);

  }

  async create(input: CreateProductInput): Promise<Product> {
    const product: Product = {
      id: this.nextId++,
      name: input.name,
      price: input.price,
      stock: input.stock,
      categoryId: input.categoryId,
    };

    this.products.push(product);
    return product;
  }

  async update(id: number, input: UpdateProductInput): Promise<Product | undefined> {
    const product = await this.findById(id);
    if (!product) return undefined;

    if (input.name !== undefined) product.name = input.name;
    if (input.price !== undefined) product.price = input.price;
    if (input.stock !== undefined) product.stock = input.stock;
    if (input.categoryId !== undefined) product.categoryId = input.categoryId;
    return product;
  
  }

  async updateStock(id: number, newStock: number): Promise<Product | undefined> {
    //Buscamos el producto por su ID
    const product = await this.findById(id);
    if (!product) return undefined;

    //Le pisamos el stock viejo con el nuevo
    product.stock = newStock;
    return product;
  }

  async remove(id: number): Promise<Product | undefined> {
    const product = await this.findById(id);
    if (!product) return undefined;

    this.products = this.products.filter((p) => p.id !== id);
    return product;
  }
}


