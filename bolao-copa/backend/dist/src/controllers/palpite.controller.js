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
exports.criarPalpiteController = criarPalpiteController;
exports.editarPalpiteController = editarPalpiteController;
exports.listarMeusPalpitesController = listarMeusPalpitesController;
exports.exportarPalpitesExcelController = exportarPalpitesExcelController;
const palpiteService = __importStar(require("../services/palpite.service"));
const exceljs_1 = __importDefault(require("exceljs"));
function validarBody(body) {
    const { jogoId, grupoId, golsCasa, golsVisitante } = body;
    if (!jogoId || !grupoId || golsCasa === undefined || golsVisitante === undefined) {
        throw new Error('CAMPOS_OBRIGATORIOS');
    }
    if (Number(golsCasa) < 0 || Number(golsVisitante) < 0) {
        throw new Error('GOLS_NEGATIVOS');
    }
}
function handleError(error, res) {
    if (error instanceof Error) {
        const erros = {
            CAMPOS_OBRIGATORIOS: [400, 'jogoId, grupoId, golsCasa e golsVisitante são obrigatórios.'],
            GOLS_NEGATIVOS: [400, 'Gols não podem ser negativos.'],
            JOGO_NAO_ENCONTRADO: [404, 'Jogo não encontrado.'],
            TIMES_NAO_DEFINIDOS: [400, 'Este jogo ainda não tem times definidos.'],
            FORA_DO_PRAZO: [400, 'Prazo encerrado. Para a fase de grupos, os palpites fecham em 15/06/2026. Para outras fases, o limite é 2 horas antes do início.'],
            PALPITE_JA_EXISTE: [409, 'Você já tem um palpite para este jogo neste grupo.'],
            PALPITE_NAO_ENCONTRADO: [404, 'Palpite não encontrado.'],
        };
        const found = erros[error.message];
        if (found)
            return res.status(found[0]).json({ error: found[1] });
    }
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
}
async function criarPalpiteController(req, res) {
    try {
        validarBody(req.body);
        const { jogoId, grupoId, golsCasa, golsVisitante } = req.body;
        const usuarioId = req.usuario.id;
        const palpite = await palpiteService.criarPalpite({
            usuarioId,
            jogoId,
            grupoId,
            golsCasa: Number(golsCasa),
            golsVisitante: Number(golsVisitante),
        });
        return res.status(201).json(palpite);
    }
    catch (error) {
        return handleError(error, res);
    }
}
async function editarPalpiteController(req, res) {
    try {
        validarBody(req.body);
        const { jogoId, grupoId, golsCasa, golsVisitante } = req.body;
        const usuarioId = req.usuario.id;
        const palpite = await palpiteService.editarPalpite({
            usuarioId,
            jogoId,
            grupoId,
            golsCasa: Number(golsCasa),
            golsVisitante: Number(golsVisitante),
        });
        return res.status(200).json(palpite);
    }
    catch (error) {
        return handleError(error, res);
    }
}
async function listarMeusPalpitesController(req, res) {
    try {
        const { grupoId } = req.query;
        if (!grupoId)
            return res.status(400).json({ error: 'grupoId é obrigatório.' });
        const palpites = await palpiteService.listarMeusPalpites(req.usuario.id, grupoId);
        return res.status(200).json(palpites);
    }
    catch (error) {
        return handleError(error, res);
    }
}
async function exportarPalpitesExcelController(req, res) {
    try {
        const grupoId = Array.isArray(req.params.grupoId) ? req.params.grupoId[0] : req.params.grupoId;
        if (!grupoId)
            return res.status(400).json({ error: 'grupoId é obrigatório.' });
        const palpites = await palpiteService.exportarPalpitesGrupo(grupoId);
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Palpites');
        worksheet.columns = [
            { header: 'Participante', key: 'usuario', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Data', key: 'dataJogo', width: 12 },
            { header: 'Time Casa', key: 'timeCasa', width: 18 },
            { header: 'Time Visitante', key: 'timeVisitante', width: 18 },
            { header: 'Palpite (Casa)', key: 'palpiteCasa', width: 14 },
            { header: 'Palpite (Visitante)', key: 'palpiteVisitante', width: 16 },
            { header: 'Resultado (Casa)', key: 'resultadoCasa', width: 15 },
            { header: 'Resultado (Visitante)', key: 'resultadoVisitante', width: 18 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Pontos', key: 'pontos', width: 10 },
        ];
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00C853' } };
        palpites.forEach(p => {
            const row = worksheet.addRow(p);
            if (p.status === 'Finalizado') {
                if (p.palpiteCasa === p.resultadoCasa && p.palpiteVisitante === p.resultadoVisitante) {
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                }
                else if (p.pontos > 0) {
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } };
                }
                else {
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCC' } };
                }
            }
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="palpites-grupo-${grupoId}.xlsx"`);
        await workbook.xlsx.write(res);
        return res.end();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao gerar Excel' });
    }
}
