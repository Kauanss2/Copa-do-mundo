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
exports.criarGrupoController = criarGrupoController;
exports.entrarNoGrupoController = entrarNoGrupoController;
exports.listarMeusGruposController = listarMeusGruposController;
exports.aprovarMembroController = aprovarMembroController;
exports.rejeitarMembroController = rejeitarMembroController;
exports.verGrupoController = verGrupoController;
const grupoService = __importStar(require("../services/grupo.service"));
async function criarGrupoController(req, res) {
    try {
        const { nome, edicaoId } = req.body;
        if (!nome || !edicaoId) {
            return res.status(400).json({ error: 'Nome e edição são obrigatórios.' });
        }
        const grupo = await grupoService.criarGrupo(nome, req.usuario.id, edicaoId);
        return res.status(201).json(grupo);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'GRUPO_NAO_ENCONTRADO') {
                return res.status(404).json({ error: 'Grupo não encontrado.' });
            }
            if (error.message === 'JA_E_MEMBRO') {
                return res.status(409).json({ error: 'Você já é membro deste grupo.' });
            }
        }
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}
async function entrarNoGrupoController(req, res) {
    try {
        const { codigo } = req.body; // Código de convite do grupo
        const usuarioId = req.usuario.id;
        console.log('ID do usuário:', usuarioId); // Log para verificar o ID do usuário
        console.log('Requisição recebida para entrar no grupo com código:', codigo); // Log para verificar o código recebido
        if (!codigo) {
            return res.status(400).json({ error: 'Código de convite é obrigatório.' });
        }
        console.log('Código recebido:', codigo); // Log para verificar o valor do código
        const grupo = await grupoService.entrarNoGrupo(codigo, usuarioId);
        return res.status(200).json({ message: 'Entrou no grupo com sucesso!', grupo });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'GRUPO_NAO_ENCONTRADO') {
                return res.status(404).json({ error: 'Grupo não encontrado.' });
            }
            if (error.message === 'JA_E_MEMBRO') {
                return res.status(409).json({ error: 'Você já é membro deste grupo.' });
            }
        }
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}
async function listarMeusGruposController(req, res) {
    try {
        const usuarioId = req.usuario.id;
        const grupos = await grupoService.listarMeusGrupos(usuarioId);
        return res.status(200).json(grupos);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}
async function aprovarMembroController(req, res) {
    try {
        console.log('Requisição recebida para aprovar membro:', req.params); // Log para verificar os parâmetros recebidos
        const grupoId = req.params.grupoId;
        const membroId = req.params.membroId;
        const adminId = req.usuario.id;
        const resultado = await grupoService.aprovarMembro(grupoId, membroId, adminId);
        return res.status(200).json(resultado);
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}
async function rejeitarMembroController(req, res) {
    try {
        const grupoId = req.params.grupoId;
        const membroId = req.params.membroId;
        const adminId = req.usuario.id;
        const resultado = await grupoService.rejeitarMembro(grupoId, membroId, adminId);
        return res.status(200).json(resultado);
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}
async function verGrupoController(req, res) {
    try {
        const id = req.params.id;
        const usuarioId = req.usuario.id;
        const grupo = await grupoService.verGrupo(id, usuarioId);
        return res.status(200).json(grupo);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'GRUPO_NAO_ENCONTRADO') {
                return res.status(404).json({ error: 'Grupo não encontrado.' });
            }
            if (error.message === 'SEM_PERMISSAO') {
                return res.status(403).json({ error: 'Você não é membro deste grupo.' });
            }
        }
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}
