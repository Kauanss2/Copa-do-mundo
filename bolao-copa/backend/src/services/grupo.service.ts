import * as grupoRepository from '../repositories/grupo.repository'
import { prisma } from '../libs/prisma'

function gerarCodigo(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

async function gerarCodigoUnico(): Promise<string> {
  let codigo = gerarCodigo()
  let existe = await grupoRepository.findByCodigo(codigo)
  while (existe) {
    codigo = gerarCodigo()
    existe = await grupoRepository.findByCodigo(codigo)
  }
  return codigo
}

export async function criarGrupo(nome: string, usuarioId: string, edicaoId: string) {
  // Valida se a edição existe
  const edicao = await prisma.edicaoCampeonato.findUnique({
    where: { id: edicaoId },
  })
  if (!edicao) throw new Error('EDICAO_NAO_ENCONTRADA')

  const codigoConvite = await gerarCodigoUnico()

  const grupo = await grupoRepository.createGrupo({
    nome,
    codigoConvite,
    criadoPorId: usuarioId,
    edicaoId,  // ✅ vem do usuário agora
  })

  await grupoRepository.createMembro({
    grupoId:   grupo.id,
    usuarioId: usuarioId,
    papel:     'admin',
    status:    'aprovado',
  })

  return grupo
}

export async function entrarNoGrupo(codigo: string, usuarioId: string) {
  const grupo = await grupoRepository.findByCodigo(codigo)
  if (!grupo) throw new Error('GRUPO_NAO_ENCONTRADO')

  const jaExiste = await grupoRepository.findMembroExistente(grupo.id, usuarioId)
  if (jaExiste) {
    // Pode estar pendente ou já aprovado
    if (jaExiste.status === 'pendente') throw new Error('JA_ESTA_PENDENTE')
    throw new Error('JA_E_MEMBRO')
  }

  // Entra como pendente — aguarda aprovação do admin
  await grupoRepository.createMembro({
    grupoId: grupo.id,
    usuarioId: usuarioId,
    papel: 'membro',
    status: 'pendente',
  })

  return { mensagem: 'Solicitação enviada. Aguarde aprovação do administrador.' }
}

export async function aprovarMembro(
  grupoId: string,
  membroId: string,
  adminId: string
) {
  await verificarAdmin(grupoId, adminId)

  const membro = await grupoRepository.findMembroExistente(grupoId, membroId)
  if (!membro) throw new Error('MEMBRO_NAO_ENCONTRADO')
  if (membro.status !== 'pendente') throw new Error('MEMBRO_NAO_PENDENTE')

  return grupoRepository.atualizarStatusMembro(grupoId, membroId, 'aprovado')
}

export async function rejeitarMembro(
  grupoId: string,
  membroId: string,
  adminId: string
) {
  await verificarAdmin(grupoId, adminId)

  const membro = await grupoRepository.findMembroExistente(grupoId, membroId)
  if (!membro) throw new Error('MEMBRO_NAO_ENCONTRADO')
  if (membro.status !== 'pendente') throw new Error('MEMBRO_NAO_PENDENTE')

  // Rejeitar = apaga o registro completamente
  await grupoRepository.deletarMembro(grupoId, membroId)
  return { mensagem: 'Solicitação rejeitada.' }
}

// Helper interno
async function verificarAdmin(grupoId: string, usuarioId: string) {
  const admin = await grupoRepository.findMembroExistente(grupoId, usuarioId)
  if (!admin || admin.papel !== 'admin') throw new Error('SEM_PERMISSAO')
}

export async function listarMeusGrupos(usuarioId: string) {
  const membros = await grupoRepository.findGruposByUsuario(usuarioId)
  return membros.map(m => ({
    id:            m.grupo.id,
    nome:          m.grupo.nome,
    codigoConvite: m.grupo.codigoConvite,
    edicaoId:      m.grupo.edicaoId,   // ← estava faltando
    papel:         m.papel,
    status:        m.status,
    pontuacao:     m.pontuacaoTotal,
    totalMembros:  m.grupo._count.membros,
    criadoEm:      m.grupo.criadoEm,
  }))
}

export async function verGrupo(grupoId: string, usuarioId: string) {
  const grupo = await grupoRepository.findById(grupoId)
  if (!grupo) throw new Error('GRUPO_NAO_ENCONTRADO')

  const membro = await grupoRepository.findMembroExistente(grupoId, usuarioId)
  if (!membro || membro.status !== 'aprovado') throw new Error('SEM_PERMISSAO')

  // Retorna no mesmo formato que listarMeusGrupos
  return {
    id:            grupo.id,
    nome:          grupo.nome,
    codigoConvite: grupo.codigoConvite,
    edicaoId:      grupo.edicaoId,     // ← essencial pro GrupoDetalhe
    papel:         membro.papel,
    status:        membro.status,
    pontuacao:     membro.pontuacaoTotal,
    totalMembros:  grupo.membros.length,
    membros:       grupo.membros,      // ← necessário pro ranking/membros
  }
}