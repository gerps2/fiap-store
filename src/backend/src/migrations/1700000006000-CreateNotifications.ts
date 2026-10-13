import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateNotifications1700000006000 implements MigrationInterface {
  async up(qr: QueryRunner): Promise<void> {
    await qr.createTable(
      new Table({
        name: 'notifications',
        columns: [
          { name: 'id', type: 'text', isPrimary: true },
          { name: 'userId', type: 'text' },
          { name: 'kind', type: 'text' },
          { name: 'title', type: 'text' },
          { name: 'body', type: 'text' },
          { name: 'readAt', type: 'datetime', isNullable: true },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
        indices: [{ columnNames: ['userId'] }],
      }),
    );
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.dropTable('notifications');
  }
}
