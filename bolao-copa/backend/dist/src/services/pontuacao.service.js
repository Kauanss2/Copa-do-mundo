"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularPontuacaoJogo = calcularPontuacaoJogo;
exports.calcularTodasPontuacoes = calcularTodasPontuacoes;
const prisma_1 = require("../libs/prisma");
function calcularPontos(palpiteCasa, palpiteVisitante, golsCasa, golsVisitante) {
    // Placar exato
    if (palpiteCasa === golsCasa && palpiteVisitante === golsVisitante) {
        return 30;
    }
    // Acertou vencedor ou empate
    const vencedorPalpite = palpiteCasa > palpiteVisitante ? 'casa' :
        palpiteCasa < palpiteVisitante ? 'visitante' : 'empate';
    const vencedorReal = golsCasa > golsVisitante ? 'casa' :
        golsCasa < golsVisitante ? 'visitante' : 'empate';
    if (vencedorPalpite === vencedorReal)
        return 15;
    return 0;
}
async function calcularPontuacaoJogo(jogoId) {
    // Busca o jogo
    const jogo = await prisma_1.prisma.jogo.findUnique({ where: { id: jogoId } });
    if (!jogo || jogo.status !== 'encerrado')
        return;
    if (jogo.golsCasa === null || jogo.golsVisitante === null)
        return;
    // Busca todos os palpites deste jogo
    const palpites = await prisma_1.prisma.palpite.findMany({
        where: { jogoId },
    });
    for (const palpite of palpites) {
        const pontos = calcularPontos(palpite.golsCasa, palpite.golsVisitante, jogo.golsCasa, jogo.golsVisitante);
        // Atualiza pontos do palpite
        await prisma_1.prisma.palpite.update({
            where: { id: palpite.id },
            data: { pontosGanhos: pontos },
        });
        // Atualiza pontuação total do membro no grupo
        const totalPontos = await prisma_1.prisma.palpite.aggregate({
            where: { usuarioId: palpite.usuarioId, grupoId: palpite.grupoId },
            _sum: { pontosGanhos: true },
        });
        await prisma_1.prisma.membroGrupo.updateMany({
            where: { usuarioId: palpite.usuarioId, grupoId: palpite.grupoId },
            data: { pontuacaoTotal: totalPontos._sum.pontosGanhos ?? 0 },
        });
    }
    console.log(`✓ Pontuação calculada para jogo ${jogoId} — ${palpites.length} palpites`);
}
async function calcularTodasPontuacoes() {
    // Busca todos os jogos encerrados
    const jogos = await prisma_1.prisma.jogo.findMany({
        where: { status: 'encerrado' },
    });
    console.log(`🏆 Calculando pontuação de ${jogos.length} jogos encerrados...`);
    for (const jogo of jogos) {
        await calcularPontuacaoJogo(jogo.id);
    }
    console.log('✓ Pontuações atualizadas!');
}
if (require.main === module) {
    calcularTodasPontuacoes()
        .then(() => prisma_1.prisma.$disconnect())
        .catch(e => { console.error(e); prisma_1.prisma.$disconnect(); process.exit(1); });
}
