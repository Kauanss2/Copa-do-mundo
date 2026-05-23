import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as authRepository from '../repositories/auth.repository'

interface LoginDTO {
    email: string
    password: string
}

export async function login({ email, password }: LoginDTO) {
    // 1. Busca o usuário pelo email
    const usuario = await authRepository.findByEmail(email)
    if (!usuario) {
        throw new Error('CREDENCIAIS_INVALIDAS')
    }

    // 2. Compara a senha com o hash salvo no banco
    const senhaCorreta = await bcrypt.compare(password, usuario.senhaHash)
    if (!senhaCorreta) {
        throw new Error('CREDENCIAIS_INVALIDAS')
    }

    // 3. Gera o token JWT com id e email, válido por 7 dias
    const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    )

    return {
        token,
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
        }
    }
}