import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as grupoService from '../services/grupo.service'

export async function criarGrupoController(req: AuthRequest, res: Response) {
  try {
    const { nome, edicaoId } = req.body
    if (!nome || !edicaoId) {
      return res.status(400).json({ error: 'Nome e edição são obrigatórios.' })
    }
    const grupo = await grupoService.criarGrupo(nome, req.usuario!.id, edicaoId)
    return res.status(201).json(grupo)
  } catch (error) {
if (error instanceof Error) {
            if (error.message === 'GRUPO_NAO_ENCONTRADO') {
                return res.status(404).json({ error: 'Grupo não encontrado.' })
            }
            if (error.message === 'JA_E_MEMBRO') {
                return res.status(409).json({ error: 'Você já é membro deste grupo.' })
            }
        }
        console.error(error)
        return res.status(500).json({ error: 'Erro interno do servidor.' })  }
}

export async function entrarNoGrupoController(req: AuthRequest, res: Response) {
    try {
        const { codigo } = req.body // Código de convite do grupo
        const usuarioId = req.usuario!.id
console.log('ID do usuário:', usuarioId) // Log para verificar o ID do usuário
console.log('Requisição recebida para entrar no grupo com código:', codigo) // Log para verificar o código recebido
        if (!codigo) {
            return res.status(400).json({ error: 'Código de convite é obrigatório.' })

        }
        console.log('Código recebido:', codigo) // Log para verificar o valor do código

        const grupo = await grupoService.entrarNoGrupo(codigo, usuarioId)
        return res.status(200).json({ message: 'Entrou no grupo com sucesso!', grupo })

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'GRUPO_NAO_ENCONTRADO') {
                return res.status(404).json({ error: 'Grupo não encontrado.' })
            }
            if (error.message === 'JA_E_MEMBRO') {
                return res.status(409).json({ error: 'Você já é membro deste grupo.' })
            }
        }
        console.error(error)
        return res.status(500).json({ error: 'Erro interno do servidor.' })
    }
}

export async function listarMeusGruposController(req: AuthRequest, res: Response) {
    try {
        const usuarioId = req.usuario!.id
        const grupos = await grupoService.listarMeusGrupos(usuarioId)
        return res.status(200).json(grupos)

    } catch (error) {
        console.error(error)
            return res.status(500).json({ error: 'Erro interno do servidor.' })
    }
}

export async function aprovarMembroController(req: AuthRequest, res: Response) {
  try {
    console.log('Requisição recebida para aprovar membro:', req.params) // Log para verificar os parâmetros recebidos
    const grupoId  = req.params.grupoId  as string
    const membroId = req.params.membroId as string
    const adminId  = req.usuario!.id
    const resultado = await grupoService.aprovarMembro(grupoId, membroId, adminId)
    return res.status(200).json(resultado)
  } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}

export async function rejeitarMembroController(req: AuthRequest, res: Response) {
  try {
    const grupoId  = req.params.grupoId  as string
    const membroId = req.params.membroId as string
    const adminId  = req.usuario!.id
    const resultado = await grupoService.rejeitarMembro(grupoId, membroId, adminId)
    return res.status(200).json(resultado)
  } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}
export async function verGrupoController(req: AuthRequest, res: Response) {
    try {
        const id = req.params.id as string
        const usuarioId = req.usuario!.id

        const grupo = await grupoService.verGrupo(id, usuarioId)
        return res.status(200).json(grupo)

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'GRUPO_NAO_ENCONTRADO') {
                return res.status(404).json({ error: 'Grupo não encontrado.' })
            }
            if (error.message === 'SEM_PERMISSAO') {
                return res.status(403).json({ error: 'Você não é membro deste grupo.' })
            }
        }
        console.error(error)
        return res.status(500).json({ error: 'Erro interno do servidor.' })
    }
}