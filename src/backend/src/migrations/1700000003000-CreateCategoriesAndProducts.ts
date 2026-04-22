import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCategoriesAndProducts1700000003000 implements MigrationInterface {
  async up(qr: QueryRunner): Promise<void> {
    await qr.createTable(
      new Table({
        name: 'categories',
        columns: [
          { name: 'id', type: 'text', isPrimary: true },
          { name: 'slug', type: 'text', isUnique: true },
          { name: 'name', type: 'text' },
        ],
      }),
    );

    await qr.createTable(
      new Table({
        name: 'products',
        columns: [
          { name: 'id', type: 'text', isPrimary: true },
          { name: 'sku', type: 'text', isUnique: true },
          { name: 'name', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'priceCents', type: 'integer' },
          { name: 'imageUrl', type: 'text', isNullable: true },
          { name: 'categoryId', type: 'text' },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
        indices: [{ columnNames: ['categoryId'] }],
      }),
    );

    await qr.createForeignKey(
      'products',
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'RESTRICT',
      }),
    );
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.dropTable('products');
    await qr.dropTable('categories');
  }
}
