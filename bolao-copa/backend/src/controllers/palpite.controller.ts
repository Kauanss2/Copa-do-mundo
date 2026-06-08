import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as palpiteService from '../services/palpite.service'
import ExcelJS from 'exceljs'

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
      FORA_DO_PRAZO:         [400, 'Prazo encerrado. Para a fase de grupos, os palpites fecham em 15/06/2026. Para outras fases, o limite é 2 horas antes do início.'],
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

export async function exportarPalpitesExcelController(req: AuthRequest, res: Response) {
    try {
        const grupoId = Array.isArray(req.params.grupoId) ? req.params.grupoId[0] : req.params.grupoId
        if (!grupoId) return res.status(400).json({ error: 'grupoId é obrigatório.' })

        const palpites = await palpiteService.exportarPalpitesGrupo(grupoId)

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Palpites')

        worksheet.columns = [
            { header: 'Participante', key: 'usuario', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Data', key: 'dataJogo', width: 12 },
            { header: 'Time Casa', key: 'timeCasa', width: 18 },
            { header: 'Time Visitante', key: 'timeVisitante', width: 18 },
            { header: 'Palpite (Casa)', key: 'palpiteCasa', width: 14 },
            { header: 'Palpite (Visitante)', key: 'palpiteVisitante', width: 16 },
            { header: 'Resultado (Casa)', key: 'resultadoCasa', width: 15 },
            { header: 'Resultado (Visitante)', key: 'resultadoVisitante', width: 18 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Pontos', key: 'pontos', width: 10 },
        ]

        const headerRow = worksheet.getRow(1)
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00C853' } }

        palpites.forEach(p => {
            const row = worksheet.addRow(p)
            if (p.status === 'Finalizado') {
                if (p.palpiteCasa === p.resultadoCasa && p.palpiteVisitante === p.resultadoVisitante) {
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }
                } else if (p.pontos > 0) {
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } }
                } else {
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCC' } }
                }
            }
        })

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename="palpites-grupo-${grupoId}.xlsx"`)

        await workbook.xlsx.write(res as any)
        return res.end()

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Erro ao gerar Excel' })
    }
}