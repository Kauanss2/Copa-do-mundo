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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarUsuario = criarUsuario;
exports.listarUsuarios = listarUsuarios;
exports.resetarSenha = resetarSenha;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const usuarioRepository = __importStar(require("../repositories/usuario.repository.js"));
async function criarUsuario({ nome, email, password }) {
    if (await usuarioRepository.findByEmail(email)) {
        throw new Error('EMAIL_JA_CADASTRADO');
    }
    const senhaHash = await bcryptjs_1.default.hash(password, 10);
    const usuario = await usuarioRepository.createUsuario({
        nome,
        email,
        senhaHash,
    });
    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        criadoEm: usuario.criadoEm,
    };
}
async function listarUsuarios() {
    return usuarioRepository.findAllUsuarios();
}
async function resetarSenha(usuarioId, novaSenha) {
    const senhaHash = await bcryptjs_1.default.hash(novaSenha, 10);
    const usuario = await usuarioRepository.updateSenhaUsuario(usuarioId, senhaHash);
    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        mensagem: 'Senha atualizada com sucesso'
    };
}
