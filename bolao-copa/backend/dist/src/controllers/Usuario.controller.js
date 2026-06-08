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
exports.createUserController = createUserController;
exports.getAllUsersController = getAllUsersController;
exports.resetPasswordController = resetPasswordController;
const usuarioService = __importStar(require("../services/Usuario.service"));
async function createUserController(req, res) {
    try {
        const { nome, email, password } = req.body;
        if (!nome || !email || !password) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
        }
        const usuario = await usuarioService.criarUsuario({ nome, email, password });
        return res.status(201).json(usuario);
    }
    catch (error) {
        if (error instanceof Error && error.message === 'EMAIL_JA_CADASTRADO') {
            return res.status(409).json({ error: 'Este email já está cadastrado.' });
        }
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}
async function getAllUsersController(req, res) {
    try {
        const usuarios = await usuarioService.listarUsuarios();
        return res.status(200).json(usuarios);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}
async function resetPasswordController(req, res) {
    try {
        const token = req.headers['x-admin-token'];
        const adminToken = process.env.ADMIN_RESET_TOKEN;
        if (!token || token !== adminToken) {
            return res.status(401).json({ error: 'Token inválido ou ausente.' });
        }
        const { usuarioId, novaSenha } = req.body;
        if (!usuarioId || !novaSenha) {
            return res.status(400).json({ error: 'usuarioId e novaSenha são obrigatórios.' });
        }
        if (novaSenha.length < 6) {
            return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
        }
        const usuario = await usuarioService.resetarSenha(usuarioId, novaSenha);
        return res.status(200).json(usuario);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}
