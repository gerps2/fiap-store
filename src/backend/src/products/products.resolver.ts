import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { CreateProductInput } from './dto/create-product.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CsrfGuard } from '../auth/csrf.guard';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly products: ProductsService) {}

  @Query(() => [Product])
  listProducts(
    @Args('search', { nullable: true }) search?: string,
    @Args('category', { nullable: true }) category?: string,
  ): Promise<Product[]> {
    return this.products.findAll({ search, categorySlug: category });
  }

  @Query(() => Product)
  async product(@Args('id', { type: () => ID }) id: string): Promise<Product> {
    const p = await this.products.findById(id);
    if (!p) throw new NotFoundException('Produto não encontrado.');
    return p;
  }

  @Query(() => [Category])
  categories(): Promise<Category[]> {
    return this.products.listCategories();
  }

  /** Apenas admins podem criar produtos (defense in depth — guard + validação no resolver). */
  @UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
  @Roles('admin')
  @Mutation(() => Product)
  createProduct(@Args('input') input: CreateProductInput): Promise<Product> {
    return this.products.create(input);
  }
}
