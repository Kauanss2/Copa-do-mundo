"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const usuario_routes_1 = __importDefault(require("./src/routes/usuario.routes"));
const loginAuth_routes_1 = __importDefault(require("./src/routes/auth/loginAuth.routes"));
const grupo_routes_1 = __importDefault(require("./src/routes/grupo.routes"));
const palpite_routes_1 = __importDefault(require("./src/routes/palpite.routes"));
const jogo_routes_1 = __importDefault(require("./src/routes/jogo.routes"));
const prisma_1 = require("./src/libs/prisma");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3333;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rotas públicas
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
app.use('/usuarios', usuario_routes_1.default);
app.use('/auth', loginAuth_routes_1.default);
app.use('/grupos', grupo_routes_1.default);
app.use('/palpites', palpite_routes_1.default);
app.use('/jogos', jogo_routes_1.default);
app.get('/edicoes', async (req, res) => {
    const edicoes = await prisma_1.prisma.edicaoCampeonato.findMany({
        orderBy: { ano: 'desc' },
        select: { id: true, nome: true, ano: true },
    });
    return res.json(edicoes);
});
const sync_jogos_1 = require("./src/script/sync-jogos");
// Rota protegida por chave secreta — só o Railway chama
app.post('/sync/jogos', async (req, res) => {
    const chave = req.headers['x-sync-key'];
    if (chave !== process.env.SYNC_SECRET) {
        return res.status(401).json({ error: 'Não autorizado' });
    }
    try {
        await (0, sync_jogos_1.sincronizarJogos)();
        return res.json({ ok: true, hora: new Date().toISOString() });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Erro ao sincronizar' });
    }
});
const pontuacao_service_1 = require("./src/services/pontuacao.service");
app.post('/sync/pontuacao', async (req, res) => {
    const chave = req.headers['x-sync-key'];
    if (chave !== process.env.SYNC_SECRET) {
        return res.status(401).json({ error: 'Não autorizado' });
    }
    try {
        await (0, pontuacao_service_1.calcularTodasPontuacoes)();
        return res.json({ ok: true });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Erro ao calcular pontuação' });
    }
});
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
