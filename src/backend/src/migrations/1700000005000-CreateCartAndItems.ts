import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCartAndItems1700000005000 implements MigrationInterface {
  async up(qr: QueryRunner): Promise<void> {
    await qr.createTable(
      new Table({
        name: 'carts',
        columns: [
          { name: 'id', type: 'text', isPrimary: true },
          { name: 'userId', type: 'text', isUnique: true },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    await qr.createTable(
      new Table({
        name: 'cart_items',
        columns: [
          { name: 'id', type: 'text', isPrimary: true },
          { name: 'cartId', type: 'text' },
          { name: 'productId', type: 'text' },
          { name: 'quantity', type: 'integer' },
        ],
        indices: [{ columnNames: ['cartId'] }, { columnNames: ['productId'] }],
      }),
    );

    await qr.createForeignKey(
      'cart_items',
      new TableForeignKey({
        columnNames: ['cartId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'carts',
        onDelete: 'CASCADE',
      }),
    );
    await qr.createForeignKey(
      'cart_items',
      new TableForeignKey({
        columnNames: ['productId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'RESTRICT',
      }),
    );
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.dropTable('cart_items');
    await qr.dropTable('carts');
  }
}
