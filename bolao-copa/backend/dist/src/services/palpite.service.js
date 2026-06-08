"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarPalpite = criarPalpite;
exports.editarPalpite = editarPalpite;
exports.listarMeusPalpites = listarMeusPalpites;
exports.exportarPalpitesGrupo = exportarPalpitesGrupo;
const palpiteRepository = __importStar(require("../repositories/palpite.repository"));
const PRAZO_FASE_GRUPOS = new Date('2026-06-15T23:59:59.999');
// Responsabilidade única: validar regras do jogo
function validarJogo(jogo) {
    if (!jogo.timeCasaId || !jogo.timeVisitanteId) {
        throw new Error('TIMES_NAO_DEFINIDOS');
    }
    if (jogo.fase === 'grupos') {
        if (Date.now() > PRAZO_FASE_GRUPOS.getTime()) {
            throw new Error('FORA_DO_PRAZO');
        }
        return;
    }
    const diffHoras = (jogo.inicioEm.getTime() - Date.now()) / (1000 * 60 * 60);
    if (diffHoras <= 2) {
        throw new Error('FORA_DO_PRAZO');
    }
}
// Responsabilidade única: criar palpite
async function criarPalpite({ usuarioId, jogoId, grupoId, golsCasa, golsVisitante, }) {
    const jogo = await palpiteRepository.findJogoById(jogoId);
    if (!jogo)
        throw new Error('JOGO_NAO_ENCONTRADO');
    validarJogo(jogo);
    const jaExiste = await palpiteRepository.findPalpiteExistente(usuarioId, jogoId, grupoId);
    if (jaExiste)
        throw new Error('PALPITE_JA_EXISTE');
    return palpiteRepository.createPalpite({
        usuarioId,
        jogoId,
        grupoId,
        golsCasa,
        golsVisitante,
    });
}
// Responsabilidade única: editar palpite
async function editarPalpite({ usuarioId, jogoId, grupoId, golsCasa, golsVisitante, }) {
    const jogo = await palpiteRepository.findJogoById(jogoId);
    if (!jogo)
        throw new Error('JOGO_NAO_ENCONTRADO');
    validarJogo(jogo);
    const palpite = await palpiteRepository.findPalpiteExistente(usuarioId, jogoId, grupoId);
    if (!palpite)
        throw new Error('PALPITE_NAO_ENCONTRADO');
    return palpiteRepository.updatePalpite(palpite.id, {
        golsCasa,
        golsVisitante,
    });
}
// Responsabilidade única: listar palpites
async function listarMeusPalpites(usuarioId, grupoId) {
    return palpiteRepository.findMeusPalpites(usuarioId, grupoId);
}
async function exportarPalpitesGrupo(grupoId) {
    const palpites = await palpiteRepository.findPalpitesGrupo(grupoId);
    return palpites.map(p => ({
        usuario: p.usuario.nome,
        email: p.usuario.email,
        timeCasa: p.jogo.timeCasa?.nome || 'N/A',
        timeVisitante: p.jogo.timeVisitante?.nome || 'N/A',
        palpiteCasa: p.golsCasa,
        palpiteVisitante: p.golsVisitante,
        resultadoCasa: p.jogo.golsCasa !== null ? p.jogo.golsCasa : '-',
        resultadoVisitante: p.jogo.golsVisitante !== null ? p.jogo.golsVisitante : '-',
        status: p.jogo.golsCasa === null ? 'Pendente' : 'Finalizado',
        pontos: p.pontosGanhos,
        dataJogo: new Date(p.jogo.inicioEm).toLocaleDateString('pt-BR'),
    }));
}
