import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../entities/category.entity';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '../category.types';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class TypeOrmCategoriesRepository implements CategoriesRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repo: Repository<CategoryEntity>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findById(id: number): Promise<Category | undefined> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ?? undefined;
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const entity = this.repo.create({ name: input.name });
    try {
      return await this.repo.save(entity);
    } catch (err: any) {
      if (err?.code === 'SQLITE_CONSTRAINT' || err?.code === '23505' || err?.message?.includes('UNIQUE')) {
        throw new ConflictException(`Ya existe una categoría con el nombre "${input.name}"`);
      }
      throw err;
    }
  }

  async update(id: number, input: UpdateCategoryInput): Promise<Category | undefined> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return undefined;
    if (input.name !== undefined) entity.name = input.name;
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<Category | undefined> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return undefined;
    const copy = { ...entity };
    await this.repo.remove(entity);
    return copy;
  }
}
