"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByEmail = findByEmail;
exports.createUsuario = createUsuario;
exports.findAllUsuarios = findAllUsuarios;
exports.updateSenhaUsuario = updateSenhaUsuario;
const prisma_1 = require("../libs/prisma");
async function findByEmail(email) {
    return prisma_1.prisma.usuario.findUnique({ where: { email } });
}
async function createUsuario(data) {
    return prisma_1.prisma.usuario.create({ data });
}
async function findAllUsuarios() {
    return prisma_1.prisma.usuario.findMany({
        select: {
            id: true,
            nome: true,
            email: true,
            criadoEm: true,
            // senhaHash nunca aparece aqui
        }
    });
}
async function updateSenhaUsuario(id, senhaHash) {
    return prisma_1.prisma.usuario.update({
        where: { id },
        data: { senhaHash }
    });
}
