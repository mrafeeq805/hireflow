import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const target = (process.argv[2] || 'sqlite').toLowerCase();
const prismaDir = path.resolve(__dirname, '../prisma');

if (target.includes('postgres')) {
  fs.copyFileSync(
    path.join(prismaDir, 'schema.postgresql.prisma'),
    path.join(prismaDir, 'schema.prisma')
  );
  console.log('✓ Active Prisma schema switched to PostgreSQL');
} else {
  fs.copyFileSync(
    path.join(prismaDir, 'schema.sqlite.prisma'),
    path.join(prismaDir, 'schema.prisma')
  );
  console.log('✓ Active Prisma schema switched to SQLite');
}
