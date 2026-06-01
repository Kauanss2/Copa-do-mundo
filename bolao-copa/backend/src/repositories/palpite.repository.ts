import { prisma } from '../libs/prisma'

export async function findJogoById(id: string) {
    return prisma.jogo.findUnique({ where: { id } })
}

export async function findPalpiteExistente(
    usuarioId: string,
    jogoId: string,
    grupoId: string
) {
    return prisma.palpite.findUnique({
        where: {
            usuarioId_jogoId_grupoId: { usuarioId, jogoId, grupoId }
        }
    })
}

export async function createPalpite(data: {
    usuarioId: string
    jogoId: string
    grupoId: string
    golsCasa: number
    golsVisitante: number
}) {
    return prisma.palpite.create({ data })
}

export async function updatePalpite(id: string, data: {
    golsCasa: number
    golsVisitante: number
}) {
    return prisma.palpite.update({ where: { id }, data })
}

export async function findMeusPalpites(usuarioId: string, grupoId: string) {
    return prisma.palpite.findMany({
        where: { usuarioId, grupoId },
        orderBy: { criadoEm: 'desc' }
    })
}

export async function findPalpitesGrupo(grupoId: string) {
    return prisma.palpite.findMany({
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
    })
}