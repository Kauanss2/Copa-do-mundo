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
exports.criarGrupo = criarGrupo;
exports.entrarNoGrupo = entrarNoGrupo;
exports.aprovarMembro = aprovarMembro;
exports.rejeitarMembro = rejeitarMembro;
exports.listarMeusGrupos = listarMeusGrupos;
exports.verGrupo = verGrupo;
const grupoRepository = __importStar(require("../repositories/grupo.repository"));
const prisma_1 = require("../libs/prisma");
function gerarCodigo() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
async function gerarCodigoUnico() {
    let codigo = gerarCodigo();
    let existe = await grupoRepository.findByCodigo(codigo);
    while (existe) {
        codigo = gerarCodigo();
        existe = await grupoRepository.findByCodigo(codigo);
    }
    return codigo;
}
async function criarGrupo(nome, usuarioId, edicaoId) {
    // Valida se a edição existe
    const edicao = await prisma_1.prisma.edicaoCampeonato.findUnique({
        where: { id: edicaoId },
    });
    if (!edicao)
        throw new Error('EDICAO_NAO_ENCONTRADA');
    const codigoConvite = await gerarCodigoUnico();
    const grupo = await grupoRepository.createGrupo({
        nome,
        codigoConvite,
        criadoPorId: usuarioId,
        edicaoId, // ✅ vem do usuário agora
    });
    await grupoRepository.createMembro({
        grupoId: grupo.id,
        usuarioId: usuarioId,
        papel: 'admin',
        status: 'aprovado',
    });
    return grupo;
}
async function entrarNoGrupo(codigo, usuarioId) {
    const grupo = await grupoRepository.findByCodigo(codigo);
    if (!grupo)
        throw new Error('GRUPO_NAO_ENCONTRADO');
    const jaExiste = await grupoRepository.findMembroExistente(grupo.id, usuarioId);
    if (jaExiste) {
        // Pode estar pendente ou já aprovado
        if (jaExiste.status === 'pendente')
            throw new Error('JA_ESTA_PENDENTE');
        throw new Error('JA_E_MEMBRO');
    }
    // Entra como pendente — aguarda aprovação do admin
    await grupoRepository.createMembro({
        grupoId: grupo.id,
        usuarioId: usuarioId,
        papel: 'membro',
        status: 'pendente',
    });
    return { mensagem: 'Solicitação enviada. Aguarde aprovação do administrador.' };
}
async function aprovarMembro(grupoId, membroId, adminId) {
    await verificarAdmin(grupoId, adminId);
    const membro = await grupoRepository.findMembroExistente(grupoId, membroId);
    if (!membro)
        throw new Error('MEMBRO_NAO_ENCONTRADO');
    if (membro.status !== 'pendente')
        throw new Error('MEMBRO_NAO_PENDENTE');
    return grupoRepository.atualizarStatusMembro(grupoId, membroId, 'aprovado');
}
async function rejeitarMembro(grupoId, membroId, adminId) {
    await verificarAdmin(grupoId, adminId);
    const membro = await grupoRepository.findMembroExistente(grupoId, membroId);
    if (!membro)
        throw new Error('MEMBRO_NAO_ENCONTRADO');
    if (membro.status !== 'pendente')
        throw new Error('MEMBRO_NAO_PENDENTE');
    // Rejeitar = apaga o registro completamente
    await grupoRepository.deletarMembro(grupoId, membroId);
    return { mensagem: 'Solicitação rejeitada.' };
}
// Helper interno
async function verificarAdmin(grupoId, usuarioId) {
    const admin = await grupoRepository.findMembroExistente(grupoId, usuarioId);
    if (!admin || admin.papel !== 'admin')
        throw new Error('SEM_PERMISSAO');
}
async function listarMeusGrupos(usuarioId) {
    const membros = await grupoRepository.findGruposByUsuario(usuarioId);
    return membros.map(m => ({
        id: m.grupo.id,
        nome: m.grupo.nome,
        codigoConvite: m.grupo.codigoConvite,
        edicaoId: m.grupo.edicaoId, // ← estava faltando
        papel: m.papel,
        status: m.status,
        pontuacao: m.pontuacaoTotal,
        totalMembros: m.grupo._count.membros,
        criadoEm: m.grupo.criadoEm,
    }));
}
async function verGrupo(grupoId, usuarioId) {
    const grupo = await grupoRepository.findById(grupoId);
    if (!grupo)
        throw new Error('GRUPO_NAO_ENCONTRADO');
    const membro = await grupoRepository.findMembroExistente(grupoId, usuarioId);
    if (!membro || membro.status !== 'aprovado')
        throw new Error('SEM_PERMISSAO');
    // Retorna no mesmo formato que listarMeusGrupos
    return {
        id: grupo.id,
        nome: grupo.nome,
        codigoConvite: grupo.codigoConvite,
        edicaoId: grupo.edicaoId, // ← essencial pro GrupoDetalhe
        papel: membro.papel,
        status: membro.status,
        pontuacao: membro.pontuacaoTotal,
        totalMembros: grupo.membros.length,
        membros: grupo.membros, // ← necessário pro ranking/membros
    };
}
