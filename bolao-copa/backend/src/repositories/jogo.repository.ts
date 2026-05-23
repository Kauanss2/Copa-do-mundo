import { prisma } from '../libs/prisma'
export async function findAllJogos(edicaoId?: string) {
    return prisma.jogo.findMany({
        where: edicaoId ? { edicaoId } : undefined,
        include: {
            timeCasa:      { select: { id: true, nome: true, sigla: true, bandeiraUrl: true } },
            timeVisitante: { select: { id: true, nome: true, sigla: true, bandeiraUrl: true } },
        },
        orderBy: { inicioEm: 'asc' }
    })
}
export async function findJogoById(id: string) {
    return prisma.jogo.findUnique({
        where: { id },
        include: {
            timeCasa: { select: { id: true, nome: true, sigla: true, bandeiraUrl: true } },
            timeVisitante: { select: { id: true, nome: true, sigla: true, bandeiraUrl: true } },
        }
    })
}