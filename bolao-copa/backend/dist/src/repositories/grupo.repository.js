"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGrupo = createGrupo;
exports.findByCodigo = findByCodigo;
exports.findById = findById;
exports.findMembroExistente = findMembroExistente;
exports.createMembro = createMembro;
exports.findGruposByUsuario = findGruposByUsuario;
exports.atualizarStatusMembro = atualizarStatusMembro;
exports.deletarMembro = deletarMembro;
const prisma_1 = require("../libs/prisma");
async function createGrupo(data) {
    return prisma_1.prisma.grupo.create({ data });
}
async function findByCodigo(codigoConvite) {
    return prisma_1.prisma.grupo.findUnique({ where: { codigoConvite } });
}
async function findById(id) {
    return prisma_1.prisma.grupo.findUnique({
        where: { id },
        include: {
            membros: {
                include: { usuario: { select: { id: true, nome: true, email: true } } },
                orderBy: { pontuacaoTotal: 'desc' }
            }
        }
    });
}
async function findMembroExistente(grupoId, usuarioId) {
    return prisma_1.prisma.membroGrupo.findUnique({
        where: { grupoId_usuarioId: { grupoId, usuarioId } }
    });
}
async function createMembro(data) {
    return prisma_1.prisma.membroGrupo.create({ data });
}
async function findGruposByUsuario(usuarioId) {
    return prisma_1.prisma.membroGrupo.findMany({
        where: { usuarioId },
        include: {
            grupo: {
                include: {
                    _count: { select: { membros: true } }
                }
            }
        }
    });
}
async function atualizarStatusMembro(grupoId, usuarioId, status) {
    return prisma_1.prisma.membroGrupo.update({
        where: { grupoId_usuarioId: { grupoId, usuarioId } },
        data: { status },
    });
}
async function deletarMembro(grupoId, usuarioId) {
    return prisma_1.prisma.membroGrupo.delete({
        where: { grupoId_usuarioId: { grupoId, usuarioId } },
    });
}
