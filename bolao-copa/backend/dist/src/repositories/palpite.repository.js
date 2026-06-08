"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findJogoById = findJogoById;
exports.findPalpiteExistente = findPalpiteExistente;
exports.createPalpite = createPalpite;
exports.updatePalpite = updatePalpite;
exports.findMeusPalpites = findMeusPalpites;
exports.findPalpitesGrupo = findPalpitesGrupo;
const prisma_1 = require("../libs/prisma");
async function findJogoById(id) {
    return prisma_1.prisma.jogo.findUnique({ where: { id } });
}
async function findPalpiteExistente(usuarioId, jogoId, grupoId) {
    return prisma_1.prisma.palpite.findUnique({
        where: {
            usuarioId_jogoId_grupoId: { usuarioId, jogoId, grupoId }
        }
    });
}
async function createPalpite(data) {
    return prisma_1.prisma.palpite.create({ data });
}
async function updatePalpite(id, data) {
    return prisma_1.prisma.palpite.update({ where: { id }, data });
}
async function findMeusPalpites(usuarioId, grupoId) {
    return prisma_1.prisma.palpite.findMany({
        where: { usuarioId, grupoId },
        orderBy: { criadoEm: 'desc' }
    });
}
async function findPalpitesGrupo(grupoId) {
    return prisma_1.prisma.palpite.findMany({
        where: { grupoId },
        include: {
            usuario: { select: { nome: true, email: true } },
            jogo: {
                include: {
                    timeCasa: { select: { nome: true } },
                    timeVisitante: { select: { nome: true } }
                }
            }
        },
        orderBy: [{ jogo: { inicioEm: 'asc' } }, { usuario: { nome: 'asc' } }]
    });
}
