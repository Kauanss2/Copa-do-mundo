import { Request, Response } from 'express'
import * as usuarioService from '../services/Usuario.service'

export async function createUserController(req: Request, res: Response) {
    try {
        const { nome, email, password } = req.body

        if (!nome || !email || !password) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' })
        }

        const usuario = await usuarioService.criarUsuario({ nome, email, password })
        return res.status(201).json(usuario)

    } catch (error) {
        if (error instanceof Error && error.message === 'EMAIL_JA_CADASTRADO') {
            return res.status(409).json({ error: 'Este email já está cadastrado.' })
        }
        console.error(error)
        return res.status(500).json({ error: 'Erro interno do servidor.' })
    }
}

export async function getAllUsersController(req: Request, res: Response) {
    try {
        const usuarios = await usuarioService.listarUsuarios()
        return res.status(200).json(usuarios)

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Erro interno do servidor.' })
    }
}