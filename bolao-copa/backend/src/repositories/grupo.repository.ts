import { prisma } from '../libs/prisma'

export async function createGrupo(data: {
  nome:          string
  codigoConvite: string
  criadoPorId:   string
  edicaoId:      string
}) {
  return prisma.grupo.create({ data })
}

export async function findByCodigo(codigoConvite: string) {
  return prisma.grupo.findUnique({ where: { codigoConvite } })
}

export async function findById(id: string) {
  return prisma.grupo.findUnique({
    where: { id },
    include: {
      membros: {
        include: { usuario: { select: { id: true, nome: true, email: true } } },
        orderBy: { pontuacaoTotal: 'desc' }
      }
    }
  })
}

export async function findMembroExistente(grupoId: string, usuarioId: string) {
  return prisma.membroGrupo.findUnique({
    where: { grupoId_usuarioId: { grupoId, usuarioId } }
  })
}

export async function createMembro(data: {
  grupoId: string
  usuarioId: string
  papel: string
  status: string  // ✅ adicione isso
}) {
  return prisma.membroGrupo.create({ data })
}

export async function findGruposByUsuario(usuarioId: string) {
  return prisma.membroGrupo.findMany({
    where: { usuarioId },
    include: {
      grupo: {
        include: {
          _count: { select: { membros: true } }
        }
      }
    }
  })
}

export async function atualizarStatusMembro(
  grupoId: string,
  usuarioId: string,
  status: string
) {
  return prisma.membroGrupo.update({
    where: { grupoId_usuarioId: { grupoId, usuarioId } },
    data: { status },
  })
}

export async function deletarMembro(grupoId: string, usuarioId: string) {
  return prisma.membroGrupo.delete({
    where: { grupoId_usuarioId: { grupoId, usuarioId } },
  })
}