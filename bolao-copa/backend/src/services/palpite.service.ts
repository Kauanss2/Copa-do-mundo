import * as palpiteRepository from '../repositories/palpite.repository'

interface PalpiteDTO {
    usuarioId: string
    jogoId: string
    grupoId: string
    golsCasa: number
    golsVisitante: number
}

const PRAZO_FASE_GRUPOS = new Date('2026-06-15T23:59:59.999')

// Responsabilidade única: validar regras do jogo
function validarJogo(jogo: {
    timeCasaId: string | null
    timeVisitanteId: string | null
    inicioEm: Date
    fase: string | null
}) {
    if (!jogo.timeCasaId || !jogo.timeVisitanteId) {
        throw new Error('TIMES_NAO_DEFINIDOS')
    }
    
const diffMinutos = (jogo.inicioEm.getTime() - Date.now()) / (1000 * 60);

if (diffMinutos <= 15) {
    throw new Error('FORA_DO_PRAZO');
}
    if (jogo.fase === 'grupos' && Date.now() > PRAZO_FASE_GRUPOS.getTime()) {
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

export async function exportarPalpitesGrupo(grupoId: string) {
    const palpites = await palpiteRepository.findPalpitesGrupo(grupoId)

    return palpites.map(p => ({
        usuario: p.usuario.nome,
        timeCasa: p.jogo.timeCasa?.nome || 'N/A',
        timeVisitante: p.jogo.timeVisitante?.nome || 'N/A',
        palpiteCasa: p.golsCasa,
        palpiteVisitante: p.golsVisitante,
        resultadoCasa: p.jogo.golsCasa !== null ? p.jogo.golsCasa : '-',
        resultadoVisitante: p.jogo.golsVisitante !== null ? p.jogo.golsVisitante : '-',
        status: p.jogo.golsCasa === null ? 'Pendente' : 'Finalizado',
        pontos: p.pontosGanhos,
        dataJogo: new Date(p.jogo.inicioEm).toLocaleDateString('pt-BR'),
    }))
}
