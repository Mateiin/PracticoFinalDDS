import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../common/pagination.types';
import { ProductEntity } from '../entities/product.entity';
import { CreateProductInput, Product, UpdateProductInput } from '../product.types';
import { ProductsRepository } from './products.repository';

const ALLOWED_ORDER_FIELDS = ['id', 'name', 'price', 'stock'];

@Injectable()
export class TypeOrmProductsRepository implements ProductsRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: Repository<ProductEntity>,
  ) {}

  async findAll(
    name?: string,
    orderBy?: string,
    order: 'asc' | 'desc' = 'asc',
    page = 1,
    limit = 5,
  ): Promise<PaginatedResult<Product>> {
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 50 ? 50 : limit;

    const qb = this.repo.createQueryBuilder('p');

    if (name) {
      qb.where('LOWER(p.name) LIKE LOWER(:name)', { name: `%${name}%` });
    }

    if (orderBy && ALLOWED_ORDER_FIELDS.includes(orderBy)) {
      qb.orderBy(`p.${orderBy}`, order.toUpperCase() as 'ASC' | 'DESC');
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((validPage - 1) * validLimit)
      .take(validLimit)
      .getMany();

    return {
      items: data as Product[],
      meta: { page: validPage, limit: validLimit, total, totalPages: Math.ceil(total / validLimit) },
    };
  }

  async findById(id: number): Promise<Product | undefined> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ?? undefined;
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    return this.repo.find({ where: { categoryId } });
  }

  async create(input: CreateProductInput): Promise<Product> {
    const entity = this.repo.create(input);
    return this.repo.save(entity);
  }

  async update(id: number, input: UpdateProductInput): Promise<Product | undefined> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return undefined;
    Object.assign(entity, input);
    return this.repo.save(entity);
  }

  async updateStock(id: number, newStock: number): Promise<Product | undefined> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return undefined;
    entity.stock = newStock;
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<Product | undefined> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return undefined;
    const copy = { ...entity };
    await this.repo.remove(entity);
    return copy;
  }
}
