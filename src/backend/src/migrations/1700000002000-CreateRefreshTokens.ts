import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRefreshTokens1700000002000 implements MigrationInterface {
  async up(qr: QueryRunner): Promise<void> {
    await qr.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          { name: 'id', type: 'text', isPrimary: true },
          { name: 'userId', type: 'text' },
          { name: 'familyId', type: 'text' },
          { name: 'expiresAt', type: 'datetime' },
          { name: 'revokedAt', type: 'datetime', isNullable: true },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
        indices: [
          { columnNames: ['userId'] },
          { columnNames: ['familyId'] },
        ],
      }),
    );
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.dropTable('refresh_tokens');
  }
}
