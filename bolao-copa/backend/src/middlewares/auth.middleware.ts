import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
    usuario?: {
        id: string
        email: string
    }
}

export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token não fornecido.' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: string
            email: string
        }

        req.usuario = { id: decoded.id, email: decoded.email }
        next()

    } catch {
        return res.status(401).json({ error: 'Token inválido ou expirado.' })
    }
}