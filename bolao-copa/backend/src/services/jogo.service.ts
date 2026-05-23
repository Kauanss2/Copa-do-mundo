import * as jogoRepository from '../repositories/jogo.repository'
import * as grupoRepository from '../repositories/grupo.repository'


export async function listarJogos(grupoId?: string) {
    let edicaoId: string | undefined

    if (grupoId) {
        const grupo = await grupoRepository.findById(grupoId)
        if (!grupo) throw new Error('GRUPO_NAO_ENCONTRADO')
        edicaoId = grupo.edicaoId
    }

    return jogoRepository.findAllJogos(edicaoId)
}

export async function buscarJogo(id: string) {
    const jogo = await jogoRepository.findJogoById(id)
    if (!jogo) throw new Error('JOGO_NAO_ENCONTRADO')
    return jogo
}