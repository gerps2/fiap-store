import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from './user.entity';

const ARGON2_OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

const DUMMY_HASH_SEED = 'fiap-store-dummy-password-for-constant-time-ops';
let DUMMY_HASH: string | null = null;

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  /** Cria um usuário novo (anti-enumeration: gasta argon2 mesmo em email duplicado). */
  async create(email: string, password: string, groups = ['cliente']): Promise<User> {
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) {
      await this.burnArgon2(password);
      throw new ConflictException('Email já cadastrado.');
    }
    const passwordHash = await argon2.hash(password, ARGON2_OPTS);
    return this.repo.save(this.repo.create({ email, passwordHash, groups }));
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  verifyPassword(user: User, password: string): Promise<boolean> {
    return argon2.verify(user.passwordHash, password);
  }

  /** Hash dummy para login contra email inexistente (tempo constante, anti-enumeration). */
  async burnArgon2(password: string): Promise<void> {
    if (!DUMMY_HASH) DUMMY_HASH = await argon2.hash(DUMMY_HASH_SEED, ARGON2_OPTS);
    await argon2.verify(DUMMY_HASH, password).catch(() => false);
  }
}
