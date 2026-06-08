"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllJogos = findAllJogos;
exports.findJogoById = findJogoById;
const prisma_1 = require("../libs/prisma");
async function findAllJogos(edicaoId) {
    return prisma_1.prisma.jogo.findMany({
        where: edicaoId ? { edicaoId } : undefined,
        include: {
            timeCasa: { select: { id: true, nome: true, sigla: true, bandeiraUrl: true } },
            timeVisitante: { select: { id: true, nome: true, sigla: true, bandeiraUrl: true } },
        },
        orderBy: { inicioEm: 'asc' }
    });
}
async function findJogoById(id) {
    return prisma_1.prisma.jogo.findUnique({
        where: { id },
        include: {
            timeCasa: { select: { id: true, nome: true, sigla: true, bandeiraUrl: true } },
            timeVisitante: { select: { id: true, nome: true, sigla: true, bandeiraUrl: true } },
        }
    });
}
