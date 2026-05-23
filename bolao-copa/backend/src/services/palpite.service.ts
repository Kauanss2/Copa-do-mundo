import * as palpiteRepository from '../repositories/palpite.repository'

interface PalpiteDTO {
    usuarioId: string
    jogoId: string
    grupoId: string
    golsCasa: number
    golsVisitante: number
}

// Responsabilidade única: validar regras do jogo
function validarJogo(jogo: {
    timeCasaId: string | null
    timeVisitanteId: string | null
    inicioEm: Date
}) {
    if (!jogo.timeCasaId || !jogo.timeVisitanteId) {
        throw new Error('TIMES_NAO_DEFINIDOS')
    }

    const diffHoras = (jogo.inicioEm.getTime() - Date.now()) / (1000 * 60 * 60)
    if (diffHoras <= 2) {
        throw new Error('FORA_DO_PRAZO')
    }
}

// Responsabilidade única: criar palpite
export async function criarPalpite({
    usuarioId,
    jogoId,
    grupoId,
    golsCasa,
    golsVisitante,
}: PalpiteDTO) {
    const jogo = await palpiteRepository.findJogoById(jogoId)
    if (!jogo) throw new Error('JOGO_NAO_ENCONTRADO')

    validarJogo(jogo)

    const jaExiste = await palpiteRepository.findPalpiteExistente(
        usuarioId, jogoId, grupoId
    )
    if (jaExiste) throw new Error('PALPITE_JA_EXISTE')

    return palpiteRepository.createPalpite({
        usuarioId,
        jogoId,
        grupoId,
        golsCasa,
        golsVisitante,
    })
}

// Responsabilidade única: editar palpite
export async function editarPalpite({
    usuarioId,
    jogoId,
    grupoId,
    golsCasa,
    golsVisitante,
}: PalpiteDTO) {
    const jogo = await palpiteRepository.findJogoById(jogoId)
    if (!jogo) throw new Error('JOGO_NAO_ENCONTRADO')

    validarJogo(jogo)

    const palpite = await palpiteRepository.findPalpiteExistente(
        usuarioId, jogoId, grupoId
    )
    if (!palpite) throw new Error('PALPITE_NAO_ENCONTRADO')

    return palpiteRepository.updatePalpite(palpite.id, {
        golsCasa,
        golsVisitante,
    })
}

// Responsabilidade única: listar palpites
export async function listarMeusPalpites(usuarioId: string, grupoId: string) {
    return palpiteRepository.findMeusPalpites(usuarioId, grupoId)
}