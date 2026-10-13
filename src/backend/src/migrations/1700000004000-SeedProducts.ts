import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuid } from 'uuid';

type ProductSeed = {
  sku: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl?: string;
  categorySlug: string;
};

const CATEGORIES: { slug: string; name: string }[] = [
  { slug: 'camisetas', name: 'Camisetas' },
  { slug: 'canecas', name: 'Canecas' },
  { slug: 'livros', name: 'Livros' },
];

const PRODUCTS: ProductSeed[] = [
  {
    sku: 'CAM-NG-001',
    name: 'Camiseta Native Federation',
    description: 'Camiseta preta com estampa "esbuild > webpack".',
    priceCents: 9900,
    categorySlug: 'camisetas',
  },
  {
    sku: 'CAM-MF-002',
    name: 'Camiseta Module Federation',
    description: 'Branca, regular fit, manga curta.',
    priceCents: 9900,
    categorySlug: 'camisetas',
  },
  {
    sku: 'CAM-HTX-003',
    name: 'Camiseta "It works on my MFE"',
    description: 'Preta, estampa branca — fit oversized.',
    priceCents: 12900,
    categorySlug: 'camisetas',
  },
  {
    sku: 'CAN-JWT-001',
    name: 'Caneca JWT',
    description: 'Header.Payload.Signature ao redor da caneca, 300ml.',
    priceCents: 5900,
    categorySlug: 'canecas',
  },
  {
    sku: 'CAN-GRP-002',
    name: 'Caneca GraphQL',
    description: 'Logo GraphQL rosa, 350ml, porcelana.',
    priceCents: 6900,
    categorySlug: 'canecas',
  },
  {
    sku: 'LIV-MFE-001',
    name: 'Micro Frontends in Action — Michael Geers',
    description: 'Manning, 2020. Referência canônica de MFE.',
    priceCents: 18900,
    categorySlug: 'livros',
  },
  {
    sku: 'LIV-SEC-002',
    name: 'Web Application Security — Andrew Hoffman',
    description: 'O\'Reilly, 2ª ed, 2024.',
    priceCents: 21900,
    categorySlug: 'livros',
  },
  {
    sku: 'LIV-NG-003',
    name: 'Angular Architectures — Manfred Steyer',
    description: 'Angular 21, Nx, Module Federation na prática.',
    priceCents: 24900,
    categorySlug: 'livros',
  },
];

export class SeedProducts1700000004000 implements MigrationInterface {
  async up(qr: QueryRunner): Promise<void> {
    const catIds = new Map<string, string>();
    for (const c of CATEGORIES) {
      const id = uuid();
      await qr.query(`INSERT INTO categories (id, slug, name) VALUES (?, ?, ?)`, [id, c.slug, c.name]);
      catIds.set(c.slug, id);
    }
    for (const p of PRODUCTS) {
      const catId = catIds.get(p.categorySlug);
      if (!catId) continue;
      await qr.query(
        `INSERT INTO products (id, sku, name, description, priceCents, imageUrl, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuid(), p.sku, p.name, p.description, p.priceCents, p.imageUrl ?? null, catId],
      );
    }
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DELETE FROM products`);
    await qr.query(`DELETE FROM categories`);
  }
}
