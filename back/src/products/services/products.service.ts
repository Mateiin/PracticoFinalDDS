import { Inject, Injectable, NotFoundException, BadRequestException, forwardRef } from '@nestjs/common';
import {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from '../product.types';
import {
  PRODUCTS_REPOSITORY,
  ProductsRepository,
} from '../repositories/products.repository';
import { CategoriesService } from '../../categories/services/categories.service';
import { PaginatedResult } from '../../common/pagination.types';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: ProductsRepository,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
  ) {}

  private enrichProduct(product: Product): Product {
    if (!product.categoryId) {
      return { ...product, category: null };
    }
    try {
      const category = this.categoriesService.findById(product.categoryId);
      return { ...product, category: { id: category.id, name: category.name } };
    } catch {
      return { ...product, category: null };
    }
  }

  async findAll(
    name?: string, 
    orderBy?: string, 
    order?: 'asc' | 'desc', 
    page?: number, 
    limit?: number): Promise<PaginatedResult<Product>> {
    const result = await this.productsRepository.findAll(name, orderBy, order, page, limit);
    return {
      ...result,
      data: result.data.map((p) => this.enrichProduct(p)),
    };
  }

  async findById(id: number): Promise<Product | undefined> {
    const product = await this.productsRepository.findById(id);
    if (!product) return undefined;
    return this.enrichProduct(product);
  }

  async reduceStock(id: number, quantity: number): Promise<Product>{
    //1. buscamos el producto en la base de datos
    const product = await this.productsRepository.findById(id);

    // si no existe, lanzamos un error 404
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
      
    }

    // 2. verificamos si la cantidad a restar es mayor al stock que tenemos
    if (quantity > product.stock) {
      //lanzamos un error 400 bad request con un mensaje
      throw new BadRequestException('Stock insuficiente');
      
    }

    const newStock = product.stock - quantity;
    const updatedProduct = await this.productsRepository.updateStock(id, newStock);
    return updatedProduct!;

  
  }

  
  async findByCategory(categoryId: number): Promise<Product[]> {
    return await this.productsRepository.findByCategory(categoryId);
  }

  async create(input: CreateProductInput): Promise<Product> {
    return await this.productsRepository.create(input);
  }

  async update(id: number, input: UpdateProductInput): Promise<Product | undefined> {
    return await this.productsRepository.update(id, input);
  }

  async remove(id: number): Promise<Product | undefined> {
   return await this.productsRepository.remove(id);
  }
}

