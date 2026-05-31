import { prisma } from '../libs/prisma'
import libertadores from './copa2026.json'

const STATUS_MAP: Record<string, string> = {
  FINISHED:  'encerrado',
  IN_PLAY:   'em_andamento',
  PAUSED:    'em_andamento',
  TIMED:     'agendado',
  SCHEDULED: 'agendado',
  CANCELLED: 'cancelado',
  POSTPONED: 'cancelado',
}

async function atualizar() {
  console.log('🔄 Atualizando jogos da Libertadores...')
  let atualizados = 0

  for (const m of (libertadores as any).matches) {
    const status        = STATUS_MAP[m.status] ?? 'agendado'
    const golsCasa      = status === 'encerrado' ? (m.score.fullTime.home ?? null) : null
    const golsVisitante = status === 'encerrado' ? (m.score.fullTime.away ?? null) : null

    await prisma.jogo.updateMany({
      where: { apiId: String(m.id) },
      data:  { status, golsCasa, golsVisitante },
    })

    atualizados++
  }

  console.log(`✓ ${atualizados} jogos atualizados`)
  await prisma.$disconnect()
}

atualizar().catch(e => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})