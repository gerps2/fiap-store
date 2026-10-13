import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsers1700000000000 implements MigrationInterface {
  async up(qr: QueryRunner): Promise<void> {
    await qr.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'text', isPrimary: true },
          { name: 'email', type: 'text', isUnique: true },
          { name: 'passwordHash', type: 'text' },
          { name: 'groups', type: 'text', default: "'cliente'" },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.dropTable('users');
  }
}
