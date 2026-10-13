import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { join } from 'node:path';

loadEnv();

/** DataSource usado pelo TypeORM CLI (migration:generate/run/revert). */
export default new DataSource({
  type: 'better-sqlite3',
  database: process.env.DATABASE_PATH ?? './db.sqlite',
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
});
