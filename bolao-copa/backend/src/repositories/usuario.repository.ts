


import { prisma } from '../libs/prisma'

export async function findByEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } })
}

export async function createUsuario(data: any) {
    return prisma.usuario.create({ data })
}

export async function findAllUsuarios() {
    return prisma.usuario.findMany({
        select: {
            id: true,
            nome: true,
            email: true,
            criadoEm: true,
            // senhaHash nunca aparece aqui
        }
    })
}