import { PrismaClient } from '../prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const adapter = new PrismaMariaDb({
    host: process.env.NS_MARIADB_HOSTNAME,
    user: process.env.NS_MARIADB_USER,
    password: process.env.NS_MARIADB_PASSWORD,
    database: process.env.NS_MARIADB_DATABASE,
    port: process.env.NS_MARIADB_PORT ? parseInt(process.env.NS_MARIADB_PORT) : 3306,
    connectionLimit: 5
});
export const prisma = new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}