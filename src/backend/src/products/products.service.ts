import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { CreateProductInput } from './dto/create-product.input';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
  ) {}

  /** Lista produtos com filtros simples. */
  async findAll(params: { search?: string; categorySlug?: string }): Promise<Product[]> {
    const qb = this.products.createQueryBuilder('p').leftJoinAndSelect('p.category', 'c');
    if (params.search) {
      qb.andWhere('p.name LIKE :q OR p.sku LIKE :q', { q: `%${params.search}%` });
    }
    if (params.categorySlug) {
      qb.andWhere('c.slug = :slug', { slug: params.categorySlug });
    }
    return qb.orderBy('p.createdAt', 'DESC').getMany();
  }

  findById(id: string): Promise<Product | null> {
    return this.products.findOne({ where: { id }, relations: ['category'] });
  }

  async create(input: CreateProductInput): Promise<Product> {
    const category = await this.categories.findOne({ where: { slug: input.categorySlug } });
    if (!category) throw new NotFoundException(`Categoria ${input.categorySlug} não existe.`);
    const product = this.products.create({
      sku: input.sku,
      name: input.name,
      description: input.description,
      priceCents: input.priceCents,
      imageUrl: input.imageUrl ?? null,
      categoryId: category.id,
    });
    return this.products.save(product);
  }

  listCategories(): Promise<Category[]> {
    return this.categories.find({ order: { name: 'ASC' } });
  }
}
