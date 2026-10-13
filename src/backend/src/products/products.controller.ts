import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

/**
 * Versão REST do catálogo — existe **apenas para fins didáticos** (V1 da Aula 3):
 * comparar lado-a-lado com o resolver GraphQL `listProducts`.
 *
 * O contraste que o aluno vê em tela:
 *   - `GET /products` devolve sempre o dump completo (id, sku, name, description,
 *     priceCents, imageUrl, categoryId, category { id, slug, name }, createdAt).
 *   - `POST /graphql { listProducts { name priceCents } }` devolve só esses dois
 *     campos — o cliente escolhe o shape.
 *
 * Em produção, o catálogo do fiap-store é consumido via GraphQL. REST está aqui
 * literalmente para provar o ponto no vídeo.
 */
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  /** Lista todos os produtos (sempre com todos os campos — limitação do REST). */
  @Get()
  async list(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.products.findAll({ search, categorySlug: category });
  }
}
