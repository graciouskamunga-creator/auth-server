import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from '../config/env.js';
// Prisma client setup with connection pooling and adapter for PostgreSQL
declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = env.databaseUrl;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = global.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
