"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sincronizarJogos = sincronizarJogos;
const prisma_1 = require("../libs/prisma");
const pontuacao_service_1 = require("../services/pontuacao.service");
const STATUS_MAP = {
    FINISHED: 'encerrado',
    IN_PLAY: 'em_andamento',
    PAUSED: 'em_andamento',
    TIMED: 'agendado',
    SCHEDULED: 'agendado',
    CANCELLED: 'cancelado',
    POSTPONED: 'cancelado',
};
// IDs das competições: 2152 = Libertadores, 2000 = Copa do Mundo
const COMPETICOES = ['WC'];
async function sincronizarJogos() {
    console.log('🔄 Sincronizando jogos...');
    let total = 0;
    for (const competicaoId of COMPETICOES) {
        const url = `https://api.football-data.org/v4/competitions/${competicaoId}/matches`;
        console.log(`Buscando dados da competição ${competicaoId}...`);
        const res = await fetch(url, {
            headers: { 'X-Auth-Token': 'd8787e4307fe4bf9b6283822473d3d5E' },
        });
        if (!res.ok) {
            console.error(`Erro ao buscar competição ${competicaoId}: ${res.status}`);
            continue;
        }
        const data = await res.json();
        for (const m of data.matches) {
            const status = STATUS_MAP[m.status] ?? 'agendado';
            const golsCasa = status === 'encerrado' ? (m.score.fullTime.home ?? null) : null;
            const golsVisitante = status === 'encerrado' ? (m.score.fullTime.away ?? null) : null;
            await prisma_1.prisma.jogo.updateMany({
                where: { apiId: String(m.id) },
                data: { status, golsCasa, golsVisitante },
            });
            total++;
        }
        await (0, pontuacao_service_1.calcularTodasPontuacoes)();
        console.log(`✓ Competição ${competicaoId} sincronizada`);
    }
    console.log(`✓ ${total} jogos atualizados`);
}
if (require.main === module) {
    sincronizarJogos()
        .then(() => prisma_1.prisma.$disconnect())
        .catch(e => {
        console.error(e);
        prisma_1.prisma.$disconnect();
        process.exit(1);
    });
}
