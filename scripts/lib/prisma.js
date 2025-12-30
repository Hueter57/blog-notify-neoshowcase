"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("../prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
const globalForPrisma = globalThis;
const adapter = new adapter_mariadb_1.PrismaMariaDb({
    host: process.env.NS_MARIADB_HOSTNAME,
    user: process.env.NS_MARIADB_USER,
    password: process.env.NS_MARIADB_PASSWORD,
    database: process.env.NS_MARIADB_DATABASE,
    port: process.env.NS_MARIADB_PORT ? parseInt(process.env.NS_MARIADB_PORT) : 3306,
    connectionLimit: 5
});
exports.prisma = new client_1.PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
