import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOrders1700000007000 implements MigrationInterface {
  async up(qr: QueryRunner): Promise<void> {
    await qr.createTable(
      new Table({
        name: 'orders',
        columns: [
          { name: 'id', type: 'text', isPrimary: true },
          { name: 'userId', type: 'text' },
          { name: 'status', type: 'text', default: "'PENDING'" },
          { name: 'totalCents', type: 'integer' },
          { name: 'items', type: 'text' },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
        indices: [{ columnNames: ['userId'] }],
      }),
    );
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.dropTable('orders');
  }
}
