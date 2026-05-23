import { prisma } from '../libs/prisma'

export async function findByEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } })
}