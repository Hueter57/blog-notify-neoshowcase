import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: ['query'], // 必要に応じて省略
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}