import { MigrationInterface, QueryRunner } from 'typeorm';
import * as argon2 from 'argon2';
import { v4 as uuid } from 'uuid';

const ARGON2_OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export class SeedUsers1700000001000 implements MigrationInterface {
  async up(qr: QueryRunner): Promise<void> {
    const adminHash = await argon2.hash('admin123', ARGON2_OPTS);
    const clienteHash = await argon2.hash('cliente123', ARGON2_OPTS);
    await qr.query(
      `INSERT INTO users (id, email, passwordHash, groups) VALUES (?, ?, ?, ?)`,
      [uuid(), 'admin@fiap.com', adminHash, 'admin,cliente'],
    );
    await qr.query(
      `INSERT INTO users (id, email, passwordHash, groups) VALUES (?, ?, ?, ?)`,
      [uuid(), 'cliente@fiap.com', clienteHash, 'cliente'],
    );
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(
      `DELETE FROM users WHERE email IN ('admin@fiap.com','cliente@fiap.com')`,
    );
  }
}
