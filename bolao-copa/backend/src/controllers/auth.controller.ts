import { Request, Response } from 'express'
import * as authService from '../services/auth.service'

export async function loginController(req: Request, res: Response) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios.' })
        }

        const result = await authService.login({ email, password })
        return res.status(200).json(result)

    } catch (error) {
        if (error instanceof Error && error.message === 'CREDENCIAIS_INVALIDAS') {
            return res.status(401).json({ error: 'Email ou senha incorretos.' })
        }
        console.error(error)
        return res.status(500).json({ error: 'Erro interno do servidor.' })
    }
}