import { prisma } from '../libs/prisma'

function calcularPontos(
  palpiteCasa: number,
  palpiteVisitante: number,
  golsCasa: number,
  golsVisitante: number
): number {
  // Placar exato
  if (palpiteCasa === golsCasa && palpiteVisitante === golsVisitante) {
    return 30
  }

  // Acertou vencedor ou empate
  const vencedorPalpite =
    palpiteCasa > palpiteVisitante ? 'casa' :
    palpiteCasa < palpiteVisitante ? 'visitante' : 'empate'

  const vencedorReal =
    golsCasa > golsVisitante ? 'casa' :
    golsCasa < golsVisitante ? 'visitante' : 'empate'

  if (vencedorPalpite === vencedorReal) return 15

  return 0
}

export async function calcularPontuacaoJogo(jogoId: string) {
  // Busca o jogo
  const jogo = await prisma.jogo.findUnique({ where: { id: jogoId } })
  if (!jogo || jogo.status !== 'encerrado') return
  if (jogo.golsCasa === null || jogo.golsVisitante === null) return

  // Busca todos os palpites deste jogo
  const palpites = await prisma.palpite.findMany({
    where: { jogoId },
  })

  for (const palpite of palpites) {
    const pontos = calcularPontos(
      palpite.golsCasa,
      palpite.golsVisitante,
      jogo.golsCasa,
      jogo.golsVisitante
    )

    // Atualiza pontos do palpite
    await prisma.palpite.update({
      where: { id: palpite.id },
      data:  { pontosGanhos: pontos },
    })

    // Atualiza pontuação total do membro no grupo
    const totalPontos = await prisma.palpite.aggregate({
      where:  { usuarioId: palpite.usuarioId, grupoId: palpite.grupoId },
      _sum:   { pontosGanhos: true },
    })

    await prisma.membroGrupo.updateMany({
      where: { usuarioId: palpite.usuarioId, grupoId: palpite.grupoId },
      data:  { pontuacaoTotal: totalPontos._sum.pontosGanhos ?? 0 },
    })
  }

  console.log(`✓ Pontuação calculada para jogo ${jogoId} — ${palpites.length} palpites`)
}

export async function calcularTodasPontuacoes() {
  // Busca todos os jogos encerrados
  const jogos = await prisma.jogo.findMany({
    where: { status: 'encerrado' },
  })

  console.log(`🏆 Calculando pontuação de ${jogos.length} jogos encerrados...`)

  for (const jogo of jogos) {
    await calcularPontuacaoJogo(jogo.id)
  }

  console.log('✓ Pontuações atualizadas!')
}

if (require.main === module) {
  calcularTodasPontuacoes()
    .then(() => prisma.$disconnect())
    .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })
}