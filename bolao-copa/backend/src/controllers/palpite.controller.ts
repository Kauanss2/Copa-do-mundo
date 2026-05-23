import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as palpiteService from '../services/palpite.service'

function validarBody(body: {
  jogoId?:        string
  grupoId?:       string
  golsCasa?:      number
  golsVisitante?: number
}) {
  const { jogoId, grupoId, golsCasa, golsVisitante } = body

  if (!jogoId || !grupoId || golsCasa === undefined || golsVisitante === undefined) {
    throw new Error('CAMPOS_OBRIGATORIOS')
  }
  if (Number(golsCasa) < 0 || Number(golsVisitante) < 0) {
    throw new Error('GOLS_NEGATIVOS')
  }
}

function handleError(error: unknown, res: Response) {
  if (error instanceof Error) {
    const erros: Record<string, [number, string]> = {
      CAMPOS_OBRIGATORIOS:   [400, 'jogoId, grupoId, golsCasa e golsVisitante são obrigatórios.'],
      GOLS_NEGATIVOS:        [400, 'Gols não podem ser negativos.'],
      JOGO_NAO_ENCONTRADO:   [404, 'Jogo não encontrado.'],
      TIMES_NAO_DEFINIDOS:   [400, 'Este jogo ainda não tem times definidos.'],
      FORA_DO_PRAZO:         [400, 'Prazo encerrado. O jogo começa em menos de 2 horas.'],
      PALPITE_JA_EXISTE:     [409, 'Você já tem um palpite para este jogo neste grupo.'],
      PALPITE_NAO_ENCONTRADO:[404, 'Palpite não encontrado.'],
    }

    const found = erros[error.message]
    if (found) return res.status(found[0]).json({ error: found[1] })
  }

  console.error(error)
  return res.status(500).json({ error: 'Erro interno do servidor.' })
}

export async function criarPalpiteController(req: AuthRequest, res: Response) {
  try {
    validarBody(req.body)

    const { jogoId, grupoId, golsCasa, golsVisitante } = req.body
    const usuarioId = req.usuario!.id

    const palpite = await palpiteService.criarPalpite({
      usuarioId,
      jogoId,
      grupoId,
      golsCasa:      Number(golsCasa),
      golsVisitante: Number(golsVisitante),
    })

    return res.status(201).json(palpite)

  } catch (error) {
    return handleError(error, res)
  }
}

export async function editarPalpiteController(req: AuthRequest, res: Response) {
  try {
    validarBody(req.body)

    const { jogoId, grupoId, golsCasa, golsVisitante } = req.body
    const usuarioId = req.usuario!.id

    const palpite = await palpiteService.editarPalpite({
      usuarioId,
      jogoId,
      grupoId,
      golsCasa:      Number(golsCasa),
      golsVisitante: Number(golsVisitante),
    })

    return res.status(200).json(palpite)

  } catch (error) {
    return handleError(error, res)
  }
}

export async function listarMeusPalpitesController(req: AuthRequest, res: Response) {
    try {
        const { grupoId } = req.query as { grupoId?: string }
        if (!grupoId) return res.status(400).json({ error: 'grupoId é obrigatório.' })

        const palpites = await palpiteService.listarMeusPalpites(req.usuario!.id, grupoId)
        return res.status(200).json(palpites)

    } catch (error) {
        return handleError(error, res)
    }
}