import bcrypt from 'bcryptjs'
import * as usuarioRepository from '../repositories/usuario.repository.js'

interface CriarUsuarioDTO {
    nome: string
    email: string
    password: string
}

export async function criarUsuario({ nome, email, password }: CriarUsuarioDTO) {
    if (await usuarioRepository.findByEmail(email)) {
        throw new Error('EMAIL_JA_CADASTRADO')
    }

    const senhaHash = await bcrypt.hash(password, 10)

    const usuario = await usuarioRepository.createUsuario({
        nome,
        email,
        senhaHash,
    })

    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        criadoEm: usuario.criadoEm,
    }
}

export async function listarUsuarios() {
    return usuarioRepository.findAllUsuarios()
}

export async function resetarSenha(usuarioId: string, novaSenha: string) {
    const senhaHash = await bcrypt.hash(novaSenha, 10)
    const usuario = await usuarioRepository.updateSenhaUsuario(usuarioId, senhaHash)

    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        mensagem: 'Senha atualizada com sucesso'
    }
}