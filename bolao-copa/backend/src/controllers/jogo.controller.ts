import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as jogoService from '../services/jogo.service'
export async function listarJogosController(req: AuthRequest, res: Response) {
    try {
        const { grupoId } = req.query as { grupoId?: string }
        const jogos = await jogoService.listarJogos(grupoId)
        return res.status(200).json(jogos)
    } catch(error) {
        console.error(error)
        return res.status(500).json({ error: 'Erro interno do servidor.' })
    }
}
