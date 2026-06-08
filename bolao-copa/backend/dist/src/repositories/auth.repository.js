"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByEmail = findByEmail;
const prisma_1 = require("../libs/prisma");
async function findByEmail(email) {
    return prisma_1.prisma.usuario.findUnique({ where: { email } });
}
