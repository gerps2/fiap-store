import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly carts: Repository<Cart>,
    @InjectRepository(CartItem) private readonly items: Repository<CartItem>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  /** Retorna o carrinho do usuário, criando-o lazy na primeira interação. */
  async getOrCreate(userId: string): Promise<Cart> {
    let cart = await this.carts.findOne({ where: { userId } });
    if (!cart) {
      cart = this.carts.create({ userId, items: [] });
      cart = await this.carts.save(cart);
    }
    return this.load(cart.id);
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<Cart> {
    if (quantity <= 0) throw new BadRequestException('Quantidade deve ser > 0.');
    const cart = await this.getOrCreate(userId);
    const product = await this.products.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produto não existe.');

    const existing = cart.items.find((it) => it.productId === productId);
    if (existing) {
      existing.quantity += quantity;
      await this.items.save(existing);
    } else {
      const item = this.items.create({ cartId: cart.id, productId, quantity });
      await this.items.save(item);
    }
    return this.load(cart.id);
  }

  async updateItem(userId: string, itemId: string, quantity: number): Promise<Cart> {
    const cart = await this.getOrCreate(userId);
    const item = cart.items.find((it) => it.id === itemId);
    if (!item) throw new NotFoundException('Item não pertence ao seu carrinho.');
    if (quantity <= 0) {
      await this.items.delete({ id: itemId });
    } else {
      item.quantity = quantity;
      await this.items.save(item);
    }
    return this.load(cart.id);
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreate(userId);
    const owned = cart.items.find((it) => it.id === itemId);
    if (!owned) throw new NotFoundException('Item não pertence ao seu carrinho.');
    await this.items.delete({ id: itemId });
    return this.load(cart.id);
  }

  async clear(userId: string): Promise<void> {
    const cart = await this.getOrCreate(userId);
    await this.items.delete({ cartId: cart.id });
  }

  /** Recarrega o carrinho com items e products eager. */
  private async load(id: string): Promise<Cart> {
    const cart = await this.carts.findOne({ where: { id } });
    if (!cart) throw new NotFoundException('Carrinho não encontrado.');
    return cart;
  }
}
